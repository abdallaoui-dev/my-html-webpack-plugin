import fs from "fs/promises"
import path from "path"
import crypto from "crypto"
import { Compiler, Stats } from "webpack"
import FileBundler from "file-bundler"
import htmlMinifier from "html-minifier-terser"
import { Options as htmlMinifierOptions } from "html-minifier-terser"
import sass from "sass"
import postcss from "postcss"
import autoprefixer from "autoprefixer"

export default class MyHtmlWebpackPlugin {
   private readonly name = "MyHtmlWebpackPlugin"
   private readonly fileDependencies = new Map<string, string[]>()
   private readonly options
   private logger!: WebpackLogger
   private readonly htmlFileBundler
   private stats!: Stats
   private isProductionMode = false

   constructor(options: MyHtmlWebpackPluginOptions) {
      this.options = options
      this.htmlFileBundler = new FileBundler({
         className: this.options.htmlIncludePrefixName || this.name,
         pattern: "include",
         includeProperties: this.options.htmlIncludeProperties
      })
   }

   public apply = (compiler: Compiler) => {
      this.logger = compiler.getInfrastructureLogger(this.name)
      
      compiler.hooks.done.tapAsync(this.name, async (stats: Stats, callback) => {
         this.stats = stats
         this.isProductionMode = this.stats.compilation.compiler.options.mode === "production"
         await this.handleExternalAssets()
         for (const [key, filePathNames] of this.fileDependencies) {
            filePathNames.forEach(filePathName => stats.compilation.fileDependencies.add(filePathName))
         }
         callback()
      })
   }

   private handleExternalAssets = async () => {

      try {

         const modifiedFile = this.getModifiedFile()

         if (modifiedFile) {

            for (const [key, filePathNames] of this.fileDependencies) {

               if (filePathNames.includes(modifiedFile)) {

                  const entryObject = this.options.entry[key] as MyHtmlWebpackPluginEntryObjectFB

                  if (entryObject.import.endsWith(".html")) {
                     this.bundleHtml(key, entryObject)
                  } else if (entryObject.import.endsWith(".scss")) {
                     this.bundleCss(key, entryObject)
                  }

               }
            }

            return
         }

         for (const key in this.options.entry) {
            const entryObject = this.options.entry[key]
            if ("srcPath" in entryObject && entryObject.destPath) {
               await this.copyMoveFolderAsync(entryObject.srcPath, entryObject.destPath)
            }
         }

         for (const key in this.options.entry) {
            const entryObject = this.options.entry[key]
            if (!("import" in entryObject) || !entryObject.filename ||!entryObject.import.endsWith(".scss")) continue
            await this.bundleCss(key, entryObject)
         }

         for (const key in this.options.entry) {
            const entryObject = this.options.entry[key]
            if (!("import" in entryObject) || !entryObject.filename || !entryObject.import.endsWith(".html")) continue
            await this.bundleHtml(key, entryObject)
         }
         
      } catch (error) {
         this.logger.error(error)
      }
   }

   private bundleHtml = async (key: string, entryObject: MyHtmlWebpackPluginEntryObjectFB) => {

      const bundleResults = this.htmlFileBundler.bundle(entryObject.import) as __bundleResults

      bundleResults.key = key

      if (this.isProductionMode) await this.minify(bundleResults)

      this.injectLinkTag(bundleResults)

      this.injectScriptTag(bundleResults)

      await this.output(entryObject.filename, bundleResults)
   }

   private readonly cssFileNameHashes = new Map<string, string>()

   private bundleCss = async (key: string, entryObject: MyHtmlWebpackPluginEntryObjectFB) => {

      const sassResult = sass.compile(entryObject.import, {
         style: this.isProductionMode ? "compressed" : undefined,
         alertColor: false
      })

      const bundleResults = { source: sassResult.css, filePathNames: [], key } as __bundleResults
      
      bundleResults.filePathNames = sassResult.loadedUrls.map(url => this.resolvePath([url.pathname]))

      if (this.isProductionMode) {
         bundleResults.source = postcss([autoprefixer]).process(bundleResults.source, {
            from: undefined
         }).css
      }

      let filename

      if (entryObject.filename.includes("[contenthash]")) {
         filename = entryObject.filename.replace(
            "[contenthash]",
            crypto.createHash("md5").update(bundleResults.source).digest("hex")
         )
         this.cssFileNameHashes.set(key, filename)
      }

      await this.output(filename || entryObject.filename, bundleResults)
   }

   private resolvePath = (paths: string[]) => {
      paths.forEach((p, i) => paths[i] = p.split(/[\\|\/]+/).filter(v => v).join("/"))
      return path.resolve(...paths)
   }

   private copyMoveFolderAsync = async (srcPath: string, destPath: string) => {
      try {
         const outputPath = this.options.outputPath || this.stats.compilation.outputOptions.path || "dist"
                  
         await this.makeDirIfNotExists(this.resolvePath([outputPath, destPath]))

         const files = await fs.readdir(srcPath)

         await Promise.all(
            files.map(async (file) => {
               const srcFile = this.resolvePath([srcPath, file])
               const destFile = this.resolvePath([outputPath, destPath, file])

               const filePathNameStats = await fs.stat(srcFile)

               if (filePathNameStats.isDirectory()) {
                  await this.copyMoveFolderAsync(srcFile, destFile)
               } else {
                  await fs.copyFile(srcFile, destFile)
               }

            })
         )

      } catch (error) {
         this.logger.error(error)
      }
   }

   private injectLinkTag = (bundleResults: __bundleResults) => {
      if (!this.options.htmlInjectCssLinkTag) return
      let index = -1
      if (this.options.htmlInjectCssLinkTag === "afterbegin") {
         index = bundleResults.source.indexOf(`<head>`) + 6
      } else {
         index = bundleResults.source.indexOf(`</head>`)
      }

      if (index === -1) return

      const key = bundleResults.key + "_css"

      const entryObject = this.options.entry[key]

      if (!entryObject || !("import" in entryObject) || !entryObject.filename) return

      const filename =  this.cssFileNameHashes.get(key) || entryObject.filename
      
      let tag = `<link rel="stylesheet" href="${filename}">`
      
      const linkTagAttributes = this.options.htmlCssLinkTagAttributes

      if (linkTagAttributes) {
         tag = `<link rel="stylesheet" href="${filename}" `

         for (const key in linkTagAttributes) {
            const att = linkTagAttributes[key]
            tag += typeof att === "string" ? `${key}="${att}" ` : `${key} `
         }

         tag = tag.replace(/\s+/g, " ").trim()
         tag += `>`
      }
      bundleResults.source = bundleResults.source.slice(0, index) + tag + bundleResults.source.slice(index)
   }

   private injectScriptTag = (bundleResults: __bundleResults) => {
      if (!this.options.htmlInjectScriptTag) return
      let index = -1
      if (this.options.htmlInjectScriptTag === "head") {
         index = bundleResults.source.indexOf(`</head>`)
      } else {
         index = bundleResults.source.lastIndexOf(`</body>`)
      }

      if (index === -1) return

      const chunk = this.stats.compilation.namedChunks.get(bundleResults.key)

      let filename

      if (chunk) {
         filename = Array.from(chunk.files)[0] || bundleResults.key + ".js"
      }

      let tag = `<script src="${filename}"></script>`
      
      const scriptTagAttributes = this.options.htmlScriptTagAttributes

      if (scriptTagAttributes) {
         tag = `<script `

         for (const key in scriptTagAttributes) {
            const att = scriptTagAttributes[key as "defer"]
            tag += typeof att === "string" ? `${key}="${att}" ` : `${key} `
         }

         tag += ` src="${filename}"></script>`
         tag = tag.replace(/\s+/g, " ")
      }

      bundleResults.source = bundleResults.source.slice(0, index) + tag + bundleResults.source.slice(index)
   }

   private getModifiedFile = () => {
      const modifiedFiles = this.stats.compilation.compiler.modifiedFiles
      if (!modifiedFiles) return null
      return [...modifiedFiles][0] || null
   }

   private minify = async (bundleResults: __bundleResults) => {

      const options = this.options.htmlMinifierOptions || {
         removeComments: true,
         removeAttributeQuotes: true,
         removeScriptTypeAttributes: true,
         removeStyleLinkTypeAttributes: true,
         removeRedundantAttributes: true,
         collapseWhitespace: true,
         keepClosingSlash: true,
         useShortDoctype: true,
         minifyCSS: true,
         minifyJS: true
      }
      
      bundleResults.source = await htmlMinifier.minify(bundleResults.source, options)
   }

   private output = async (filePathName: string, bundleResults: __bundleResults) => {
      this.fileDependencies.set(bundleResults.key, bundleResults.filePathNames)
      try {
         const outputPath = this.options.outputPath || this.stats.compilation.outputOptions.path || "dist"
         
         filePathName = this.resolvePath([outputPath, filePathName])
         
         const directory = path.dirname(filePathName)
         
         await this.makeDirIfNotExists(directory)

         await fs.writeFile(filePathName, bundleResults.source)

      } catch (e) {
         const error = e as Error
         this.logger.error(error)
      }
   }

   private fileExists = async (filePathName: string) => {
      try {
         await fs.access(filePathName)
         return true
      } catch (error) {
         const e = error as any
         if (e.code === "ENOENT") {
            return false
         }
         throw error
      }
   }

   private makeDirIfNotExists = async (filePathName: string) => {
      const fileExists = await this.fileExists(filePathName)

      if (fileExists) return
      
      await fs.mkdir(filePathName, { recursive: true })
   }

}

type MyHtmlWebpackPluginEntryObjectCopyMove = {
   srcPath: string
   destPath: string
}

type MyHtmlWebpackPluginEntryObjectFB = {
   import: string
   filename: string
}

type MyHtmlWebpackPluginEntryObject = {
   [k: string]: MyHtmlWebpackPluginEntryObjectFB | MyHtmlWebpackPluginEntryObjectCopyMove
}

type MyHtmlWebpackPluginOptions = {

   /**
    * html entry keys must match js entry keys
    * 
    * css entry keys must match html keys and end with _css
   */
   entry: MyHtmlWebpackPluginEntryObject

   outputPath?: string

   htmlMinifierOptions?: htmlMinifierOptions

   htmlIncludePrefixName?: string

   htmlInjectCssLinkTag?: "afterbegin" | "beforeend"

   htmlCssLinkTagAttributes?: {[k: string]: any}

   htmlInjectScriptTag?: "body" | "head"

   htmlScriptTagAttributes?: {[k: string]: any}

   htmlIncludeProperties?: {
      [k: string]: string
   }
}

type __bundleResults = {
   key: string;
   source: string;
   filePathNames: string[];
}

interface WebpackLogger {
	getChildLogger: (arg0: string | (() => string)) => WebpackLogger;
	error(...args: any[]): void;
	warn(...args: any[]): void;
	info(...args: any[]): void;
	log(...args: any[]): void;
	debug(...args: any[]): void;
	assert(assertion: any, ...args: any[]): void;
	trace(): void;
	clear(): void;
	status(...args: any[]): void;
	group(...args: any[]): void;
	groupCollapsed(...args: any[]): void;
	groupEnd(...args: any[]): void;
	profile(label?: any): void;
	profileEnd(label?: any): void;
	time(label?: any): void;
	timeLog(label?: any): void;
	timeEnd(label?: any): void;
	timeAggregate(label?: any): void;
	timeAggregateEnd(label?: any): void;
}
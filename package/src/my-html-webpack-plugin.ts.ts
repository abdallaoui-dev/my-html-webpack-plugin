import { Compiler, Stats } from "webpack"
import FileBundler from "file-bundler"
import htmlMinifier from "html-minifier"
import sass from "sass"
import fs from "fs/promises"
import path from "path"
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

                  const entry = this.options.entry[key] as MyHtmlWebpackPluginEntryObjectFB

                  if (entry.filePathName.endsWith(".html")) {
                     this.bundleHtml(key, entry)
                  } else if (entry.filePathName.endsWith(".scss")) {
                     this.bundleCss(key, entry)
                  }

               }
            }

            return
         }

         for (const key in this.options.entry) {
            const entry = this.options.entry[key]

            if ("filePath" in entry && entry.outputFilePath && !modifiedFile) {
               if (!modifiedFile) await this.copyMoveFolderAsync(entry.filePath, entry.outputFilePath)
               continue
            }

            if (!("filePathName" in entry) || !entry.outputFilePathName) continue
            
            if (entry.filePathName.endsWith(".html")) {
               await this.bundleHtml(key, entry)
               continue
            } else if (entry.filePathName.endsWith(".scss")) {
               await this.bundleCss(key, entry)
               continue
            }

         }
         
      } catch (error) {
         this.logger.error(error)
      }
   }

   private bundleHtml = async (key: string, entry: MyHtmlWebpackPluginEntryObjectFB) => {

      const bundleResults = this.htmlFileBundler.bundle(entry.filePathName) as __bundleResults

      bundleResults.key = key

      if (this.isProductionMode) this.minify(bundleResults)

      const chunk = this.stats.compilation.namedChunks.get(key)
      
      if (chunk) {
         const scriptFileName = Array.from(chunk.files)[0] || key + ".js"

         this.injectScript(bundleResults, scriptFileName)
      }

      await this.output(entry.outputFilePathName, bundleResults)
   }

   private bundleCss = async (key: string, entry: MyHtmlWebpackPluginEntryObjectFB) => {

      const sassResult = sass.compile(entry.filePathName, {
         style: this.isProductionMode ? "compressed" : undefined,
         alertColor: false
      })

      const bundleResults = { source: sassResult.css, filePathNames: [], key } as __bundleResults
      
      bundleResults.filePathNames = sassResult.loadedUrls.map(url => path.resolve(url.pathname.slice(1)))

      if (this.isProductionMode) {
         bundleResults.source = postcss([autoprefixer]).process(bundleResults.source, {
            from: undefined
         }).css
      }
      
      await this.output(entry.outputFilePathName, bundleResults)     
   }

   private copyMoveFolderAsync = async (filePath: string, outputFilePath: string) => {
      try {
         
         await this.makeDirIfNotExists(outputFilePath)

         const files = await fs.readdir(filePath)

         await Promise.all(
            files.map(async (file) => {
               const filePathName = path.join(filePath, file)
               const outputFilePathName = path.join(outputFilePath, file)

               const filePathNameStats = await fs.stat(filePathName)

               if (filePathNameStats.isDirectory()) {
                  await this.copyMoveFolderAsync(filePathName, outputFilePathName)
               } else {
                  await fs.copyFile(filePathName, outputFilePathName)
               }

            })
         )

      } catch (error) {
         this.logger.error(error)
      }
   }

   private injectScript = (bundleResults: __bundleResults, filename: string) => {
      if (!this.options.htmlInjectScriptTag) return
      let index = -1
      if (this.options.htmlInjectScriptTag === "head") {
         index = bundleResults.source.indexOf(`</head>`)
      } else {
         index = bundleResults.source.lastIndexOf(`</body>`)
      }

      if (index === -1) return

      let scriptTag = `<script src="${filename}"></script>`
      
      const scriptTagAttributes = this.options.htmlScriptTagAttributes

      if (scriptTagAttributes) {
         scriptTag = `<script `

         for (const key in scriptTagAttributes) {
            const att = scriptTagAttributes[key as "defer"]
            scriptTag += typeof att === "string" ? `${key}="${att}" ` : `${key} `
         }

         scriptTag += ` src="${filename}"></script>`
         scriptTag = scriptTag.replace(/\s+/g, " ")
      }

      bundleResults.source = bundleResults.source.slice(0, index) + scriptTag + bundleResults.source.slice(index)
   }

   private getModifiedFile = () => {
      const modifiedFiles = this.stats.compilation.compiler.modifiedFiles
      if (!modifiedFiles) return null
      return [...modifiedFiles][0] || null
   }

   private minify = (bundleResults: __bundleResults) => {
      bundleResults.source = htmlMinifier.minify(bundleResults.source, {
         removeComments: true,
         continueOnParseError: true,
         collapseWhitespace: true,
         keepClosingSlash: true,
         removeScriptTypeAttributes: true,
         removeStyleLinkTypeAttributes: true,
         useShortDoctype: true
      })
   }

   private output = async (outputFilePathName: string, bundleResults: __bundleResults) => {
      this.fileDependencies.set(bundleResults.key, bundleResults.filePathNames)
      try {
         outputFilePathName = path.resolve(outputFilePathName)
         
         const directory = path.dirname(outputFilePathName)
         
         await this.makeDirIfNotExists(directory)

         await fs.writeFile(outputFilePathName, bundleResults.source)

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
   filePath: string
   outputFilePath: string
}

type MyHtmlWebpackPluginEntryObjectFB = {
   filePathName: string
   outputFilePathName: string
}

type MyHtmlWebpackPluginEntryObject = {
   [k: string]: MyHtmlWebpackPluginEntryObjectFB | MyHtmlWebpackPluginEntryObjectCopyMove
}

type MyHtmlWebpackPluginOptions = {

   entry: MyHtmlWebpackPluginEntryObject

   htmlIncludePrefixName?: string

   /** html entry keys must match with js entry keys*/
   htmlInjectScriptTag?: "body" | "head"
   htmlScriptTagAttributes?: {async?: true, defer?: true, type?: string, id?: string}

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
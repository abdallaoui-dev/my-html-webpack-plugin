import { Compiler, Stats } from "webpack"
import FileBundler from "file-bundler"
import htmlMinifier from "html-minifier"
import sass from "sass"
import fs from "fs/promises"
import path from "path"

export default class MyHtmlWebpackPlugin {
   private readonly name = "MyHtmlWebpackPlugin"
   private readonly filePathNames = new Set<string>()
   private readonly options
   private logger!: WebpackLogger
   
   private readonly fileBundler

   constructor(options: MyHtmlWebpackPluginOptions) {
      this.options = options
      this.fileBundler = new FileBundler({
         className: this.options.htmlIncludePrefixName || this.name,
         pattern: "include",
         includeProperties: this.options.htmlIncludeProperties
      })
   }

   public apply(compiler: Compiler) {
      this.logger = compiler.getInfrastructureLogger(this.name)
      
      compiler.hooks.done.tapAsync(this.name, async (stats: Stats, callback) => {
         await this.handleExternalAssets(stats)
         stats.compilation.fileDependencies.addAll(this.filePathNames)
         callback()
      })
   }

   private async handleExternalAssets(stats: Stats) {

      try {
         const compilation = stats.compilation
         const compiler = compilation.compiler
   
         const modifiedFile = this.getModifiedFile(compiler)
   
         if (modifiedFile && !this.filePathNames.has(modifiedFile)) {
            return
         }
         
         const minify = compiler.options.mode === "production"
         
         for (const key in this.options.entry) {
            const target = this.options.entry[key]
            const isHtmlFilePathName = target.filePathName.endsWith(".html")
            const isScssFilePathName = target.filePathName.endsWith(".scss")
            const isScssModifiedFile = modifiedFile && modifiedFile.endsWith(".scss")
            
            if ((isHtmlFilePathName && !modifiedFile) || (isHtmlFilePathName && !isScssModifiedFile)) {

               const bundleResults = this.fileBundler.bundle(target.filePathName)
      
               if (minify) this.minify(bundleResults)
      
               const chunk = compilation.namedChunks.get(key)
               
               if (chunk) {
                  const scriptFileName = Array.from(chunk.files)[0] || key + ".js"
      
                  this.injectScript(bundleResults, scriptFileName)
               }
      
               await this.output(target.outputFilePathName, bundleResults)
            }
   
            if ((isScssFilePathName && !modifiedFile) || (isScssFilePathName && isScssModifiedFile)) {

               const sassResult = sass.compile(target.filePathName, {
                  style: minify ? "compressed" : undefined,
                  alertColor: false
               })

               const bundleResults = { source: sassResult.css, filePathNames: [] } as __bundleResults

               bundleResults.filePathNames = sassResult.loadedUrls.map(url => path.resolve(url.pathname.slice(1)))
               
               await this.output(target.outputFilePathName, bundleResults)
               
               // this.logger.info(sass.info)
            }
         }
         
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

   private getModifiedFile(compiler: Compiler) {
      const modifiedFiles = compiler.modifiedFiles
      if (!modifiedFiles) return null
      return [...modifiedFiles][0] || null
   }

   private minify(bundleResults: __bundleResults) {
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

   private async output(outputFilePathName: string, bundleResults: __bundleResults) {

      bundleResults.filePathNames.forEach(filePathName => {
         this.filePathNames.add(filePathName)
      })

      try {
         outputFilePathName = path.resolve(outputFilePathName)
         
         const directory = path.dirname(outputFilePathName)
         
         const fileExists = await this.fileExists(directory)

         if (!fileExists) {
            await fs.mkdir(directory, { recursive: true })
         }

         await fs.writeFile(outputFilePathName, bundleResults.source)

      } catch (e) {
         const error = e as Error
         this.logger.error(error)
      }
   }

   private async fileExists(filePathName: string) {
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

}

type MyHtmlWebpackPluginOptions = {

   entry: {
      [k: string]: {
         filePathName: string
         outputFilePathName: string
      }
   }

   htmlIncludePrefixName?: string

   /** html entry keys must match with js entry keys*/
   htmlInjectScriptTag?: "body" | "head"
   htmlScriptTagAttributes?: {async?: true, defer?: true, type?: string, id?: string}

   htmlIncludeProperties?: {
      [k: string]: string
   }
}


type __bundleResults = {
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
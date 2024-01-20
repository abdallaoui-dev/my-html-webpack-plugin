import { Compiler, Stats } from "webpack"
import FileBundler from "file-bundler"
import htmlMinifier from "html-minifier"
import fs from "fs"
import path from "path"

export default class MyHtmlWebpackPlugin {
   private readonly name = "MyHtmlWebpackPlugin"
   private readonly filePathNames = new Set<string>()
   private readonly options
   private logger!: WebpackLogger

   constructor(options: MyHtmlWebpackPluginOptions) {
      this.options = options
   }

   public apply(compiler: Compiler) {
      this.logger = compiler.getInfrastructureLogger(this.name)
      
      compiler.hooks.done.tap(this.name, (stats: Stats) => {

         this.handleExternalHtmlFiles(stats)

         stats.compilation.fileDependencies.addAll(this.filePathNames)
      })
   }

   private handleExternalHtmlFiles(stats: Stats) {

      const compilation = stats.compilation
      const compiler = compilation.compiler

      const modifiedFile = this.getModifiedFile(compiler)
      
      if (!this.options.output || !this.options.output.path) {
         this.logger.error(`the output path is missing.`)
         return
      }

      if (modifiedFile && !this.filePathNames.has(modifiedFile)) {
         return
      }

      const minify = compiler.options.mode === "production" || Boolean(this.options.minify)

      const fileBundler = new FileBundler({
         className: this.options.prefixName || this.name,
         pattern: "include",
         includeProperties: this.options.staticProperties
      })
      
      for (const key in this.options.entry) {
         const target = this.options.entry[key]
         
         // bundle html files
         const bundleResults = fileBundler.bundle(target.filePathName)
         this.filePathNames.clear()
         bundleResults.filePathNames.forEach(filePathName => {
            this.filePathNames.add(filePathName)
         })

         if (minify) this.minify(bundleResults)

         const chunk = compilation.namedChunks.get(key)
         
         if (chunk) {
            const scriptFileName = Array.from(chunk.files)[0] || key + ".js"

            this.injectScript(bundleResults, scriptFileName)
         }

         this.output(this.options.output.path, target.outputFilename, bundleResults)
      }
   }

   private injectScript = (bundleResults: __bundleResults, filename: string) => {
      if (!this.options.injectScriptTag) return
      let index = -1
      if (this.options.injectScriptTag === "head") {
         index = bundleResults.source.indexOf(`</head>`)
      } else {
         index = bundleResults.source.lastIndexOf(`</body>`)
      }

      if (index === -1) return

      let scriptTag = `<script src="${filename}"></script>`
      
      const scriptTagAttributes = this.options.scriptTagAttributes

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

   private output(pathname: string, filename: string, bundleResults: __bundleResults) {
      try {
         const filePathName = path.resolve(pathname, filename.replace(/^[\\\/]/g, ""))

         const directory = path.dirname(filePathName)

         const relativePathname = path.relative(process.cwd(), directory)

         if (!fs.existsSync(relativePathname)) {
            fs.mkdirSync(relativePathname, { recursive: true })
         }

         fs.writeFileSync(filePathName, bundleResults.source)
      } catch (e) {
         const error = e as Error
         this.logger.error(error)
      }
   }

}

type MyHtmlWebpackPluginOptions = {

   entry: {
      [k: string]: {
         filePathName: string
         outputFilename: string
      }
   }

   output: {
      path: string
   },

   prefixName?: string

   minify?: boolean

   /** html entry keys must match with js entry keys*/
   injectScriptTag?: "body" | "head"
   scriptTagAttributes?: {async?: true, defer?: true, type?: string, id?: string}

   staticProperties?: {
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
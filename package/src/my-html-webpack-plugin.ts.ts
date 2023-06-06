import { Compiler, Compilation, sources } from "webpack"
import FileBundler from "file-bundler"
import htmlMinifier from "html-minifier"
import fs from "fs"
import path from "path"
import Logger from "./logger"

type __my_html_webpack_plugin_options = {

   entry: {
      [k: string]: {
         filePathName: string
         outputFilename: string
      }
   }

   output: {
      path: string
      exclude?: string
   },

   includePrefixName?: string

   jsSource?: {
      watchFilePathNames: true
      rootDir: string
   }

   /** defaults to auto when it's undefined*/
   minify?: boolean


   includeProperties?: {
      [k: string]: string
   }
}


export default class MyHtmlWebpackPlugin {
   private name = "MyHtmlWebpackPlugin"
   private filePathNames = new Set<string>()
   private options

   constructor(options: __my_html_webpack_plugin_options) {
      this.options = options
   }

   public apply(compiler: Compiler) {

      compiler.hooks.compilation.tap(this.name, (compilation) => {
         compilation.hooks.processAssets.tap(this.name, () => {
            this.handleCompilationAssets(compiler, compilation)
         })
      })
   }

   private handleExternalHtmlFiles(compiler: Compiler, compilation: Compilation) {

      const modifiedFile = this.getModifiedFile(compiler)

      if (!this.options.output || !this.options.output.path) {
         Logger.error(this.name, `the output path is missing.`)
         return
      }

      if (modifiedFile && !modifiedFile.endsWith(".html")) {
         return
      }

      if (modifiedFile && this.options.output.exclude && modifiedFile.includes(this.options.output.exclude)) {
         return
      }

      const minify = this.options.minify === undefined ? compiler.options.mode === "production" : Boolean(this.options.minify)

      const fileBundler = new FileBundler({
         className: this.options.includePrefixName || this.name,
         pattern: "include",
         includeProperties: this.options.includeProperties
      })

      for (const key in this.options.entry) {
         const target = this.options.entry[key]

         let { source, filePathNames } = fileBundler.bundle(target.filePathName)

         filePathNames.forEach(filePathName => {
            this.filePathNames.add(filePathName)
         })

         if (minify) source = this.minify(source)

         this.output(this.options.output.path, target.outputFilename, source)
      }
   }

   private handleCompilationAssets = (compiler: Compiler, compilation: Compilation) => {
      
      this.handleExternalHtmlFiles(compiler, compilation)

      if (this.options.jsSource && this.options.jsSource.watchFilePathNames) {
         this.injectHtmlToJsSource(compiler, compilation)
      }

      compilation.fileDependencies.addAll(this.filePathNames)
   }

   private injectHtmlToJsSource(compiler: Compiler, compilation: Compilation) {

      const modifiedFile = this.getModifiedFile(compiler)

      if (modifiedFile && !modifiedFile.match(/(\.js|\.ts|\.html)$/)) {
         return
      } 

      const fileBundler = new FileBundler({
         className: this.options.includePrefixName || this.name,
         pattern: "include",
         includeProperties: this.options.includeProperties
      })
      
      const assets = compilation.getAssets()

      assets.forEach((asset) => {
         if (!asset.name.match(/(\.js|\.ts)$/)) return

         let source = asset.source.source().toString()

         try {
            let sourceIsUpdated = false
            source = source.replace(fileBundler.includePattern, (match, g1, name) => {
               if (typeof name !== "string") throw new Error("something went wrong with regex")

               if (name.startsWith(".")) {
                  if (!this.options.includeProperties || typeof this.options.includeProperties !== "object") return ""
                  return encodeURI(this.options.includeProperties[name.replace(/^\./, "")] || "")
               }

               let filePathName = name.replace(/["'`()]+/g, "")

               filePathName = path.resolve(this.options.jsSource?.rootDir || "", filePathName.replace(/^[\\\/]*/g, ""))

               const { source, filePathNames } = fileBundler.bundle(filePathName)

               filePathNames.forEach(filePathname => {
                  this.filePathNames.add(filePathname)
               })

               sourceIsUpdated = true
               return encodeURI(this.minify(source))
            })

            if (sourceIsUpdated) compilation.updateAsset(asset.name, new sources.RawSource(source))

         } catch (error) {
            const e = error as Error
            Logger.error(this.name, e)
         }
      })
      
   }

   private getModifiedFile(compiler: Compiler) {
      const modifiedFiles = compiler.modifiedFiles
      if (!modifiedFiles) return null
      return [...modifiedFiles][0] || null
   }

   private minify(html: string) {
      return htmlMinifier.minify(html, {
         removeComments: true,
         continueOnParseError: true,
         collapseWhitespace: true,
         keepClosingSlash: true,
         removeScriptTypeAttributes: true,
         removeStyleLinkTypeAttributes: true,
         useShortDoctype: true
      })
   }

   private output(pathname: string, filename: string, source: string) {
      try {
         const filePathName = path.resolve(pathname, filename.replace(/^[\\\/]/g, ""))

         const directory = path.dirname(filePathName)

         const relativePathname = path.relative(process.cwd(), directory)

         if (!fs.existsSync(relativePathname)) {
            fs.mkdirSync(relativePathname, { recursive: true })
         }

         fs.writeFileSync(filePathName, source)
      } catch (e) {
         const error = e as Error
         Logger.error(this.name, error)
      }
   }

}
import { Compiler, Compilation, sources } from "webpack"
import FileBundler from "file-bundler"
import htmlMinifier from "html-minifier"
import fs from "fs"
import path from "path"
import Logger from "./logger"

type __my_html_webpack_plugin_options = {
   filePathName: string

   includerPrefixName?: string

   jsSource?: {
      watchFilePathNames: true
      rootDir: string
   }
   
   /** defaults to auto when it's undefined*/
   minify?: boolean

   output?: {
      path: string
      filename: string
      exclude?: string
   },

   includeProperties?: {
      [k: string]: string
   }
}


export default class MyHtmlWebpackPlugin {
   private name = "MyHtmlWebpackPlugin"
   private filenameCache: string[] = []
   private options

   constructor(options: __my_html_webpack_plugin_options) {
      this.options = options
   }

   public apply(compiler: Compiler) {
      
      compiler.hooks.compilation.tap(this.name, (compilation) => {
         compilation.hooks.processAssets.tap(
            {name: this.name, stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE},
            () => this.handleCompilationAssets(compiler, compilation)
         )
      })
   }

   private handleExternalHtmlFiles(compiler: Compiler, compilation: Compilation) {
      
      const modifiedFile = this.getFileModifiedFile(compiler)

      if (!this.options.output || !this.options.output.path || !this.options.output.filename) {
         Logger.error(this.name, `the output path || filename is missing.`)
         return
      }

      if (modifiedFile && !modifiedFile.endsWith(".html")) {
         this.filenameCache.forEach(filename => compilation.fileDependencies.add(filename))
         // console.log("donnot bundle html and keep watching")
         return
      }

      // exclude files that are included in js to prevent re-assembling the other files
      if (modifiedFile && this.options.output.exclude && modifiedFile.includes(this.options.output.exclude)) {
         return
      }

      const fileBundler = new FileBundler({
         className: this.options.includerPrefixName || this.name,
         pattern: "include",
         includeProperties: this.options.includeProperties
      })
      // console.log("bundle html and keep watching")
      const { source, filePathNames } = fileBundler.bundle(this.options.filePathName)
      
      this.filenameCache = filePathNames
      
      filePathNames.forEach(filePathName => compilation.fileDependencies.add(filePathName))

      const minify = this.options.minify === undefined ? compiler.options.mode === "production" : Boolean(this.options.minify)

      this.output(this.options.output.path, this.options.output.filename, source, minify)
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
   
   private output(pathname: string, filename: string, html: string, minify: boolean) {
      try {
         if (!fs.existsSync(pathname)) {
            fs.mkdirSync(pathname)
         }

         if (minify) html = this.minify(html)

         fs.writeFileSync(path.join(pathname, filename), html)
      } catch (e) {
         const error = e as Error
         Logger.error(this.name, error)
      }
   }

   private handleCompilationAssets = (compiler: Compiler, compilation: Compilation) => {

      this.handleExternalHtmlFiles(compiler, compilation)
      
      if (this.options.jsSource && this.options.jsSource.watchFilePathNames) {
         this.handleHtmlInjsFiles(compilation)
      }
   }

   private handleHtmlInjsFiles(compilation: Compilation) {
      const assets = compilation.getAssets()

      const fileBundler = new FileBundler({
         className: this.options.includerPrefixName || this.name,
         pattern: "include",
         includeProperties: this.options.includeProperties
      })
      
      assets.forEach((asset) => {
         const source = asset.source.source().toString()

         try {
            let text = source.replace(
               (fileBundler.includePattern),
               (match, g1, name) => {
                  if (typeof name !== "string") throw new Error("something went wrong with regex")

                  if (name.startsWith(".")) {
                     if (!this.options.includeProperties || typeof this.options.includeProperties !== "object") return ""
                     return encodeURI(this.options.includeProperties[name.replace(/^\./, "")] || "")
                  }

                  let filePathName = name.replace(/["'`()]+/g, "")
                  
                  filePathName = path.resolve(this.options.jsSource?.rootDir || "", filePathName.replace(/^[\\\/]*/g, ""))

                  const { source, filePathNames } = fileBundler.bundle(filePathName)

                  filePathNames.forEach(filePathname => compilation.fileDependencies.add(filePathname))

                  return encodeURI(this.minify(source))
               } 
            )

            const rawSource = new sources.RawSource(text)

            compilation.updateAsset(asset.name, rawSource)

         } catch (error) {
            const e = error as Error
            Logger.error(this.name, e)
         }
      })
   }

   private getFileModifiedFile(compiler: Compiler) {
      const modifiedFiles = compiler.modifiedFiles
      if (!modifiedFiles) return null
      return [...modifiedFiles][0] || null
   }
}
import { Compiler } from "webpack"
import { Options as htmlMinifierOptions } from "html-minifier-terser"

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
    * html entry keys must match js entry keys.
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

declare class MyHtmlWebpackPlugin {
   private options;
   constructor(options: MyHtmlWebpackPluginOptions);
   apply(compiler: Compiler): void
}
export = MyHtmlWebpackPlugin

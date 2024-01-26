import { Compiler } from "webpack"

type MyHtmlWebpackPluginEntryObjectPathOptions = {
   import: string
   filename: string
}

type MyHtmlWebpackPluginEntryObjectJsChunksOptions = {
   name: string
   inject?: "body" | "head",
   attributes?: {[k: string]: any}
}

type MyHtmlWebpackPluginEntryObjectCopyMove = {
   srcPath: string
   destPath: string
}

type MyHtmlWebpackPluginEntryObjectFB = Partial<MyHtmlWebpackPluginEntryObjectPathOptions> & {
   styles?: MyHtmlWebpackPluginEntryObjectPathOptions[]
   jschunks?: MyHtmlWebpackPluginEntryObjectJsChunksOptions[]
}

type MyHtmlWebpackPluginEntryObject = {
   [k: string]: MyHtmlWebpackPluginEntryObjectFB | MyHtmlWebpackPluginEntryObjectCopyMove
}

type MyHtmlWebpackPluginOptions = {

   entry: MyHtmlWebpackPluginEntryObject

   outputPath?: string

   htmlMinifyOptions?: {[k: string]: any}

   // cssMinifyOptions?: {[k: string]: any}

   htmlIncludePrefixName?: string

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

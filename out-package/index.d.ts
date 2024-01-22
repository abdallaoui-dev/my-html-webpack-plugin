import { Compiler } from "webpack";

type MyHtmlWebpackPluginEntryCopyMove = {
   filePath: string
   outputFilePath: string
}

type MyHtmlWebpackPluginEntry = {
   filePathName: string
   outputFilePathName: string
}

type MyHtmlWebpackPluginOptions = {

   entry: {
      [k: string]: MyHtmlWebpackPluginEntry & MyHtmlWebpackPluginEntryCopyMove
   }

   htmlIncludePrefixName?: string

   /** html entry keys must match with js entry keys*/
   htmlInjectScriptTag?: "body" | "head"
   htmlScriptTagAttributes?: {async?: true, defer?: true, type?: string, id?: string}

   htmlIncludeProperties?: {
      [k: string]: string
   }
}

declare class MyHtmlWebpackPlugin {
    private options;
    constructor(options: MyHtmlWebpackPluginOptions);
    apply(compiler: Compiler): void;
}
export = MyHtmlWebpackPlugin

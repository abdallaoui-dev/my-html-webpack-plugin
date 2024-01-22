import { Compiler } from "webpack";

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

declare class MyHtmlWebpackPlugin {
    private options;
    constructor(options: MyHtmlWebpackPluginOptions);
    apply(compiler: Compiler): void;
}
export = MyHtmlWebpackPlugin

import { Compiler } from "webpack";

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

declare class MyHtmlWebpackPlugin {
    private options;
    constructor(options: MyHtmlWebpackPluginOptions);
    apply(compiler: Compiler): void;
}
export = MyHtmlWebpackPlugin

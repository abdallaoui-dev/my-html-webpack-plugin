import { Compiler } from "webpack";

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

declare class MyHtmlWebpackPlugin {
    private options;
    constructor(options: MyHtmlWebpackPluginOptions);
    apply(compiler: Compiler): void;
}
export = MyHtmlWebpackPlugin

import { Compiler } from "webpack";
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

declare class MyHtmlWebpackPlugin {
    private options;
    constructor(options: __my_html_webpack_plugin_options);
    apply(compiler: Compiler): void;
}
export = MyHtmlWebpackPlugin

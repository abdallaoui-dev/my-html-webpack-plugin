import { Compiler } from "webpack";
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

declare class MyHtmlWebpackPlugin {
    private options;
    constructor(options: __my_html_webpack_plugin_options);
    apply(compiler: Compiler): void;
}
export = MyHtmlWebpackPlugin

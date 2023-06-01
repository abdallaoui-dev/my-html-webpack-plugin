import path from "path"
import { Configuration } from "webpack"
import nodeExternals from "webpack-node-externals"

const joinPath = (mypath: string) => path.join(__dirname, mypath)

const wconfig: Configuration = {
   
   mode: "development",
   devtool: false,
   watch: true,
   target: ["node", "es5"],
   externalsPresets: { node: true },
   externals: [nodeExternals()],

   entry: joinPath("src/my-html-webpack-plugin.ts"),

   output: {
      path: joinPath("../out-package"),
      filename: "index.js",
      library: {
         type: "umd",
         export: "default"
      }
   },

   module: {
      rules: [
         {
            test: /\.ts$/,
            use: {
               loader: "ts-loader"
            }
         },

      ]

   },

   resolve: {
      extensions: [".ts"],

   }
}

export default wconfig


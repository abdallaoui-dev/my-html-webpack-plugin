const path = require("path")
const MyHtmlWebpackPlugin = require("my-html-webpack-plugin")
const webpack = require("webpack")

const joinPath = (mypath) => path.join(__dirname, mypath)

const wconfig = {
   
   mode: "production",
   watch: true,

   entry: {
      index: joinPath("src/js/index.js"),
      about: joinPath("src/js/about.js"),
   },

   output: {
      path: joinPath("dist"),
      filename: "js/s.[contenthash].js",
      // filename: "js/[name].js",
      clean: true
   },

   plugins: [
      
      new MyHtmlWebpackPlugin({

         entry: {
            index: {
               filePathName: joinPath("src/html/index.html"),
               outputFilePathName: "dist/index.html"
            },
            indexStyles: {
               filePathName: joinPath("src/scss/app.scss"),
               outputFilePathName: "dist/css/style.css"
            },
            about: {
               filePathName: joinPath("src/html/about.html"),
               outputFilePathName: "dist/about.html"
            },

            images: {
               filePath: joinPath("src/images"),
               outputFilePath: "dist/images"
            }
         },
         
         // htmlIncludePrefixName: "myapp", // myapp.include("/file.html")

         htmlInjectScriptTag: "body",
         htmlScriptTagAttributes: {defer: true},

         htmlIncludeProperties: {
            title: "my website title",
            domainName: "domain name",
            meta: "<meta>",
            headScript: "<script></script>",
            bodyScript: "<script></script>"
         }
      })
   ],

   resolve: {
      extensions: [".js"],
   }
}
// webpack(wconfig, () => {
//    // console.log("hello")
// })

module.exports = wconfig


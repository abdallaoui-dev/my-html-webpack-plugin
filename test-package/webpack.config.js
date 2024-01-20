const path = require("path")
const MyHtmlWebpackPlugin = require("my-html-webpack-plugin")
// const webpack = require("webpack")

const joinPath = (mypath) => path.join(__dirname, mypath)

const wconfig = {
   
   mode: "development",
   watch: true,

   entry: {
      index: joinPath("src/js/index.js"),
      about: joinPath("src/js/about.js")
   },

   output: {
      path: joinPath("dist"),
      // filename: "js/[contenthash].js",
      filename: "js/[name].js",
      clean: true
   },

   plugins: [
      
      new MyHtmlWebpackPlugin({

         entry: {
            index: {
               filePathName: joinPath("src/html/index.html"),
               outputFilename: "index.html"
            },
            about: {
               filePathName: joinPath("src/html/about.html"),
               outputFilename: "about.html"
            }
         },

         output: {
            path: joinPath("dist")
         },
         
         // prefixName: "myapp", // myapp.include("/file.html")

         // minify: false,

         injectScriptTag: "body",
         // scriptTagAttributes: {defer: true},

         staticProperties: {
            title: "my website title",
            domainName: "domain name",
            meta: "<meta>",
            headScript: "<script></script>",
            bodyScript: "<script></script>"
         },
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


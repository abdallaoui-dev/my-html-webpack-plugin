const path = require("path")
const MyHtmlWebpackPlugin = require("my-html-webpack-plugin")

const joinPath = (mypath) => path.join(__dirname, mypath)

const wconfig = {
   
   mode: "development",
   devtool: false,
   watch: true,

   entry: {
      index: joinPath("src/js/index.js")
   },

   output: {
      path: joinPath("dist"),
      filename: "js/index.js"
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
            path: joinPath("dist"),
            exclude: joinPath("src/html/templates")
         },

         jsSource: {
            rootDir: joinPath("src/"),
            watchFilePathNames: true
         },
         
         // includerPrefixName: "myapp", // myapp.include("/file.html")

         // minify: false,

         includeProperties: {
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

module.exports = wconfig


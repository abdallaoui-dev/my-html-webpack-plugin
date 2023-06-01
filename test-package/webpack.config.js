const path = require("path")
const MyHtmlWebpackPlugin = require("my-html-webpack-plugin")

const joinPath = (mypath) => path.join(__dirname, mypath)

const wconfig = {
   
   mode: "development",
   devtool: false,
   watch: true,

   entry: joinPath("src/js/index.js"),

   output: {
      path: joinPath("dist/js"),
      filename: "index.js"
   },

   plugins: [
      new MyHtmlWebpackPlugin({
         filePathName: joinPath("src/html/index.html"),

         // jsSource: {
         //    rootDir: joinPath("src/"),
         //    watchFilePathNames: true
         // },
         
         // includerPrefixName: "myapp", // myapp.include("/file.html")

         // minify: false,
         
         output: {
            path: joinPath("dist"),
            filename: "index.html",
            exclude: joinPath("src/html/templates")
         },

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


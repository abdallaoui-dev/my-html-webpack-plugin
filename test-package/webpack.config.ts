import path from "path"
import MyHtmlWebpackPlugin from "my-html-webpack-plugin"
import { Configuration } from "webpack"

const joinPath = (mypath: string) => path.join(__dirname, mypath)

const wconfig: Configuration = {
   
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
            index_css: {
               import: joinPath("src/scss/index/app.scss"),
               filename: "css/[contenthash].css"
               // filename: "/css/index.css"
            },

            index: {
               import: joinPath("src/html/index.html"),
               filename: "index.html"
            },


            about_css: {
               import: joinPath("src/scss/about/app.scss"),
               filename: "css/[contenthash].css"
               // filename: "/css/about.css"
            },

            about: {
               import: joinPath("src/html/about.html"),
               filename: "/about.html"
            },

            images: {
               srcPath: joinPath("src/images"),
               destPath: "/images"
            }
         },
         
         outputPath: joinPath("dist"),

         htmlInjectCssLinkTag: "afterbegin",

         htmlCssLinkTagAttributes: {id: "base_css"},
         
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

export default wconfig


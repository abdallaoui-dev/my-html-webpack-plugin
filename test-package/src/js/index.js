
// this works if rootDir is defined in options 
const template = decodeURI(`MyHtmlWebpackPlugin.include("html/templates/sidebar-template.html")`)

const domainName = decodeURI(`MyHtmlWebpackPlugin.include.domainName`)

// if no rootDir the path should be absolute
// MyHtmlWebpackPlugin doesn't know comments
// const template = decodeURI(`MyHtmlWebpackPlugin//.\\include(C:/>>/>>/>>/>>/html/templates/sidebar-template.html)`)



console.log(template)
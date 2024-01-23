!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var r=t();for(var n in r)("object"==typeof exports?exports:e)[n]=r[n]}}(global,(function(){return function(){"use strict";var e={347:function(e,t,r){var n=this&&this.__awaiter||function(e,t,r,n){return new(r||(r=Promise))((function(i,s){function o(e){try{a(n.next(e))}catch(e){s(e)}}function u(e){try{a(n.throw(e))}catch(e){s(e)}}function a(e){var t;e.done?i(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(o,u)}a((n=n.apply(e,t||[])).next())}))},i=this&&this.__generator||function(e,t){var r,n,i,s,o={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return s={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(s[Symbol.iterator]=function(){return this}),s;function u(u){return function(a){return function(u){if(r)throw new TypeError("Generator is already executing.");for(;s&&(s=0,u[0]&&(o=0)),o;)try{if(r=1,n&&(i=2&u[0]?n.return:u[0]?n.throw||((i=n.return)&&i.call(n),0):n.next)&&!(i=i.call(n,u[1])).done)return i;switch(n=0,i&&(u=[2&u[0],i.value]),u[0]){case 0:case 1:i=u;break;case 4:return o.label++,{value:u[1],done:!1};case 5:o.label++,n=u[1],u=[0];continue;case 7:u=o.ops.pop(),o.trys.pop();continue;default:if(!((i=(i=o.trys).length>0&&i[i.length-1])||6!==u[0]&&2!==u[0])){o=0;continue}if(3===u[0]&&(!i||u[1]>i[0]&&u[1]<i[3])){o.label=u[1];break}if(6===u[0]&&o.label<i[1]){o.label=i[1],i=u;break}if(i&&o.label<i[2]){o.label=i[2],o.ops.push(u);break}i[2]&&o.ops.pop(),o.trys.pop();continue}u=t.call(e,o)}catch(e){u=[6,e],n=0}finally{r=i=0}if(5&u[0])throw u[1];return{value:u[0]?u[1]:void 0,done:!0}}([u,a])}}},s=this&&this.__values||function(e){var t="function"==typeof Symbol&&Symbol.iterator,r=t&&e[t],n=0;if(r)return r.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")},o=this&&this.__read||function(e,t){var r="function"==typeof Symbol&&e[Symbol.iterator];if(!r)return e;var n,i,s=r.call(e),o=[];try{for(;(void 0===t||t-- >0)&&!(n=s.next()).done;)o.push(n.value)}catch(e){i={error:e}}finally{try{n&&!n.done&&(r=s.return)&&r.call(s)}finally{if(i)throw i.error}}return o},u=this&&this.__spreadArray||function(e,t,r){if(r||2===arguments.length)for(var n,i=0,s=t.length;i<s;i++)!n&&i in t||(n||(n=Array.prototype.slice.call(t,0,i)),n[i]=t[i]);return e.concat(n||Array.prototype.slice.call(t))},a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var c=a(r(293)),l=a(r(375)),f=a(r(959)),h=a(r(292)),d=a(r(17)),p=a(r(261)),m=a(r(796));t.default=function(e){var t=this;this.name="MyHtmlWebpackPlugin",this.fileDependencies=new Map,this.isProductionMode=!1,this.apply=function(e){t.logger=e.getInfrastructureLogger(t.name),e.hooks.done.tapAsync(t.name,(function(e,r){return n(t,void 0,void 0,(function(){var t,n,u,a,c;return i(this,(function(i){switch(i.label){case 0:return this.stats=e,this.isProductionMode="production"===this.stats.compilation.compiler.options.mode,[4,this.handleExternalAssets()];case 1:i.sent();try{for(t=s(this.fileDependencies),n=t.next();!n.done;n=t.next())(u=o(n.value,2))[0],u[1].forEach((function(t){return e.compilation.fileDependencies.add(t)}))}catch(e){a={error:e}}finally{try{n&&!n.done&&(c=t.return)&&c.call(t)}finally{if(a)throw a.error}}return r(),[2]}}))}))}))},this.handleExternalAssets=function(){return n(t,void 0,void 0,(function(){var e,t,r,n,u,a,c,l,f,h,d,p,m;return i(this,(function(i){switch(i.label){case 0:if(i.trys.push([0,10,,11]),e=this.getModifiedFile()){try{for(t=s(this.fileDependencies),r=t.next();!r.done;r=t.next())n=o(r.value,2),f=n[0],n[1].includes(e)&&((h=this.options.entry[f]).filePathName.endsWith(".html")?this.bundleHtml(f,h):h.filePathName.endsWith(".scss")&&this.bundleCss(f,h))}catch(e){p={error:e}}finally{try{r&&!r.done&&(m=t.return)&&m.call(t)}finally{if(p)throw p.error}}return[2]}for(c in u=this.options.entry,a=[],u)a.push(c);l=0,i.label=1;case 1:return l<a.length?(c=a[l])in u?(f=c,"filePath"in(h=this.options.entry[f])&&h.outputFilePath&&!e?e?[3,3]:[4,this.copyMoveFolderAsync(h.filePath,h.outputFilePath)]:[3,4]):[3,8]:[3,9];case 2:i.sent(),i.label=3;case 3:return[3,8];case 4:return"filePathName"in h&&h.outputFilePathName?h.filePathName.endsWith(".html")?[4,this.bundleHtml(f,h)]:[3,6]:[3,8];case 5:return i.sent(),[3,8];case 6:return h.filePathName.endsWith(".scss")?[4,this.bundleCss(f,h)]:[3,8];case 7:return i.sent(),[3,8];case 8:return l++,[3,1];case 9:return[3,11];case 10:return d=i.sent(),this.logger.error(d),[3,11];case 11:return[2]}}))}))},this.bundleHtml=function(e,r){return n(t,void 0,void 0,(function(){var t,n,s;return i(this,(function(i){switch(i.label){case 0:return(t=this.htmlFileBundler.bundle(r.filePathName)).key=e,this.isProductionMode&&this.minify(t),(n=this.stats.compilation.namedChunks.get(e))&&(s=Array.from(n.files)[0]||e+".js",this.injectScript(t,s)),[4,this.output(r.outputFilePathName,t)];case 1:return i.sent(),[2]}}))}))},this.bundleCss=function(e,r){return n(t,void 0,void 0,(function(){var t,n;return i(this,(function(i){switch(i.label){case 0:return t=f.default.compile(r.filePathName,{style:this.isProductionMode?"compressed":void 0,alertColor:!1}),(n={source:t.css,filePathNames:[],key:e}).filePathNames=t.loadedUrls.map((function(e){return d.default.resolve(e.pathname.slice(1))})),this.isProductionMode&&(n.source=(0,p.default)([m.default]).process(n.source,{from:void 0}).css),[4,this.output(r.outputFilePathName,n)];case 1:return i.sent(),[2]}}))}))},this.copyMoveFolderAsync=function(e,r){return n(t,void 0,void 0,(function(){var t,s,o=this;return i(this,(function(u){switch(u.label){case 0:return u.trys.push([0,4,,5]),[4,this.makeDirIfNotExists(r)];case 1:return u.sent(),[4,h.default.readdir(e)];case 2:return t=u.sent(),[4,Promise.all(t.map((function(t){return n(o,void 0,void 0,(function(){var n,s;return i(this,(function(i){switch(i.label){case 0:return n=d.default.join(e,t),s=d.default.join(r,t),[4,h.default.stat(n)];case 1:return i.sent().isDirectory()?[4,this.copyMoveFolderAsync(n,s)]:[3,3];case 2:return i.sent(),[3,5];case 3:return[4,h.default.copyFile(n,s)];case 4:i.sent(),i.label=5;case 5:return[2]}}))}))})))];case 3:return u.sent(),[3,5];case 4:return s=u.sent(),this.logger.error(s),[3,5];case 5:return[2]}}))}))},this.injectScript=function(e,r){if(t.options.htmlInjectScriptTag){var n;if(-1!==(n="head"===t.options.htmlInjectScriptTag?e.source.indexOf("</head>"):e.source.lastIndexOf("</body>"))){var i='<script src="'.concat(r,'"><\/script>'),s=t.options.htmlScriptTagAttributes;if(s){for(var o in i="<script ",s){var u=s[o];i+="string"==typeof u?"".concat(o,'="').concat(u,'" '):"".concat(o," ")}i=(i+=' src="'.concat(r,'"><\/script>')).replace(/\s+/g," ")}e.source=e.source.slice(0,n)+i+e.source.slice(n)}}},this.getModifiedFile=function(){var e=t.stats.compilation.compiler.modifiedFiles;return e&&u([],o(e),!1)[0]||null},this.minify=function(e){e.source=l.default.minify(e.source,{removeComments:!0,continueOnParseError:!0,collapseWhitespace:!0,keepClosingSlash:!0,removeScriptTypeAttributes:!0,removeStyleLinkTypeAttributes:!0,useShortDoctype:!0})},this.output=function(e,r){return n(t,void 0,void 0,(function(){var t,n,s;return i(this,(function(i){switch(i.label){case 0:this.fileDependencies.set(r.key,r.filePathNames),i.label=1;case 1:return i.trys.push([1,4,,5]),e=d.default.resolve(e),t=d.default.dirname(e),[4,this.makeDirIfNotExists(t)];case 2:return i.sent(),[4,h.default.writeFile(e,r.source)];case 3:return i.sent(),[3,5];case 4:return n=i.sent(),s=n,this.logger.error(s),[3,5];case 5:return[2]}}))}))},this.fileExists=function(e){return n(t,void 0,void 0,(function(){var t;return i(this,(function(r){switch(r.label){case 0:return r.trys.push([0,2,,3]),[4,h.default.access(e)];case 1:return r.sent(),[2,!0];case 2:if("ENOENT"===(t=r.sent()).code)return[2,!1];throw t;case 3:return[2]}}))}))},this.makeDirIfNotExists=function(e){return n(t,void 0,void 0,(function(){return i(this,(function(t){switch(t.label){case 0:return[4,this.fileExists(e)];case 1:return t.sent()?[2]:[4,h.default.mkdir(e,{recursive:!0})];case 2:return t.sent(),[2]}}))}))},this.options=e,this.htmlFileBundler=new c.default({className:this.options.htmlIncludePrefixName||this.name,pattern:"include",includeProperties:this.options.htmlIncludeProperties})}},796:function(e){e.exports=require("autoprefixer")},293:function(e){e.exports=require("file-bundler")},375:function(e){e.exports=require("html-minifier")},261:function(e){e.exports=require("postcss")},959:function(e){e.exports=require("sass")},292:function(e){e.exports=require("fs/promises")},17:function(e){e.exports=require("path")}},t={},r=function r(n){var i=t[n];if(void 0!==i)return i.exports;var s=t[n]={exports:{}};return e[n].call(s.exports,s,s.exports,r),s.exports}(347);return r.default}()}));
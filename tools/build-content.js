// Run after editing content.json:  node tools/build-content.js
// Works whether the content files are in a data/ folder or next to the pages.
const fs=require("fs"),path=require("path");
const root=path.join(__dirname,"..");
const dir=fs.existsSync(path.join(root,"data","content.json"))?path.join(root,"data"):root;
const data=JSON.parse(fs.readFileSync(path.join(dir,"content.json"),"utf8"));
fs.writeFileSync(path.join(dir,"content.js"),"/* Generated from content.json by tools/build-content.js. Do not edit by hand. */\nwindow.YAZI_CONTENT="+JSON.stringify(data)+";\n");
console.log(path.relative(root,path.join(dir,"content.js"))+" written:",data.institutions.length,"records,",data.options.length,"options");

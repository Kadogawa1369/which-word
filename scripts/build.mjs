import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const file of ['index.html','style.css','app.js','questions.js','manifest.webmanifest','sw.js'])await copyFile(file,`dist/${file}`);
await cp('icons','dist/icons',{recursive:true});
console.log('Static PWA built in dist/');

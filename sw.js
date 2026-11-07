// 配信ファイルを変更したら VERSION も変更する。
const VERSION='which-word-v1';
const PREFIX='which-word-';
const ASSETS=['./','./index.html','./style.css','./app.js','./questions.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==VERSION)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;event.respondWith((async()=>{const cache=await caches.open(VERSION);const response=await cache.match(event.request,{ignoreSearch:true});if(response)return response;return fetch(event.request);})());});

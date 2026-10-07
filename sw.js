'use strict';
const CACHE="dyshu-dyshu-diary-3561a64c50d9",ASSETS=["./index.html","./app.css","./app.js","./storage.js","./install.js","./manifest.webmanifest","./icon-192.png","./icon-512.png","./qr.html","./qr.png","./author-qr.png","./author-photo.png","./icon-blue-192.png","./icon-blue-512.png","./apple-touch-icon-blue.png","./icon-blue-maskable-512.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})))));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('dyshu-dyshu-diary-')&&k!==CACHE).map(k=>caches.delete(k)))));});
self.addEventListener('message',e=>{if(e.data==='activate')self.skipWaiting();});
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin)return;
 const name=url.pathname.split('/').pop()||'index.html';if(!["index.html","app.css","app.js","storage.js","install.js","manifest.webmanifest","icon-192.png","icon-512.png","qr.html","qr.png","author-qr.png","author-photo.png","icon-blue-192.png","icon-blue-512.png","apple-touch-icon-blue.png","icon-blue-maskable-512.png"].includes(name))return;
 e.respondWith(caches.open(CACHE).then(async cache=>{const saved=await cache.match('./'+name);return saved||fetch(e.request);}));
});

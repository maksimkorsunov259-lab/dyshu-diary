'use strict';
const CACHE="dyshu-dyshu-diary-fa1e06d4c3c0",ASSETS=["./index.html","./app.css","./app.js","./storage.js","./install.js","./manifest.webmanifest","./icon-192.png","./icon-512.png","./qr.html","./qr.png","./author-qr.png","./author-photo.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('dyshu-dyshu-diary-')&&k!==CACHE).map(k=>caches.delete(k)))));});
self.addEventListener('message',e=>{if(e.data==='activate')self.skipWaiting();});
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin)return;
 const name=url.pathname.split('/').pop()||'index.html';if(!["index.html","app.css","app.js","storage.js","install.js","manifest.webmanifest","icon-192.png","icon-512.png","qr.html","qr.png","author-qr.png","author-photo.png"].includes(name))return;
 e.respondWith(caches.open(CACHE).then(async cache=>{const saved=await cache.match('./'+name);return saved||fetch(e.request);}));
});

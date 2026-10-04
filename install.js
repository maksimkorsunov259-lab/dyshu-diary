'use strict';
(()=>{
 const el=id=>document.getElementById('pf-'+id);let prompt;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;el('install').hidden=false;});
 el('install').addEventListener('click',async()=>{if(!prompt)return;await prompt.prompt();await prompt.userChoice;prompt=null;el('install').hidden=true;});
 window.addEventListener('appinstalled',()=>{el('install').hidden=true;});
 const online=()=>{el('offline-status').textContent=navigator.onLine?'Приложение готово работать без интернета.':'Нет интернета. Дневник доступен на устройстве.';};
 if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(async reg=>{
  await navigator.serviceWorker.ready;online();window.addEventListener('online',online);window.addEventListener('offline',online);
  const offer=()=>{if(reg.waiting)el('update').hidden=false;};offer();reg.addEventListener('updatefound',()=>{reg.installing?.addEventListener('statechange',offer);});
  el('update').addEventListener('click',()=>{if(!reg.waiting)return;if(!window.confirm('Сохраните текущую запись перед перезапуском. Перезапустить приложение?'))return;reg.waiting.postMessage('activate');});
  let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload();});
 }).catch(()=>{el('offline-status').textContent='Работа без интернета пока недоступна. Откройте приложение с подключением к сети.';});}
 else el('offline-status').textContent='Браузер не поддерживает автономный режим. Для открытия приложения нужен интернет.';
})();

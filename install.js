'use strict';
(()=>{
 const el=id=>document.getElementById('pf-'+id);let prompt,registration,checking=false,requested=false,reloading=false,reloadReady=false;
 const buttons=[el('update'),el('update-now')];
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;el('install').hidden=FamilyData.standalone();});
 el('install').addEventListener('click',async()=>{if(!prompt||FamilyData.standalone())return;const request=prompt;prompt=null;el('install').hidden=true;try{await request.prompt();const choice=await request.userChoice;el('install-status').textContent=choice.outcome==='accepted'?'Запрос передан браузеру. Дождитесь завершения установки.':'Установка отменена. Дневником можно пользоваться в браузере.';}catch{el('install-status').textContent='Не удалось запустить установку. Попробуйте меню браузера; дневник остаётся доступен по этой ссылке.';}});
 window.addEventListener('appinstalled',()=>{prompt=null;el('install').hidden=true;el('install-status').textContent='Браузер сообщил об установке. Откройте приложение с главного экрана.';});
 const offer=()=>{const ready=!!registration?.waiting||reloadReady;el('update-banner').hidden=!ready;buttons.forEach(b=>{b.hidden=!ready;b.disabled=requested;});};
 const reload=()=>{if(!reloading){reloading=true;location.reload();}};
 const activate=async()=>{
  if(requested||!registration?.waiting&&!reloadReady)return;
  if(!window.DyshuUpdate||!await DyshuUpdate.prepare()){el('update-message').textContent='Сначала сохраните изменения. При ошибке сохранения скачайте резервную копию.';return;}
  if(!confirm('Обновить приложение? Сохранённые дневники останутся на устройстве.'))return;
  if(!await DyshuUpdate.prepare())return;
  requested=true;offer();el('update-message').textContent='Обновляем приложение…';if(reloadReady)reload();else registration.waiting.postMessage('activate');
 };
 buttons.forEach(b=>b.addEventListener('click',activate));
 const check=async()=>{if(checking)return;checking=true;el('check-update').disabled=true;el('update-check-status').textContent='Проверяем обновления…';try{if(!navigator.onLine)throw Error('Нет подключения к интернету. Повторите проверку после подключения.');if(!registration)throw Error('Обновления пока недоступны. Повторите открытие с интернетом.');const ready=await AppUpdates.check(registration);el('update-check-status').textContent=ready||reloadReady?'Обновление готово. Нажмите «Обновить приложение».':'Проверка завершена. Готовых обновлений нет.';}catch(e){el('update-check-status').textContent=e.message;}finally{checking=false;el('check-update').disabled=false;offer();}};
 el('check-update').addEventListener('click',check);
 if('serviceWorker' in navigator){let previous=navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(requested)reload();else if(previous){reloadReady=true;offer();}previous=navigator.serviceWorker.controller;});navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(async reg=>{registration=reg;const watch=()=>{reg.installing?.addEventListener('statechange',offer);offer();};reg.addEventListener('updatefound',watch);watch();await AppUpdates.waitForInstall(reg);el('offline-status').textContent=reg.active?'Приложение подготовлено для работы без интернета.':'Подготовка работы без интернета…';let last=0;const recheck=()=>{if(!document.hidden&&navigator.onLine&&Date.now()-last>300000){last=Date.now();check();}};window.addEventListener('online',recheck);document.addEventListener('visibilitychange',recheck);}).catch(()=>{el('offline-status').textContent='Не удалось подготовить работу без интернета. Повторите открытие с подключением к сети.';});}else el('offline-status').textContent='Этот браузер не поддерживает работу приложения без интернета.';
})();

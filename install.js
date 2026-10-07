'use strict';
(()=>{
 const el=id=>document.getElementById('pf-'+id);let prompt;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;el('install').hidden=false;});
 el('install').addEventListener('click',async()=>{if(!prompt)return;await prompt.prompt();await prompt.userChoice;prompt=null;el('install').hidden=true;});
 window.addEventListener('appinstalled',()=>{el('install').hidden=true;});
 const online=()=>{el('offline-status').textContent=navigator.onLine?'Приложение готово работать без интернета.':'Нет интернета. Дневник доступен на устройстве.';};
 if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(async reg=>{
  await navigator.serviceWorker.ready;online();window.addEventListener('online',online);window.addEventListener('offline',online);
  let requested=false,reloading=false,reloadReady=false,checking=false,lastCheck=0;
  const hadController=!!navigator.serviceWorker.controller;
  const buttons=[el('update'),el('update-now')];
  const offer=()=>{const ready=!!reg.waiting||reloadReady;el('update-banner').hidden=!ready;buttons.forEach(b=>b.hidden=!ready);};
  const watch=()=>{const worker=reg.installing;if(worker)worker.addEventListener('statechange',offer);offer();};
  reg.addEventListener('updatefound',watch);watch();
  const reload=()=>{if(!reloading){reloading=true;location.reload();}};
  const activate=async()=>{
   if(requested||(!reg.waiting&&!reloadReady))return;
   if(!window.confirm('Обновить приложение? Сохранённый дневник останется. Если вы редактируете запись или настройки, сначала сохраните их: несохранённые поля после перезапуска будут потеряны.'))return;
   buttons.forEach(b=>b.disabled=true);
   try{
    if(!window.DyshuUpdate||!await window.DyshuUpdate.prepare()){el('update-message').textContent='Не удалось подтвердить сохранение. Проверьте сообщение об ошибке и сохраните резервную копию перед обновлением.';return;}
    if(!reg.waiting&&!reloadReady){offer();return;}
    requested=true;el('update-message').textContent='Обновляем приложение…';
    if(reloadReady)reload();else reg.waiting.postMessage('activate');
   }catch{requested=false;el('update-message').textContent='Не удалось выполнить обновление. Проверьте подключение и повторите попытку.';}
   finally{if(!requested)buttons.forEach(b=>b.disabled=false);}
  };
  buttons.forEach(b=>b.addEventListener('click',activate));
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
   if(requested){reload();return;}
   if(hadController){reloadReady=true;offer();}
  });
  // Recheck on return to the app or reconnection; avoid frequent network requests.
  const check=async()=>{if(checking||document.hidden||!navigator.onLine||Date.now()-lastCheck<300000)return;checking=true;lastCheck=Date.now();try{await reg.update();}catch{}finally{checking=false;offer();}};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
  window.addEventListener('online',check);check();
 }).catch(()=>{el('offline-status').textContent='Работа без интернета пока недоступна. Откройте приложение с подключением к сети.';});}
 else el('offline-status').textContent='Браузер не поддерживает автономный режим. Для открытия приложения нужен интернет.';
})();

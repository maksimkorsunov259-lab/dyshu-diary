/* Shared entry choices; no treatment or dosing recommendations. */
(function(root){
 const symptomKeys=['unknown','none','cough','wheeze','breathless','severe'];
 const kindKeys=['symptoms','infection','therapy','note'];
 const uniqueChoices=(values,keys)=>Array.isArray(values)&&values.length>0&&values.length<=keys.length&&new Set(values).size===values.length&&values.every(v=>keys.includes(v));
 function validSymptoms(values){return uniqueChoices(values,symptomKeys)&&(!values.some(v=>['none','unknown'].includes(v))||values.length===1);}
 function validKinds(values){return uniqueChoices(values,kindKeys);}
 function primarySymptom(values){return ['severe','breathless','wheeze','cough','none','unknown'].find(v=>values.includes(v))||'unknown';}
 const symptomValues=r=>r.symptoms||[r.symptom||'unknown'];
 const kindValues=r=>r.kinds||[r.kind||'symptoms'];
 function inhalationLabel(n){const end=n%100>=11&&n%100<=14?'ингаляций':n%10===1?'ингаляция':n%10>=2&&n%10<=4?'ингаляции':'ингаляций';return `${n} ${end}`;}
 function doseChoice(amount){
  if(!amount)return {choice:'',exact:''};
  if(amount==='Более 8 ингаляций')return {choice:'more',exact:''};
  const match=/^(\d+) ингаляци[яий]$/.exec(amount),n=match?Number(match[1]):null;
  if(Number.isSafeInteger(n)&&n>0)return {choice:n<=8?String(n):'more',exact:n>8?String(n):''};
  return {choice:'other',exact:amount};
 }
 const publicReference=value=>String(value||'').replace(/\s*·?\s*изображение\s+\d+(?:,\s*таблица\s+\d+)?/gi,'').trim();
 const api={symptomKeys,kindKeys,validSymptoms,validKinds,primarySymptom,symptomValues,kindValues,inhalationLabel,doseChoice,publicReference};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.DyshuEntryOptions=api;
})(globalThis);

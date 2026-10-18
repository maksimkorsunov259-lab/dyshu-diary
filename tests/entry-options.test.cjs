const test=require('node:test');
const assert=require('node:assert/strict');
const {validSymptoms,validKinds,primarySymptom,symptomValues,kindValues,inhalationLabel,doseChoice,publicReference}=require('../entry-options.js');
test('multiple symptoms preserve a severe warning regardless of checkbox order',()=>{
 assert.equal(validSymptoms(['cough','severe','wheeze']),true);
 assert.equal(primarySymptom(['cough','severe','wheeze']),'severe');
 assert.equal(primarySymptom(['cough','wheeze']),'wheeze');
 for(const value of [[],['none','cough'],['unknown','severe'],['none','unknown'],['cough','cough'],['invalid']])assert.equal(validSymptoms(value),false);
 assert.equal(validSymptoms(['none']),true);assert.equal(validSymptoms(['unknown']),true);
});
test('multiple event categories and legacy scalar records are preserved',()=>{
 assert.equal(validKinds(['symptoms','infection','therapy','note']),true);
 for(const value of [[],['infection','infection'],['invalid']])assert.equal(validKinds(value),false);
 assert.deepEqual(symptomValues({symptom:'breathless'}),['breathless']);assert.deepEqual(kindValues({kind:'infection'}),['infection']);
 const r={symptom:'severe',symptoms:['cough','severe'],kind:'infection',kinds:['infection','therapy']};assert.deepEqual(symptomValues(r),r.symptoms);assert.deepEqual(kindValues(r),r.kinds);
});
test('inhalation amounts round-trip and do not reinterpret other medication units',()=>{
 for(let n=1;n<=8;n++)assert.deepEqual(doseChoice(inhalationLabel(n)),{choice:String(n),exact:''});
 for(const n of [9,10,11,12,21,22,25,101])assert.deepEqual(doseChoice(inhalationLabel(n)),{choice:'more',exact:String(n)});
 assert.equal(inhalationLabel(1),'1 ингаляция');assert.equal(inhalationLabel(2),'2 ингаляции');assert.equal(inhalationLabel(8),'8 ингаляций');
 assert.deepEqual(doseChoice('Более 8 ингаляций'),{choice:'more',exact:''});
 for(const amount of ['20 капель','0,5 мл','2 вдоха'])assert.deepEqual(doseChoice(amount),{choice:'other',exact:amount});
 assert.deepEqual(doseChoice(''),{choice:'',exact:''});
});
test('patient-facing references omit historical image numbers without changing clinical values',()=>{
 assert.equal(publicReference('Мужчины · изображение 3'),'Мужчины');
 assert.equal(publicReference('Дети младше 15 лет · изображение 1, таблица 1'),'Дети младше 15 лет');
 assert.equal(publicReference('Мужчины · изображение 3 · интерполяция'),'Мужчины · интерполяция');
 assert.equal(publicReference('Таблица для мужчин'),'Таблица для мужчин');
});

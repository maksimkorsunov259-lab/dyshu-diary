
(async () => {
 const root=document.getElementById('pf-demo');
 const el=id=>root.querySelector('#pf-'+id);
 // CONTROL_SCORE_START
// Numerical scoring engine. Wording and translation metadata live in questionnaire-content.cjs.
const controlScales={
 ACT:{name:'ACT',minAge:12,maxAge:120,points:[[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5]],max:25,page:189,respondent:'Пациент',period:'Последние 4 недели',version:'ACT-RU-KR2024-score-v1'},
 CACT:{name:'c-ACT',minAge:4,maxAge:11,points:[[0,1,2,3],[0,1,2,3],[0,1,2,3],[0,1,2,3],[0,1,2,3,4,5],[0,1,2,3,4,5],[0,1,2,3,4,5]],max:27,page:191,respondent:'Ребёнок (1–4) и родитель (5–7)',period:'Детская часть — по формулировкам бланка; родительская — последние 4 недели',version:'CACT-RU-KR2024-score-v1'},
 TRACK:{name:'TRACK',minAge:1,maxAge:4,points:[[0,5,10,15,20],[0,5,10,15,20],[0,5,10,15,20],[0,5,10,15,20],[0,5,10,15,20]],max:100,page:2,respondent:'Родитель / ухаживающий взрослый',period:'Вопросы 1–3: 4 недели; вопрос 4: 3 месяца; вопрос 5: 12 месяцев',version:'TRACK-AZ2009-score-v1'}
};
function defaultControlScale(age){return Number.isInteger(age)&&age>=1&&age<=120?(age<5?'TRACK':age<12?'CACT':'ACT'):null;}
function controlScaleAllowed(id,age){const s=controlScales[id];return !!s&&Number.isInteger(age)&&age>=s.minAge&&age<=s.maxAge;}
function calculateControlScore(id,answers){
 const scale=controlScales[id];
 if(!scale||!Array.isArray(answers)||answers.length!==scale.points.length)return {ok:false};
 if(answers.some((a,i)=>typeof a!=='number'||!scale.points[i].includes(a)))return {ok:false};
 const total=answers.reduce((a,b)=>a+b,0);
 const category=id==='ACT'?(total>=20?'well':total>=16?'not_well':'very_poor'):total>=(id==='TRACK'?80:20)?'well':'not_well';
 return {ok:true,total,max:scale.max,category,version:scale.version};
}
function controlInterpretation(id,result,reliever){
 if(!result.ok)return 'Ответьте на все вопросы.';
 if(id==='TRACK')return (result.total<80?'По порогу оригинального TRACK проблемы с дыханием могут быть недостаточно контролируемыми.':'По порогу оригинального TRACK проблемы с дыханием, вероятно, контролируются.')+' Использован перевод, валидация которого не проводилась; результат оценивает врач.';
 if(id==='ACT'&&reliever!=='saba')return ['ics_formoterol','ics_saba'].includes(reliever)?'Интерпретация врачом: ACT не валидирован с этим препаратом облегчения (GINA 2026).':'Для интерпретации ACT уточните препарат облегчения с врачом.';
 return {well:'Результат соответствует хорошему контролю по этой шкале.',not_well:'Результат указывает на недостаточный контроль по этой шкале.',very_poor:'Результат указывает на очень плохой контроль по ACT.'}[result.category];
}
// CONTROL_SCORE_END
// CONTROL_CONTENT_START
// ACT/c-ACT: GSK Russian forms. TRACK: direct Russian translation of AstraZeneca 278650 (5/09), ALA PDF page 2.
// Electronic-use conditions confirmed by the application owner on 2026-10-03.
const choices=(labels,scores)=>labels.map((label,i)=>({label,score:scores[i]}));
const adult=(question,labels)=>({question,options:choices(labels,[1,2,3,4,5])});
const child=(question,labels)=>({question,options:choices(labels,[0,1,2,3])});
const parent=question=>({question,options:choices(['Ни разу','1-3 дня','4-10 дней','11-18 дней','19-24 дней','Каждый день'],[5,4,3,2,1,0])});
const controlContent={
 TRACK:{
  source:'TRACK™ · AstraZeneca, 278650, 5/09 · оригинал American Lung Association · перевод на русский для приложения от 03.10.2026',
  url:'https://www.lung.org/getmedia/e1e8cd0e-4113-4aec-baaa-2b322266ca47/track#page=2',version:'TRACK-RU-translation-AZ2009-v1',
  translationNotice:'Перевод оригинального TRACK на русский язык для этого приложения. Валидация перевода не проводилась. Результат обсуждается с врачом.',
  eligibility:'Отвечает родитель или ухаживающий взрослый. Оригинал предназначен для детей от 12 месяцев до 5 лет с повторными эпизодами свистящего дыхания, одышки или кашля и назначением средств быстрого облегчения либо установленной астмой. Это не диагностический тест.',
  copyright:'TRACK — товарный знак группы компаний AstraZeneca. © 2009 AstraZeneca LP. Все права защищены. 278650 · 5/09. Другие названия препаратов принадлежат соответствующим правообладателям; их производители не связаны с AstraZeneca и не заявляют о поддержке её продукции.',
  questions:[
   {question:'За последние 4 недели как часто Вашего ребёнка беспокоили проблемы с дыханием, такие как свистящее дыхание, кашель или одышка?',options:choices(['Ни разу','Один или два раза','Один раз в неделю','Два или три раза в неделю','Четыре или более раз в неделю'],[20,15,10,5,0])},
   {question:'За последние 4 недели как часто Ваш ребёнок просыпался ночью из-за проблем с дыханием (свистящего дыхания, кашля, одышки)?',options:choices(['Ни разу','Один или два раза','Один раз в неделю','Два или три раза в неделю','Четыре или более раз в неделю'],[20,15,10,5,0])},
   {question:'За последние 4 недели в какой степени проблемы с дыханием у Вашего ребёнка, такие как свистящее дыхание, кашель или одышка, мешали ему играть, ходить в школу или заниматься обычными для его возраста делами?',options:choices(['Совсем не мешали','Незначительно','Умеренно','В значительной степени','В крайней степени'],[20,15,10,5,0])},
   {question:'За последние 3 месяца как часто Вам приходилось применять препараты быстрого облегчения (альбутерол, Ventolin®, Proventil®, Maxair®, ProAir®, Xopenex® или Primatene® Mist) для лечения проблем с дыханием у Вашего ребёнка (свистящего дыхания, кашля, одышки)?',options:choices(['Ни разу','Один или два раза','Один раз в неделю','Два или три раза в неделю','Четыре или более раз в неделю'],[20,15,10,5,0])},
   {question:'За последние 12 месяцев сколько раз Вашему ребёнку приходилось принимать кортикостероиды внутрь (преднизон, преднизолон, Orapred®, Prelone® или Decadron®) из-за проблем с дыханием, которые не удавалось контролировать другими лекарствами?',options:choices(['Ни разу','Один раз','Два раза','Три раза','Четыре или более раз'],[20,15,10,5,0])}
  ]
 },
 ACT:{
  source:'GSK · русская версия ACT · ноябрь 2024 · NP-GBL-ASU-WCNT-190001',
  url:'https://www.asthmacontroltest.com/ru-ru/quiz/adult-quiz/',version:'ACT-RU-GSK2024-full-v2',
  copyright:'Asthma Control Test™ © QualityMetric Incorporated 2002, 2004, 2009. Все права защищены. Asthma Control Test — товарный знак QualityMetric. © 2024 Группа компаний GSK. Все права защищены.',
  questions:[
   adult('Как часто за последние 4 недели астма ограничивала вашу деятельность на работе, в школе или дома по сравнению с обычным уровнем?',['Всё время','Большую часть времени','Иногда','Редко','Ни разу']),
   adult('Как часто за последние 4 недели у вас была одышка?',['Более одного раза в день','Один раз в день','Три-шесть раз в неделю','Один или два раза в неделю','Ни разу']),
   adult('Как часто за последние 4 недели симптомы астмы (свистящее дыхание, кашель, одышка, стеснение или боль в груди) будили вас ночью или раньше обычного утром?',['Четыре или больше ночей в неделю','Две или три ночи в неделю','Один раз в неделю','Один или два раза','Ни разу']),
   adult('Как часто за последние 4 недели вам приходилось применять бронхорасширяющее средство экстренной помощи (например, Сальбутамол, Вентолин или Беротек) через ингалятор или небулайзер?',['Три раза в день или чаще','Один или два раза в день','Два или три раза в неделю','Один раз в неделю или реже','Ни разу']),
   adult('Как бы вы оценили степень контроля астмы за последние 4 недели?',['Полное отсутствие контроля','Плохой контроль','Некоторая степень контроля','Хороший контроль','Полный контроль'])
  ]
 },
 CACT:{
  source:'GSK · русская версия c-ACT · ноябрь 2024 · NP-GBL-ASU-WCNT-190001',
  url:'https://www.asthmacontroltest.com/ru-ru/quiz/children-quiz/',version:'CACT-RU-GSK2024-full-v1',
  copyright:'Childhood Asthma Control Test © 2005 GlaxoSmithKline. © 2024 Группа компаний GSK. Все права защищены.',
  questions:[
   child('Как у тебя дела с астмой сегодня?',['Очень плохо','Плохо','Хорошо','Очень хорошо']),
   child('Как сильно астма мешает тебе бегать, заниматься физкультурой или играть в спортивные игры?',['Очень мешает, я совсем не могу делать то, что мне хочется','Мешает, и это меня расстраивает','Немножко мешает, но это ничего','Не мешает']),
   child('Кашляешь ли ты из-за астмы?',['Да, все время','Да, часто','Да, иногда','Нет, никогда']),
   child('Просыпаешься ли ты по ночам из-за астмы?',['Да, все время','Да, часто','Да, иногда','Нет, никогда']),
   parent('Как часто за последние 4 недели Ваш ребенок испытывал какие-либо симптомы астмы в дневное время?'),
   parent('Как часто за последние 4 недели у Вашего ребенка было свистящее дыхание из-за астмы в дневное время?'),
   parent('Как часто за последние 4 недели Ваш ребенок просыпался по ночам из-за астмы?')
  ]
 }
};
// CONTROL_CONTENT_END
 const assessments={adult:[],child:[]};
 let assessmentId=null,assessmentSerial=0;
 const controlSource='Клинические рекомендации РФ «Бронхиальная астма», 2024';
 const controlUrl=id=>controlContent[id]?.url||'https://www.lung.org/getmedia/e1e8cd0e-4113-4aec-baaa-2b322266ca47/track#page=2';
 const profiles={adult:{label:'Мой дневник',birth:''},child:{label:'Дневник ребёнка',birth:''}};
 const symptoms={unknown:'Самочувствие не отмечено',none:'Жалоб нет',cough:'Кашель',wheeze:'Свистящее дыхание',breathless:'Одышка',severe:'Тяжело дышать и говорить'};
 const contexts={unknown:'Время относительно ингаляции не указано',before:'До ингаляции',after:'После ингаляции'};
 const relievers={unknown:'Препарат для облегчения симптомов: не отмечено',no:'Препарат для облегчения симптомов: не использовал',yes:'Препарат для облегчения симптомов: использовал'};
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
 let ending=today();
 const validDate=d=>typeof d==='string'&&/^\d{4}-\d\d-\d\d$/.test(d)&&d>='1900-01-01'&&d<=today()&&Number.isFinite(Date.parse(d+'T12:00:00Z'))&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;
 function ageAt(birth,date){if(!validDate(birth)||!validDate(date)||birth>date)return null;return +date.slice(0,4)-(+birth.slice(0,4))-(date.slice(5)<birth.slice(5)?1:0);}
 const smartNames={budesonide:'Будесонид / формотерол',beclometasone:'Беклометазон / формотерол'};
 const medNames={salbutamol:'Сальбутамол',berodual:'Беродуал'};
 // PEF_REFERENCE_START
// Transcribed from three physician-provided images, 2026-10-03.
// The abbreviated adolescent table in image 1 is deliberately excluded.
const pefTables = {
 version:'physician-images-2026-10-03-v1',
 child:[[109,147],[112,160],[114,173],[117,187],[119,200],[122,214],[124,227],[127,240],[130,254],[132,267],[135,280],[137,293],[140,307],[142,320],[145,334],[147,347],[150,360],[152,373],[155,387],[158,400],[160,413],[163,427],[165,440],[167,454]],
 ages:[15,20,25,30,35,40,45,50,55,60],
 heights:[140,145,150,155,160,165,170,175,180,185,190],
 female:[
 [348,369,380,384,383,379,371,362,352,340],
 [355,376,387,391,390,385,378,369,358,347],
 [360,382,393,397,396,391,384,375,364,352],
 [366,388,399,403,402,397,390,381,370,358],
 [371,393,405,409,408,403,396,386,375,363],
 [376,398,410,414,413,408,401,391,380,368],
 [381,403,415,419,418,413,406,396,385,372],
 [385,408,420,424,423,418,411,401,389,377],
 [390,413,425,429,428,423,415,405,394,381],
 [394,417,429,433,432,427,419,409,398,385],
 [398,421,433,438,436,432,424,414,402,389]],
 male:[
 [414,456,481,494,499,497,491,480,467,452],
 [423,466,491,504,509,508,501,491,477,462],
 [432,475,501,514,519,518,511,500,487,471],
 [440,484,510,524,529,527,520,510,496,480],
 [448,492,519,533,536,536,530,519,505,489],
 [456,500,527,542,547,545,538,527,513,497],
 [463,508,536,550,555,554,546,535,521,504],
 [469,515,543,558,563,561,554,543,528,512],
 [476,522,551,566,571,569,562,550,536,519],
 [482,529,558,573,578,576,569,557,543,525],
 [488,536,564,580,585,583,576,564,549,532]]
};
function pefBracket(values,x){
 const i=values.findIndex(v=>v>=x);
 if(i<0||x<values[0])return null;
 return values[i]===x?[i,i]:[i-1,i];
}
function pefLerp(x,a,b,va,vb){return a===b?va:va+(vb-va)*(x-a)/(b-a);}
function calculatePredicted({age,height,sex}){
 const fail=reason=>({ok:false,reason,version:pefTables.version});
 if(!Number.isFinite(age)||age<0||age>120)return fail('Укажите возраст от 0 до 120 лет.');
 if(!Number.isFinite(height)||height<=0)return fail('Укажите рост пациента в сантиметрах.');
 let raw,anchors,table,interpolated;
 if(age<15){
  const hs=pefTables.child.map(row=>row[0]),b=pefBracket(hs,height);
  if(!b)return fail('Детская таблица: рост 109–167 см. За пределами таблицы задайте ориентир врача вручную.');
  const [lo,hi]=b,low=pefTables.child[lo],high=pefTables.child[hi];
  raw=pefLerp(height,low[0],high[0],low[1],high[1]);
  anchors=[low,...(lo===hi?[]:[high])].map(([h,v])=>({height:h,value:v}));
  table='Дети младше 15 лет · изображение 1, таблица 1';
  interpolated=lo!==hi;
 }else{
  if(age>60)return fail('Таблицы для возраста от 15 лет охватывают 15–60 лет. Задайте ориентир врача вручную.');
  const hb=pefBracket(pefTables.heights,height);
  if(!hb)return fail('Таблицы от 15 лет: рост 140–190 см. За пределами таблицы задайте ориентир врача вручную.');
  if(!['male','female'].includes(sex))return fail('Для расчёта с 15 лет выберите мужскую или женскую таблицу.');
  const [h0,h1]=hb,[a0,a1]=pefBracket(pefTables.ages,age),matrix=pefTables[sex];
  const atHeight=h=>pefLerp(age,pefTables.ages[a0],pefTables.ages[a1],matrix[h][a0],matrix[h][a1]);
  raw=pefLerp(height,pefTables.heights[h0],pefTables.heights[h1],atHeight(h0),atHeight(h1));
  anchors=[...new Set([h0,h1])].flatMap(h=>[...new Set([a0,a1])].map(a=>({height:pefTables.heights[h],age:pefTables.ages[a],value:matrix[h][a]})));
  table=sex==='male'?'Мужчины · изображение 3':'Женщины · изображение 2';
  interpolated=h0!==h1||a0!==a1;
 }
 return {ok:true,value:Math.round(raw),raw,age,height,sex:age<15?null:sex,table,interpolated,anchors,version:pefTables.version};
}


// PEF_REFERENCE_END
 const initialConfig=()=>{const c={from:today(),monitorDays:null,baseline:{status:'unknown',name:'',strength:'',schedule:''},confirmed:null,target:null,basis:'target',green:80,red:50,age:null,height:null,sex:'',targetMode:'manual',source:'',smartEnabled:false,smartName:'budesonide',smartProduct:''};c.predicted=calculatePredicted(c);return c;};
 const histories={adult:[],child:[]};
 let draftMeds={};
 const day=i=>new Date(Date.parse(ending+'T12:00:00Z')-i*86400000).toISOString().slice(0,10);
 const shortDate=d=>new Date(d+'T12:00:00Z').toLocaleDateString('ru-RU',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 let state={version:1,profile:'adult',screen:'graph',days:7,records:{adult:[],child:[]}};
 const eventsByProfile={adult:[],child:[]};
 let entryMode='pef',editingEventId=null,focusDate=ending,eventSequence=0,attemptCount=3;
 let guideDismissed={adult:false,child:false},guideOpen=false,guideOrigin=null;
 // Storage adapter and import/export are defined below.
 function records(){return state.records[state.profile];}
 function events(){return eventsByProfile[state.profile];}
 function inPeriod(r){return r.date>=day(state.days-1)&&r.date<=ending;}
 function sources(){return [...selected().map(r=>({...r,source:'pef',sourceId:r.date+'-'+r.slot})),...events().filter(inPeriod).map(r=>({...r,source:'event',sourceId:r.id}))];}
 function hasSymptoms(r){return !!r.symptom&&!['none','unknown'].includes(r.symptom);}
 function administrations(){return sources().flatMap(r=>(r.meds||[]).map(m=>({...m,date:r.date,time:m.time||r.time||'',source:r.source,sourceId:r.sourceId})));}
 function timelineItems(){
  const list=[];
  for(const r of sources()){
   const item=(type,label,detail='',time=r.time||'')=>list.push({date:r.date,time,type,label,detail,source:r.source,sourceId:r.sourceId,slot:r.slot});
   if(r.source==='pef')item('pef',`${r.slot==='am'?'Утро':'Вечер'} · ПСВ ${r.pef} л/мин`,`${contexts[r.context]}${r.note?' · '+r.note:''}`);
   if(hasSymptoms(r))item('symptom',symptoms[r.symptom]);
   else if(r.symptom==='none'&&r.source==='event')item('assessment','Жалоб нет — отметка пациента');
   if(r.night===true)item('night','Ночное пробуждение',`В ночь на ${shortDate(r.date)}`);
   for(const m of r.meds||[])item('medicine',m.name,`${m.purpose==='maintenance'?'Плановый приём':'Для облегчения симптомов'} · ${m.amount||'количество не указано'}${m.product?' · '+m.product:''}`,m.time||r.time||'');
   if(r.source==='event'&&r.kind==='infection')item('infection','ОРВИ / инфекция — отметка пациента',r.note);
   else if(r.source==='event'&&r.kind==='therapy')item('therapy','Изменение назначенной терапии',r.note);
   else if(r.source==='event'&&r.note)item('note','Заметка',r.note);
   if(r.reliever==='yes'&&!(r.meds||[]).some(m=>m.purpose==='rescue'))item('unspecified','Препарат для облегчения использован','Название и число применений не указаны');
   if(r.source==='event'&&r.symptom==='unknown'&&!r.night&&!r.note&&!r.meds.length&&r.kind==='symptoms'&&r.reliever!=='yes')item('assessment',r.night===false?'Ночных пробуждений не отмечено':'Препарат для облегчения не использовал');
  }
  return list.sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'99:'+a.slot).localeCompare(b.time||'99:'+b.slot));
 }
 function selected(){return records().filter(r=>r.date>=day(state.days-1)&&r.date<=ending).sort((a,b)=>a.date.localeCompare(b.date)||a.slot.localeCompare(b.slot));}
 function config(date=ending){return histories[state.profile].filter(c=>c.from<=date).at(-1)||{...initialConfig(),from:date};}
 function base(c){return c.basis==='predicted'?(c.predicted?.ok?c.predicted.value:null):c[c.basis];}
 function basisLabel(c){return c.basis==='predicted'?'должного ПСВ по таблице':c.basis==='target'?'целевого ПСВ, одобренного врачом':'личного лучшего из прежнего назначения';}
 function observed(){return records().length?Math.max(...records().map(r=>r.pef)):'—';}
 function number(v){return Number(v.toFixed(2)).toLocaleString('ru-RU');}
 function predictedText(p){return p?.ok?`Должный ПСВ: ${p.value} л/мин · ${p.interpolated?'расчётное значение':'табличное значение'}`:'Должный ПСВ не рассчитан';}
 function renderPrediction(container,p){
  container.replaceChildren(text('p',predictedText(p)));
  if(!p?.ok){container.append(text('p',p?.reason||'Укажите возраст, рост и таблицу по полу.','pf-sub'));return;}
  container.append(text('p',`${p.table}. Возраст: ${number(p.age)}; рост: ${number(p.height)} см.`,'pf-sub'));
  const details=document.createElement('details');details.append(text('summary','Как получено значение'));
  details.append(text('p',p.interpolated?`Линейная интерполяция ${p.sex?'по возрасту и росту':'по росту'}: ${number(p.raw)} → ${p.value} л/мин. Округление до целого.`:'Точное совпадение с ячейкой таблицы.','pf-sub'));
  details.append(text('p',p.anchors.map(a=>`${a.height} см${a.age!==undefined?', '+a.age+' лет':''}: ${a.value} л/мин`).join('; '),'pf-sub'));
  details.append(text('p','Таблицы предоставлены врачом 03.10.2026; первоисточник не указан. С 15 лет используются полные таблицы. Значения вне диапазона не рассчитываются.','pf-sub'));
  container.append(details);
 }
 function zone(value,c=config()){if(!base(c))return 'unknown';return value>=base(c)*c.green/100?'green':value>=base(c)*c.red/100?'yellow':'red';}
 function zoneText(value,c){return {unknown:'Ориентир ПСВ не задан. Цветовую оценку сможет настроить врач.',green:'Зелёная зона по вашему плану. Оценивайте также симптомы.',yellow:'Жёлтая зона по вашему плану. Следуйте своему плану действий.',red:'Красная зона по вашему плану. Нужны срочные действия по плану и медицинская помощь.'}[zone(value,c)];}
 function fillZones(container,c){
  container.replaceChildren();if(!base(c)){container.append(text('p','Цветовые зоны пока не настроены. Перенесите ориентир из назначения врача.','pf-sub'));return;}const low=base(c)*c.red/100,high=base(c)*c.green/100;
  for(const [key,label]of [['green',`Зелёная: ≥${number(high)} л/мин (≥${c.green}%)`],['yellow',`Жёлтая: ${number(low)}–<${number(high)} л/мин`],['red',`Красная: <${number(low)} л/мин (<${c.red}%)`]]){const row=text('div',label,'pf-zone');row.dataset.zone=key;container.append(row);}
 }
 function text(tag,content,cls){const n=document.createElement(tag);n.textContent=content;if(cls)n.className=cls;return n;}
 function svgNode(tag,attrs,content){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(content!==undefined)n.textContent=content;return n;}
 function draw(){
  if(!['graph','report'].includes(state.screen))return;
  const svg=el(state.screen==='report'?'report-chart':'chart'),width=Math.max(220,svg.getBoundingClientRect().width),height=410,left=62,right=9,top=12,bottom=198;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.replaceChildren();
  const dates=Array.from({length:state.days},(_,i)=>day(state.days-1-i));
  const data=selected(),max=Math.ceil(Math.max(100,...dates.map(d=>base(config(d))*1.1),...data.map(r=>r.pef))/100)*100;
  const y=v=>top+(height-top-bottom)*(1-v/max),x=i=>left+(width-left-right)*i/(state.days-1);
  svg.append(svgNode('title',{},`ПСВ за ${state.days} дней, л/мин. Утро — круги, вечер — квадраты. Пропуски не соединяются.`));
  dates.forEach((date,i)=>{const c=config(date),reference=base(c),a=i===0?left:(x(i-1)+x(i))/2,b=i===dates.length-1?width-right:(x(i)+x(i+1))/2;
   if(!reference)return;for(const [lo,hi,color]of [[0,reference*c.red/100,'red'],[reference*c.red/100,reference*c.green/100,'yellow'],[reference*c.green/100,max,'green']])svg.append(svgNode('rect',{x:a,y:y(hi),width:b-a,height:y(lo)-y(hi),fill:`var(--pf-${color})`,'data-band':color,'data-date':date,'data-boundary':hi}));
  });
  for(const v of [0,max*.25,max*.5,max*.75,max]){
   svg.append(svgNode('line',{x1:left,x2:width-right,y1:y(v),y2:y(v),stroke:'var(--pf-line)','stroke-width':1}));
   svg.append(svgNode('text',{x:left-7,y:y(v)+4,'text-anchor':'end',fill:'var(--pf-muted)','font-size':12},String(v)));
  }
  svg.append(svgNode('path',{d:dates.map((d,i)=>{const a=i===0?left:(x(i-1)+x(i))/2,b=i===dates.length-1?width-right:(x(i)+x(i+1))/2;return base(config(d))?`M${a},${y(base(config(d)))} L${b},${y(base(config(d)))}`:'';}).join(' '),fill:'none',stroke:'var(--pf-muted)','stroke-width':1,'stroke-dasharray':'4 4'}));
  ['am','pm'].forEach(slot=>{
   let path='',connected=false;
   dates.forEach((d,i)=>{const r=data.find(r=>r.date===d&&r.slot===slot);if(!r){connected=false;return;}path+=`${connected?'L':'M'}${x(i)},${y(r.pef)} `;connected=true;});
   svg.append(svgNode('path',{d:path,fill:'none',stroke:`var(--pf-${slot})`,'stroke-width':2,'data-series':slot}));
   dates.forEach((d,i)=>{const r=data.find(r=>r.date===d&&r.slot===slot);if(!r)return;const point=svgNode(slot==='am'?'circle':'rect',slot==='am'?{cx:x(i),cy:y(r.pef),r:3.5,fill:'var(--pf-am)'}:{x:x(i)-3.5,y:y(r.pef)-3.5,width:7,height:7,fill:'var(--pf-pm)'});point.append(svgNode('title',{},`${shortDate(d)}, ${slot==='am'?'утро':'вечер'}: ${r.pef} л/мин`));svg.append(point);});
  });
  [0,Math.floor((state.days-1)/2),state.days-1].forEach((i,j)=>svg.append(svgNode('text',{x:x(i),y:234,'text-anchor':j===0?'start':j===2?'end':'middle',fill:'var(--pf-muted)','font-size':12},shortDate(dates[i]))));
  const timeline=timelineItems();
  [['symptom','Жалобы'],['night','Ночь'],['medicine','Приём'],['infection','ОРВИ'],['therapy','Терапия']].forEach(([type,label],row)=>{
   const cy=266+row*28;svg.append(svgNode('text',{x:0,y:cy+4,fill:'var(--pf-muted)','font-size':11},label));
   svg.append(svgNode('line',{x1:left,x2:width-right,y1:cy,y2:cy,stroke:'var(--pf-line)','stroke-width':1}));
   dates.forEach((d,i)=>{const count=timeline.filter(t=>t.date===d&&t.type===type).length;if(!count)return;svg.append(svgNode('circle',{cx:x(i),cy,r:state.days>14?3:state.days>7?5:9,fill:'var(--pf-accent)','data-timeline-type':type,'data-date':d,'data-count':count}));if(state.days<=7)svg.append(svgNode('text',{x:x(i),y:cy+4,'text-anchor':'middle',fill:'var(--pf-on)','font-size':11},String(count)));});
  });
  if(state.screen==='graph'){
   const index=dates.indexOf(focusDate);if(index>=0)svg.append(svgNode('line',{x1:x(index),x2:x(index),y1:top,y2:390,stroke:'var(--pf-muted)','stroke-width':1,'stroke-dasharray':'2 4'}));
   svg.onclick=e=>{const rect=svg.getBoundingClientRect(),i=Math.max(0,Math.min(state.days-1,Math.round(((e.clientX-rect.left)*width/rect.width-left)/(width-left-right)*(state.days-1))));focusDate=dates[i];renderTimeline();draw();};
  }
 }
 function show(screen){state.screen=screen;render();if(screen==='entry')loadEntry();if(screen==='settings')loadSettings();if(screen==='control')loadControl();persist();}
 function render(){
  if(guideOpen)closeGuide();
  el('profile').value=state.profile;
  for(const screen of ['graph','entry','report','settings','control'])el(screen+'-panel').hidden=state.screen!==screen;
  root.querySelectorAll('[data-screen]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.screen===state.screen)));
  root.querySelectorAll('[data-days]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.days===state.days)));
  el('period').textContent=`${shortDate(day(state.days-1))} — ${shortDate(ending)}`;
  const c=config();
  el('personal').textContent=base(c)?`100% от ${basisLabel(c)}: ${base(c)} л/мин`:'Ориентир не задан';
 el('today-title').textContent=shortDate(today());
 el('range-end').value=ending;el('range-end-report').value=ending;
 for(const o of el('profile').options)o.textContent=profiles[o.value].label;
  el('reference-summary').replaceChildren(text('p',`Лучший ПСВ в дневнике: ${observed()} л/мин`),text('p',predictedText(c.predicted),'pf-sub'),text('p',`Целевой ПСВ, одобренный врачом: ${c.target??'—'} л/мин`),text('p',`Зоны от ${basisLabel(c)} · с ${shortDate(c.from)}`,'pf-sub'));
  fillZones(el('zone-legend'),c);
  el('today').replaceChildren();
  for(const slot of ['am','pm']){const r=records().find(r=>r.date===today()&&r.slot===slot);const row=text('div','','pf-row pf-record');row.append(text('span',slot==='am'?'Утро':'Вечер'),text('strong',r?`${r.pef} л/мин`:'Не записано','pf-data'));el('today').append(row);}
  const data=selected(),complete=Array.from({length:state.days},(_,i)=>day(i)).filter(d=>data.some(r=>r.date===d&&r.slot==='am')&&data.some(r=>r.date===d&&r.slot==='pm')).length;
  renderReport(data,complete);
  el('records').replaceChildren();
  for(const r of [...data].reverse()){
   const item=text('div','','pf-record');
   if(r.attempts)item.append(text('p','Попытки: '+r.attempts.join(' / ')+' л/мин'+(attemptSpread(r.attempts)>40?' · Разница двух лучших >40 л/мин':''),'pf-sub'));
   item.append(text('strong',`${shortDate(r.date)} · ${r.slot==='am'?'утро':'вечер'} · ${r.pef} л/мин`),text('p',symptoms[r.symptom]+(r.night?' · Ночное пробуждение':''),'pf-sub'),text('p',`${contexts[r.context]} · ${relievers[r.reliever]}`,'pf-sub'));
   for(const m of r.meds||[])item.append(text('p',`${m.name}${m.product?' · '+m.product:''} · ${m.purpose==='maintenance'?'плановый приём':'для облегчения симптомов'} · ${m.amount||'количество не указано'} · ${m.time||'время не указано'}`,'pf-sub'));
   if(r.note)item.append(text('p',r.note,'pf-sub'));el('records').append(item);
  }
  for(const r of events().filter(inPeriod).sort((a,b)=>b.date.localeCompare(a.date)||b.time.localeCompare(a.time))){
   const item=text('div','','pf-record');item.append(text('strong',`${shortDate(r.date)} · ${r.time} · отдельное событие`));
   for(const t of timelineItems().filter(t=>t.source==='event'&&t.sourceId===r.id))item.append(text('p',`${t.label}${t.detail?' · '+t.detail:''}`,'pf-sub'));el('records').append(item);
  }
  renderTimeline();
  draw();
 }
 function renderTimeline(){
  if(focusDate<day(state.days-1)||focusDate>ending)focusDate=ending;
  el('timeline-date').min=day(state.days-1);el('timeline-date').value=focusDate;
  el('prev-day').disabled=focusDate===day(state.days-1);el('next-day').disabled=focusDate===ending;
  const items=timelineItems().filter(t=>t.date===focusDate);el('timeline').replaceChildren();
  if(!items.length)el('timeline').append(text('p','На эту дату записей нет. Это не означает отсутствия симптомов.','pf-sub'));
  for(const t of items){const row=text('div','','pf-logitem');row.dataset.itemType=t.type;
   row.append(text('span',t.time||'Время не указано','pf-sub'),text('p',t.label));if(t.detail)row.append(text('p',t.detail,'pf-sub'));
   const edit=text('button','Изменить запись');edit.type='button';edit.dataset.editSource=t.sourceId;
   edit.addEventListener('click',()=>{el('date').value=t.date;if(t.source==='pef'){entryMode='pef';el('slot').value=t.slot;editingEventId=null;}else{entryMode='event';editingEventId=t.sourceId;}show('entry');});row.append(edit);el('timeline').append(row);
  }
 }
 function renderReport(data,complete){
  renderControlReport();
  const current=config();renderPrediction(el('report-reference'),current.predicted);
  el('report-reference').append(text('p',`Ориентир врача: ${current.target??'—'} л/мин${current.targetMode==='table'?' · принят из таблицы':''}. Подтверждённый личный лучший: ${current.confirmed??'—'} л/мин.`, 'pf-sub'));
  const all=sources(),meds=administrations(),unique=rows=>new Set(rows.map(r=>r.date)).size;
  const symptomsKnown=all.filter(r=>r.symptom&&r.symptom!=='unknown'||r.night===true);
  const nightsKnown=all.filter(r=>typeof r.night==='boolean');
  const symptomDays=unique(all.filter(r=>hasSymptoms(r)||r.night===true)),nightDays=unique(all.filter(r=>r.night===true));
  const rescue=meds.filter(m=>m.purpose==='rescue'),maintenance=meds.filter(m=>m.purpose==='maintenance');
  const unspecified=all.filter(r=>r.reliever==='yes'&&!(r.meds||[]).some(m=>m.purpose==='rescue'));
  const summary=el('summary');summary.replaceChildren(text('h3',profiles[state.profile].label),text('p',`${shortDate(day(state.days-1))} — ${shortDate(ending)}`,'pf-sub'));
  const metric=(key,label,value)=>{const row=text('div','','pf-metric');row.dataset.metric=key;row.append(text('span',label),text('strong',value));summary.append(row);};
  metric('pef','Измерения ПСВ',`${data.length} из ${state.days*2}`);
  metric('paired','Полных дней: утро + вечер',`${complete} из ${state.days}`);
  metric('symptom-days','Дней с отмеченными симптомами',String(symptomDays));
  metric('night-days','Ночей с пробуждениями',String(nightDays));
  metric('rescue','Применений для облегчения',String(rescue.length));
  metric('maintenance','Плановых применений',String(maintenance.length));
  summary.append(text('p',`Самочувствие отмечено в ${unique(symptomsKnown)} из ${state.days} дней; ночные симптомы — в ${unique(nightsKnown)} из ${state.days}. Числа отражают только записи, а не доказанное отсутствие событий в остальные дни.`,'pf-sub'));
  if(unspecified.length)summary.append(text('p',`Ещё ${unspecified.length} отметок «использовал» без названия и числа применений; в счётчик применений не включены.`,'pf-sub'));
  for(const slot of ['am','pm']){const values=data.filter(r=>r.slot===slot);summary.append(text('p',`${slot==='am'?'Утро':'Вечер'}: ${values.length?values[0].pef+' → '+values.at(-1).pef+' л/мин':'нет данных'} · первая → последняя запись`,'pf-sub'));}
  renderBaselineReport();
  const medSummary=el('med-summary');medSummary.replaceChildren();const grouped=new Map();
  for(const m of meds){const key=JSON.stringify([m.key,m.name,m.product||'']);if(!grouped.has(key))grouped.set(key,{name:m.name,product:m.product,maintenance:0,rescue:0});grouped.get(key)[m.purpose]++;}
  for(const g of grouped.values()){const row=text('div','','pf-record');row.append(text('strong',g.name),text('p',g.product||'Дозировка / устройство не указаны','pf-sub'),text('p',`Плановых: ${g.maintenance} · для облегчения: ${g.rescue}`));medSummary.append(row);}
  if(!meds.length)medSummary.append(text('p','Применения конкретных препаратов не записаны.','pf-sub'));
  medSummary.append(text('p','Считаются применения, не суммарные дозы. Количество и единицы — в подробных записях.','pf-sub'));
  const qualityRows=data.filter(r=>Array.isArray(r.attempts)&&attemptSpread(r.attempts)>40);
  if(qualityRows.length)summary.append(text('p','Расхождение двух лучших попыток >40 л/мин: '+qualityRows.map(r=>shortDate(r.date)+' '+(r.slot==='am'?'утро':'вечер')+' ('+attemptSpread(r.attempts)+' л/мин)').join('; ')+'. Проверьте технику вместе с врачом.','pf-sub'));
  const method=el('report-method');method.replaceChildren(text('p','Полнота ПСВ рассчитана для расписания: утром и вечером каждый день. Повторные отметки симптомов и ночных пробуждений в одну дату учитываются как один день / одна ночь.','pf-sub'));
  for(const h of histories[state.profile].filter((h,i,a)=>h.from<=ending&&(!a[i+1]||a[i+1].from>day(state.days-1))))method.append(text('p',`Настройки с ${shortDate(h.from)}: 100% = ${base(h)} л/мин (${basisLabel(h)}); зелёная ≥${h.green}%, красная <${h.red}%. Возраст ${h.age??'—'}, рост ${h.height??'—'} см. ${h.source}. ${predictedText(h.predicted)}${h.predicted?.ok?' · '+h.predicted.table:''}`,'pf-sub'));
  method.append(text('p','Вариабельность ПСВ пока не рассчитывается: отдельный показатель добавим после согласования протокола сопоставимых измерений.','pf-sub'));
 }
 function openGuide(button){
  guideOrigin=button;guideOpen=true;guideDismissed[state.profile]=true;el('guide-invitation').hidden=true;
  const days=config(state.screen==='entry'?(el('date').value||ending):ending).monitorDays;
  el('guide-duration').textContent=days?'Назначенная длительность наблюдения: '+days+' дн.':'Срок наблюдения уточните у врача.';
  el('guide-back').textContent=state.screen==='settings'?'← Вернуться к профилю':'← Вернуться к записи';el('guide-done').textContent=state.screen==='settings'?'Вернуться к профилю':'Вернуться к измерению';
  el(state.screen+'-panel').hidden=true;el('guide-panel').hidden=false;root.querySelector('.pf-tabs').hidden=true;el('profile').disabled=true;persist();el('guide-back').focus();
 }
 function closeGuide(){
  if(!guideOpen)return;guideOpen=false;el('guide-panel').hidden=true;el(state.screen+'-panel').hidden=false;root.querySelector('.pf-tabs').hidden=false;el('profile').disabled=false;
  if(guideOrigin&&!guideOrigin.closest('[hidden]'))guideOrigin.focus();else el('guide-entry').focus();
 }
 for(const id of ['guide-entry','guide-settings','guide-first'])el(id).addEventListener('click',()=>openGuide(el(id)));
 for(const id of ['guide-back','guide-done'])el(id).addEventListener('click',closeGuide);
 el('guide-panel').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeGuide();}});
 el('guide-dismiss').addEventListener('click',()=>{guideDismissed[state.profile]=true;el('guide-invitation').hidden=true;persist();});
 function attemptSpread(v){const sorted=[...v].sort((a,b)=>b-a);return sorted.length>=2?sorted[0]-sorted[1]:0;}
 function renderAttemptQuality(v,valid,severe){
  const spread=valid?attemptSpread(v):0;
  el('repeatability').hidden=!valid||severe;
  el('repeatability').textContent=valid?(spread>40?'Два лучших результата отличаются на '+spread+' л/мин. '+(attemptCount<5?'Проверьте технику и при необходимости добавьте попытку.':'Выполнено пять попыток. Сохраните результаты с отметкой о расхождении и обсудите технику с врачом.'):'Разница двух лучших: '+spread+' л/мин. Приложение сохранит максимальное значение.') :'';
  el('add-attempt').hidden=!valid||spread<=40||attemptCount>=5||severe;
  el('add-attempt').textContent='Добавить попытку '+(attemptCount+1);
  el('remove-attempt').hidden=attemptCount<=3||el('a'+attemptCount).value!=='';
 }
 el('add-attempt').addEventListener('click',()=>{if(attemptCount>=5||!validValues(values())||attemptSpread(values())<=40||el('symptom').value==='severe')return;attemptCount++;el('a'+attemptCount+'-label').hidden=false;el('a'+attemptCount).value='';feedback();el('a'+attemptCount).focus();});
 el('remove-attempt').addEventListener('click',()=>{if(attemptCount<=3||el('a'+attemptCount).value!=='')return;el('a'+attemptCount+'-label').hidden=true;attemptCount--;feedback();});
 function values(){return Array.from({length:attemptCount},(_,i)=>el('a'+(i+1)).value.trim()).map(v=>/^\d+$/.test(v)?Number(v):NaN);}
 function validValues(v){return v.length>=3&&v.length<=5&&v.every(n=>Number.isInteger(n)&&n>0&&n<10000);}
 function feedback(){
  const v=values(),valid=entryMode==='pef'&&validValues(v),best=valid?Math.max(...v):null;
  el('best').textContent=valid?String(best):'—';
  const severe=el('symptom').value==='severe';renderAttemptQuality(v,valid,severe);el('feedback').hidden=!valid&&!severe;
  const c=config(el('date').value||ending);
  el('feedback').dataset.zone=severe?'red':valid?zone(best,c):'green';
  el('feedback').textContent=severe?'При выраженной одышке и затруднении речи нужна экстренная медицинская помощь, независимо от цифры ПСВ.':valid&&!base(c)?zoneText(best,c):valid?`${number(best/base(c)*100)}% от ${basisLabel(c)} (${base(c)} л/мин). ${zoneText(best,c)}`:'';
 }
 function loadEntry(){
  const isEvent=entryMode==='event',r=isEvent?events().find(e=>e.id===editingEventId):records().find(r=>r.date===el('date').value&&r.slot===el('slot').value);
  if(isEvent&&r)el('date').value=r.date;
  el('entry-title').textContent=isEvent?(r?'Изменить событие':'Новое событие'):'Измерение ПСВ';
  el('entry-hint').textContent=isEvent?'Можно записать без измерения ПСВ. Для повторного применения создайте ещё одно событие.':'Три попытки · сохраняется лучший результат';
  root.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===entryMode)));
  el('slot-label').hidden=isEvent;el('pef-fields').hidden=isEvent;el('context-wrap').hidden=isEvent;el('event-time-label').hidden=!isEvent;el('event-kind-wrap').hidden=!isEvent;el('new-event').hidden=!isEvent||!r;
  attemptCount=Math.min(5,Math.max(3,r?.attempts?.length||3));
  [1,2,3,4,5].forEach(i=>el('a'+i).value=r?.attempts?.[i-1]??'');
  el('a4-label').hidden=attemptCount<4;el('a5-label').hidden=attemptCount<5;
  el('guide-invitation').hidden=guideDismissed[state.profile];
  el('symptom').value=r?.symptom||'unknown';el('night').value=r?.night===true?'yes':r?.night===false?'no':'unknown';el('context').value=r?.context||'unknown';el('reliever').value=r?.reliever||'unknown';el('note').value=r?.note||'';
  el('event-time').value=r?.time||'12:00';el('event-kind').value=r?.kind||'symptoms';
  draftMeds=Object.fromEntries((r?.meds||[]).map(m=>[m.key,{...m}]));renderMeds();
  el('save').textContent=r?'Сохранить изменения в дневнике':isEvent?'Сохранить событие без ПСВ':'Сохранить в дневник';el('error').textContent='';feedback();
 }
 function newEvent(date=today()){entryMode='event';editingEventId=null;el('date').value=date;el('status').textContent='';show('entry');}
 root.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{entryMode=b.dataset.mode;editingEventId=null;el('status').textContent='';loadEntry();}));
 el('add-event').addEventListener('click',()=>newEvent(focusDate));
 el('new-event').addEventListener('click',()=>newEvent(el('date').value));
 el('timeline-date').addEventListener('change',()=>{if(el('timeline-date').value>=day(state.days-1)&&el('timeline-date').value<=ending)focusDate=el('timeline-date').value;renderTimeline();draw();});
 for(const [id,delta]of [['prev-day',-1],['next-day',1]])el(id).addEventListener('click',()=>{focusDate=new Date(Date.parse(focusDate+'T12:00:00Z')+delta*86400000).toISOString().slice(0,10);renderTimeline();draw();});
 function baselineValue(c){return c.baseline||{status:'unknown',name:'',strength:'',schedule:''};}
 function readBaseline(){
  const status=el('baseline-status').value;
  return {status,name:status==='prescribed'?el('baseline-name').value.trim().slice(0,120):'',strength:status==='prescribed'?el('baseline-strength').value.trim().slice(0,120):'',schedule:status==='prescribed'?el('baseline-schedule').value.trim().slice(0,300):''};
 }
 function validBaseline(c){const b=baselineValue(c);return ['unknown','prescribed','none'].includes(b.status)&&(b.status!=='prescribed'||!!b.name.trim());}
 function previewBaseline(){el('baseline-fields').hidden=el('baseline-status').value!=='prescribed';el('baseline-smart').hidden=!el('smart-enabled').checked;}
 el('baseline-status').addEventListener('change',previewBaseline);
 el('baseline-smart').addEventListener('click',()=>{if(!el('smart-enabled').checked)return;el('baseline-name').value=smartNames[el('smart-name').value];el('baseline-strength').value=el('smart-product').value.trim().slice(0,120);});
 function renderBaselineReport(){
  const holder=el('baseline-report');holder.replaceChildren();const segments=[];
  for(const c of histories[state.profile]){const b=baselineValue(c);if(!segments.length||JSON.stringify(segments.at(-1).therapy)!==JSON.stringify(b))segments.push({from:c.from,therapy:{...b}});}
  for(let i=0;i<segments.length;i++){
   const s=segments[i],next=segments[i+1]?.from;if(s.from>ending||(next&&next<=day(state.days-1)))continue;
   const stop=next?new Date(Date.parse(next+'T12:00:00Z')-86400000).toISOString().slice(0,10):null;
   const row=text('div','','pf-record pf-therapy-record');row.dataset.therapyFrom=s.from;
   row.append(text('p','С '+shortDate(s.from)+(stop&&stop<=ending?' по '+shortDate(stop):' · действует на конец периода'),'pf-sub'));
   const b=s.therapy;
   if(b.status==='prescribed')row.append(text('strong',b.name),text('p','Дозировка и форма: '+(b.strength||'не указаны')),text('p','Схема приёма: '+(b.schedule||'не указана')));
   else row.append(text('p',b.status==='none'?'Базисная терапия не назначена / отменена врачом.':'Назначение базисной терапии не указано.'));
   holder.append(row);
  }
  holder.append(text('p','Назначенная схема не подтверждает фактический приём. Записанные применения показаны ниже.','pf-sub'));
 }
 function readSettings(){
  const numeric=id=>el(id).value.trim()===''?null:Number(el(id).value);
  const c={from:el('effective').value,monitorDays:numeric('monitor-days'),baseline:readBaseline(),confirmed:numeric('confirmed'),target:numeric('target'),targetMode:el('target-mode').value,basis:el('basis').value,green:numeric('green'),red:numeric('red'),age:numeric('age'),height:numeric('height'),sex:el('sex').value,source:el('source').value.trim().slice(0,120),smartEnabled:el('smart-enabled').checked,smartName:el('smart-name').value,smartProduct:el('smart-product').value.trim().slice(0,100)};
  c.predicted=calculatePredicted(c);
  if(c.targetMode==='table'){c.target=c.predicted.ok?c.predicted.value:null;c.source=c.predicted.ok?`${c.predicted.table} · ${c.predicted.interpolated?'интерполяция':'точная ячейка'}`:'';}
  return c;
 }
 function validSettings(c){
  const pef=n=>Number.isInteger(n)&&n>0&&n<10000;
  return validBaseline(c)&&(c.monitorDays===null||Number.isInteger(c.monitorDays)&&c.monitorDays>=1&&c.monitorDays<=365)&&['manual','table'].includes(c.targetMode)&&['','male','female'].includes(c.sex)&&(c.targetMode!=='table'||c.predicted.ok)&&['target','predicted','confirmed'].includes(c.basis)&&(c.basis!=='predicted'||c.predicted.ok)&&(base(c)===null||pef(base(c)))&&[c.confirmed,c.target].every(n=>n===null||pef(n))&&Number.isInteger(c.green)&&Number.isInteger(c.red)&&c.red>0&&c.red<c.green&&c.green<=100&&(c.age===null||Number.isInteger(c.age)&&c.age>=0&&c.age<=120)&&(c.height===null||Number.isFinite(c.height)&&c.height>0&&c.height<=250)&&validDate(c.from);
 }
 function previewSettings(){
  const c=readSettings();el('smart-config').hidden=!c.smartEnabled;previewBaseline();
  el('sex-label').hidden=c.age!==null&&c.age<15;
  renderPrediction(el('predicted-preview'),c.predicted);
  el('target').disabled=c.targetMode==='table';el('source').disabled=c.targetMode==='table';
  if(c.targetMode==='table'){el('target').value=c.target??'';el('source').value=c.source;}
  if(validSettings(c))fillZones(el('zone-preview'),c);else el('zone-preview').replaceChildren(text('p','Укажите основу ПСВ и границы: 0 < красная < зелёная ≤ 100%.','pf-sub'));
 }
 function loadSettings(){
  const c=config(today());
  el('patient-name').value=profiles[state.profile].label;el('birth').value=profiles[state.profile].birth;
  el('monitor-days').value=c.monitorDays??'';
  const b=baselineValue(c);el('baseline-status').value=b.status;el('baseline-name').value=b.name;el('baseline-strength').value=b.strength;el('baseline-schedule').value=b.schedule;syncBaselinePicker();
  for(const key of ['confirmed','target','basis','green','red','age','height','source','sex'])el(key).value=c[key]??'';
  el('target-mode').value=c.targetMode||'manual';
  el('effective').value=today();el('smart-enabled').checked=c.smartEnabled;el('smart-name').value=c.smartName;el('smart-product').value=c.smartProduct;
  updateAge();
  el('observed').textContent=`Лучший ПСВ в дневнике: ${observed()} л/мин.`;
  el('legacy-basis').hidden=c.basis!=='confirmed';syncSmartPicker();loadReminders();
  el('settings-error').textContent='';previewSettings();
 }
 function renderMeds(){
  const c=config(el('date').value||ending);
  root.querySelectorAll('[data-med]').forEach(b=>{b.setAttribute('aria-pressed',String(!!draftMeds[b.dataset.med]));b.disabled=b.dataset.med==='smart'&&!c.smartEnabled&&!draftMeds.smart;});
  el('smart-hint').textContent=c.smartEnabled?`SMART по назначению: ${smartNames[c.smartName]}${c.smartProduct?' · '+c.smartProduct:''}`:'SMART не назначена в этом профиле. Настройка — в разделе «Профиль».';
  el('med-details').replaceChildren();
  for(const m of Object.values(draftMeds)){
   const row=text('div','','pf-med-row');row.dataset.medRecord=m.key;row.append(text('strong',m.name));
   if(m.key==='smart'){
    const label=text('label','Цель применения'),select=document.createElement('select');select.setAttribute('aria-label','Цель применения SMART');
    for(const [v,t]of [['rescue','Для облегчения симптомов'],['maintenance','Плановый приём']]){const option=text('option',t);option.value=v;select.append(option);}
    select.value=m.purpose;select.addEventListener('change',()=>{m.purpose=select.value;syncReliever();});label.append(select);row.append(label);
   }
   const dose=text('label','Какое количество использовано'),input=document.createElement('input');input.type='text';input.maxLength=80;input.placeholder='Количество и единица из вашей записи';input.value=m.amount;input.dataset.medAmount=m.key;input.addEventListener('input',()=>m.amount=input.value.slice(0,80));dose.append(input);row.append(dose);
   const when=text('label','Время применения'),time=document.createElement('input');time.type='time';time.value=m.time;time.dataset.medTime=m.key;time.addEventListener('input',()=>m.time=time.value);when.append(time);row.append(when);
   el('med-details').append(row);
  }
 }
 function syncReliever(){if(Object.values(draftMeds).some(m=>m.purpose==='rescue'))el('reliever').value='yes';else if(el('reliever').value==='yes')el('reliever').value='unknown';}
 root.querySelectorAll('[data-med]').forEach(b=>b.addEventListener('click',()=>{
  const key=b.dataset.med,c=config(el('date').value||ending);
  if(draftMeds[key])delete draftMeds[key];else{if(key==='smart'&&!c.smartEnabled)return;draftMeds[key]={key,name:key==='smart'?smartNames[c.smartName]:medNames[key],product:key==='smart'?c.smartProduct:'',amount:'',time:'',purpose:'rescue'};}
  syncReliever();renderMeds();
 }));
 el('reliever').addEventListener('change',()=>{if(el('reliever').value!=='yes'){for(const [key,m]of Object.entries(draftMeds))if(m.purpose==='rescue')delete draftMeds[key];renderMeds();}});
 el('configure').addEventListener('click',()=>show('settings'));
 ['confirmed','target','basis','green','red','age','height','sex','target-mode','effective','smart-enabled'].forEach(id=>el(id).addEventListener('input',previewSettings));
 el('settings-save').addEventListener('click',()=>{
  const c=readSettings();if(!['target','predicted'].includes(c.basis)){el('settings-error').textContent='Выберите новую основу зон: целевой ПСВ врача или должный ПСВ по таблице. До сохранения действуют прежние границы.';return;}if(c.smartEnabled&&!c.smartProduct){el('settings-error').textContent='Выберите назначенный препарат SMART и дозировку.';return;}const name=el('patient-name').value.trim(),birth=el('birth').value;if(!name||birth&&(!validDate(birth)||ageAt(birth,today())>120||birth>c.from)){el('settings-error').textContent='Укажите имя или псевдоним и корректную дату рождения (не позже даты назначения).';return;}if(!validBaseline(c)){el('settings-error').textContent='Укажите название назначенного препарата базисной терапии или измените статус назначения.';return;}if(!validSettings(c)){el('settings-error').textContent=(c.targetMode==='table'||c.basis==='predicted')&&!c.predicted.ok?c.predicted.reason:'Проверьте длительность (1–365 дней или пусто), ПСВ (целое число 1–9999), возраст (0–120), рост (до 250 см), дату и границы зон: 0 < красная < зелёная ≤ 100%.';return;}
  profiles[state.profile]={label:name.slice(0,80),birth};
  histories[state.profile]=[...histories[state.profile].filter(h=>h.from!==c.from),c].sort((a,b)=>a.from.localeCompare(b.from));
  el('status').textContent=`Настройки профиля применены с ${shortDate(c.from)}. Измерения до этой даты используют прежние границы.`;show('graph');
 });
 root.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>{el('status').textContent='';show(b.dataset.screen);}));
 root.querySelectorAll('[data-days]').forEach(b=>b.addEventListener('click',()=>{state.days=+b.dataset.days;render();persist();}));
 el('add').addEventListener('click',()=>{entryMode='pef';editingEventId=null;el('date').value=today();el('slot').value=new Date().getHours()<12?'am':'pm';show('entry');});
 el('profile').addEventListener('change',()=>{state.profile=el('profile').value;editingEventId=null;assessmentId=null;focusDate=ending;el('status').textContent='';render();if(state.screen==='entry')loadEntry();if(state.screen==='settings')loadSettings();if(state.screen==='control')loadControl();persist();});
 el('date').addEventListener('change',()=>{if(entryMode==='pef')loadEntry();else{renderMeds();feedback();}});
 el('slot').addEventListener('change',loadEntry);
 ['a1','a2','a3','a4','a5','symptom'].forEach(id=>el(id).addEventListener('input',feedback));
 el('save').addEventListener('click',event=>{
  event.preventDefault();const attempts=values(),date=el('date').value,slot=el('slot').value;
  if(entryMode==='pef'&&!validValues(attempts)){el('error').textContent='Введите три целых положительных значения ПСВ и заполните добавленные попытки (до 9999 л/мин ). Пустую дополнительную попытку можно убрать.';return;}
  if(!validDate(date)){el('error').textContent='Укажите существующую дату не позднее сегодняшней.';return;}
  const common={date,symptom:el('symptom').value,night:el('night').value==='unknown'?null:el('night').value==='yes',reliever:el('reliever').value,meds:Object.values(draftMeds).map(m=>({...m})),note:el('note').value.trim().slice(0,160)};
  if(entryMode==='event'){
   const time=el('event-time').value,kind=el('event-kind').value;
   if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)){el('error').textContent='Укажите время события.';return;}
   if(common.symptom==='unknown'&&common.night===null&&common.reliever==='unknown'&&!common.meds.length&&!common.note&&kind==='symptoms'){el('error').textContent='Отметьте самочувствие, применение препарата или добавьте заметку.';return;}
   if(['therapy','note'].includes(kind)&&!common.note){el('error').textContent='Опишите событие в заметке.';return;}
   const id=editingEventId||crypto.randomUUID(),record={...common,id,time,kind},index=events().findIndex(r=>r.id===id);
   if(index>=0)events()[index]=record;else events().push(record);
   editingEventId=id;ending=date;focusDate=date;state.days=Math.max(state.days,date>=day(6)?7:date>=day(13)?14:30);
   el('status').textContent=`Событие ${shortDate(date)} в ${time} сохранено без измерения ПСВ.`;
   if(record.symptom==='severe'){render();el('new-event').hidden=false;el('save').textContent='Сохранить изменения в дневнике';feedback();persist();}else show('graph');
   return;
  }
  const record={...common,slot,attempts,pef:Math.max(...attempts),attemptSpread:attemptSpread(attempts),context:el('context').value};
  const index=records().findIndex(r=>r.date===date&&r.slot===slot);
  if(index>=0)records()[index]=record;else records().push(record);
  ending=date;focusDate=date;state.days=Math.max(state.days,Math.ceil((Date.parse(ending)-Date.parse(date))/86400000)+1<=7?7:date>=day(13)?14:30);
  el('status').textContent=`${shortDate(date)}, ${slot==='am'?'утро':'вечер'} — ${record.pef} л/мин сохранено.`;
  if(record.symptom==='severe'||zone(record.pef,config(date))==='red'){state.screen='entry';render();feedback();persist();}else show('graph');
 });
 function readControl(){
  const id=el('control-type').value;
  const answers=Array.from(el('control-points').querySelectorAll('[data-control-point]')).map(group=>{const input=group.matches('select')?group:group.querySelector('input:checked');return !input||input.value===''?null:Number(input.value);});
  return {instrument:id,age:el('control-age').value===''?null:Number(el('control-age').value),date:el('control-date').value,answers,reliever:el('control-reliever').value};
 }
 function setControlType(preferred){
  const age=el('control-age').value===''?null:Number(el('control-age').value);
  const select=el('control-type');select.replaceChildren();
  for(const [id,s]of Object.entries(controlScales))if(controlScaleAllowed(id,age)){const o=text('option',s.name);o.value=id;select.append(o);}
  select.value=controlScaleAllowed(preferred,age)?preferred:defaultControlScale(age)||'';
  el('control-age-note').textContent=age===4?'По умолчанию TRACK. c-ACT можно выбрать по решению врача.':age===0?'Для детей младше 12 месяцев эти опросники не применяются.':'От 12 месяцев до 5 лет — TRACK; 5–11 лет — c-ACT; с 12 лет — ACT.';
  buildControlPoints();
 }
 function buildControlPoints(answers=[]){
  const id=el('control-type').value,s=controlScales[id],content=controlContent[id];
  el('control-points').replaceChildren();
  el('control-period').textContent=s?s.period:'';el('control-respondent').textContent=s?'Кто отвечает: '+s.respondent:'';
  el('control-source').textContent=content?.source||(s?'TRACK · оригинальный бланк AstraZeneca, опубликованный American Lung Association':'');
  el('control-url').textContent=s?controlUrl(id):'';
  el('control-copyright').textContent=content?content.copyright+' Материал не заменяет консультацию врача.':'';
  el('control-heading').textContent=id==='TRACK'?'TRACK · вопросы родителю':'Вопросы';
  el('control-instructions').textContent=content?'Ответы не выбраны заранее. Для расчёта нужны ответы на все вопросы.':'';
  el('control-translation').hidden=!content?.translationNotice;el('control-translation').textContent=content?.translationNotice||'';
  el('control-eligibility').hidden=!content?.eligibility;el('control-eligibility-text').textContent=content?.eligibility||'';
  el('control-reliever-wrap').hidden=id!=='ACT';
  if(s)s.points.forEach((points,i)=>{
   if(id==='CACT'&&(i===0||i===4)){
    el('control-points').append(text('h3',i===0?'Отвечает ребёнок · вопросы 1–4':'Отвечает родитель · вопросы 5–7'));
    el('control-points').append(text('p',i===0?'Взрослый может помочь прочитать вопрос. Ответ выбирает ребёнок.':'Ответьте самостоятельно; ответы ребёнка не должны влиять на ваши ответы.','pf-sub'));
   }
   const q=content?.questions[i];
   if(q){
    const field=document.createElement('fieldset');field.className='pf-question';field.id='pf-control-q'+(i+1);field.dataset.controlPoint=String(i+1);
    field.append(text('legend',(i+1)+'. '+q.question));
    for(const option of q.options){
     const label=document.createElement('label');label.className='pf-answer';
     const radio=document.createElement('input');radio.type='radio';radio.name='pf-control-answer-'+i;radio.value=String(option.score);radio.checked=answers[i]===option.score;
     radio.addEventListener('change',previewControl);label.append(radio,text('span',option.label));field.append(label);
    }
    el('control-points').append(field);
   }else{
    const label=text('label','Пункт '+(i+1)+' · баллы из оригинального бланка','pf-score-item'),select=document.createElement('select');select.id='pf-control-q'+(i+1);select.dataset.controlPoint=String(i+1);
    const empty=text('option','Не перенесено');empty.value='';select.append(empty);
    for(const point of points){const option=text('option',String(point));option.value=String(point);select.append(option);}
    select.value=answers[i]===undefined||answers[i]===null?'':String(answers[i]);select.addEventListener('change',previewControl);label.append(select);el('control-points').append(label);
   }
  });
  el('control-error').textContent='';previewControl();
 }
 function previewControl(){
  const r=readControl(),score=calculateControlScore(r.instrument,r.answers),target=el('control-result');target.replaceChildren();
  if(!controlScaleAllowed(r.instrument,r.age)){target.append(text('p',r.age===0?'Для детей младше 12 месяцев эти опросники не применяются.':'Укажите возраст от 1 до 120 полных лет.'));return;}
  if(!score.ok){target.append(text('p',`Заполнено ${r.answers.filter(a=>a!==null).length} из ${controlScales[r.instrument].points.length}. Итог пока не рассчитан.`));return;}
  target.append(text('strong',`${controlScales[r.instrument].name}: ${score.total} из ${score.max} баллов`),text('p',controlInterpretation(r.instrument,score,r.reliever)));
  target.append(text('p','Результат опросника дополняет оценку врача и не меняет лечение или зоны ПСВ.','pf-sub'));
 }
 function loadControl(){
  const saved=assessments[state.profile].find(a=>a.id===assessmentId),c=config(saved?.date||today());
  el('control-date').value=saved?.date||today();el('control-age').value=saved?.age??ageAt(profiles[state.profile].birth,el('control-date').value)??c.age??'';
  el('control-reliever').value=saved?.reliever||(c.smartEnabled?'ics_formoterol':'unknown');
  setControlType(saved?.instrument);if(saved)buildControlPoints(saved.answers);
 }
 function renderControlReport(){
  const holder=el('control-report');holder.replaceChildren();
  const rows=assessments[state.profile].filter(inPeriod).sort((a,b)=>a.date.localeCompare(b.date)||a.sequence-b.sequence);
  if(!rows.length){holder.append(text('p','За выбранный период результатов нет. Это не означает хороший контроль.','pf-sub'));return;}
  for(const [id,s]of Object.entries(controlScales)){
   const values=rows.filter(r=>r.instrument===id);if(!values.length)continue;
   const group=text('div');group.dataset.controlGroup=id;group.append(text('h3',s.name));
   for(const r of values){
    const entry=text('div','','pf-record');entry.dataset.assessmentId=r.id;
    entry.append(text('strong',`${shortDate(r.date)} · ${r.score.total}/${r.score.max} баллов`),text('p',`${r.age} лет · ${r.respondent}`,'pf-sub'),text('p',r.interpretation),text('p',r.period,'pf-sub'));
    const details=document.createElement('details');details.append(text('summary','Ответы и источник'),text('p',r.answers.map((v,i)=>`${i+1}: ${v}`).join(' · '),'pf-sub'),text('p',r.source+' · '+r.version,'pf-sub'),text('p',r.sourceUrl,'pf-source-url'));
    details.append(text('p',r.mode||'Перенос баллов','pf-sub'));
    if(r.translationNotice)details.append(text('p',r.translationNotice,'pf-sub'));
    if(r.responseDetails)for(const [i,a] of r.responseDetails.entries())details.append(text('p',(i+1)+'. '+a.question),text('p',a.answer+' · '+a.score+' балл(а/ов)','pf-sub'));
    if(r.instrument==='ACT')details.append(text('p','Препарат облегчения: '+({unknown:'не уточнён',saba:'КДБА',ics_formoterol:'ИГКС / формотерол',ics_saba:'ИГКС / КДБА',other:'другой'}[r.reliever]),'pf-sub'));
    entry.append(details);const edit=text('button','Изменить результат');edit.type='button';edit.dataset.editAssessment=r.id;edit.addEventListener('click',()=>{assessmentId=r.id;show('control');});entry.append(edit);group.append(entry);
   }
   if(values.length>1){const first=values[0].score.total,last=values.at(-1).score.total;group.append(text('p',`${s.name}: ${first} → ${last} баллов · первая и последняя оценки за период. Выше — лучше по шкале; изменение оценивает врач.`,'pf-sub'));}
   holder.append(group);
  }
  holder.append(text('p','Результаты разных шкал не сравниваются друг с другом. Способ заполнения и источник сохранены с каждой оценкой.','pf-sub'));
 }
 el('control-new').addEventListener('click',()=>{assessmentId=null;show('control');});
 el('control-back').addEventListener('click',()=>show('report'));
 el('control-age').addEventListener('input',()=>setControlType());
 el('control-type').addEventListener('change',()=>buildControlPoints());
 el('control-date').addEventListener('change',()=>{const c=config(el('control-date').value||ending);el('control-age').value=ageAt(profiles[state.profile].birth,el('control-date').value)??c.age??'';el('control-reliever').value=c.smartEnabled?'ics_formoterol':'unknown';setControlType();});
 el('control-reliever').addEventListener('change',previewControl);
 el('control-save').addEventListener('click',()=>{
  const r=readControl(),score=calculateControlScore(r.instrument,r.answers);
  const dateValid=validDate(r.date);
  if(!dateValid||!controlScaleAllowed(r.instrument,r.age)||!score.ok){el('control-error').textContent='Проверьте дату, возраст и заполнение всех пунктов.';return;}
  const s=controlScales[r.instrument],previous=assessments[state.profile].find(a=>a.id===assessmentId);
  const sequence=previous?.sequence??++assessmentSerial;
  assessmentId=previous?.id||crypto.randomUUID();
  const saved={...r,id:assessmentId,sequence,score,version:controlContent[r.instrument]?.version||s.version,respondent:s.respondent,period:s.period,source:controlContent[r.instrument]?.source||'TRACK · оригинальный бланк AstraZeneca / American Lung Association',sourceUrl:controlUrl(r.instrument),mode:controlContent[r.instrument]?'Ответы внутри приложения':'Перенос баллов врачом',translationNotice:controlContent[r.instrument]?.translationNotice||null,responseDetails:controlContent[r.instrument]?.questions.map((q,i)=>({question:q.question,answer:q.options.find(o=>o.score===r.answers[i]).label,score:r.answers[i]}))||null,interpretation:controlInterpretation(r.instrument,score,r.reliever)};
  assessments[state.profile]=[...assessments[state.profile].filter(a=>a.id!==assessmentId),saved];
  ending=r.date;el('status').textContent='Результат добавлен в отчёт.';show('report');
 });

 // Modal leaves the active screen and all draft fields untouched.
 const aboutDialog=el('about');
 root.querySelectorAll('[data-open-about]').forEach(button=>button.addEventListener('click',()=>aboutDialog.showModal()));
 el('about-close').addEventListener('click',()=>aboutDialog.close());

 // This catalog fills existing prescription fields; it never selects treatment by age.
 const baselineCatalog=[{"id": "flixotide-50", "name": "Флутиказона пропионат (Фликсотид)", "strength": "Аэрозоль для ингаляций дозированный, 50 мкг/доза", "label": "Фликсотид — 50 мкг/доза · аэрозоль"}, {"id": "flixotide-100", "name": "Флутиказона пропионат (Фликсотид)", "strength": "Аэрозоль для ингаляций дозированный, 100 мкг/доза", "label": "Фликсотид — 100 мкг/доза · аэрозоль"}, {"id": "pulmicort-025", "name": "Будесонид (Пульмикорт)", "strength": "Суспензия для ингаляций, 0,25 мг/мл", "label": "Пульмикорт — 0,25 мг/мл · суспензия"}, {"id": "pulmicort-05", "name": "Будесонид (Пульмикорт)", "strength": "Суспензия для ингаляций, 0,5 мг/мл", "label": "Пульмикорт — 0,5 мг/мл · суспензия"}, {"id": "symbicort-80", "name": "Симбикорт Турбухалер", "strength": "80/4,5 мкг/доза", "label": "Симбикорт Турбухалер — 80/4,5 мкг/доза"}, {"id": "symbicort-160", "name": "Симбикорт Турбухалер", "strength": "160/4,5 мкг/доза", "label": "Симбикорт Турбухалер — 160/4,5 мкг/доза"}, {"id": "seretide-50-100", "name": "Серетид Мультидиск (салметерол + флутиказон)", "strength": "50 мкг + 100 мкг/доза", "label": "Серетид Мультидиск — 50 + 100 мкг/доза"}, {"id": "foster-100", "name": "Фостер", "strength": "100/6 мкг/доза", "label": "Фостер — 100/6 мкг/доза"}, {"id": "relvar-92", "name": "Релвар Эллипта", "strength": "22/92 мкг/доза", "label": "Релвар Эллипта — 22/92 мкг/доза"}, {"id": "relvar-184", "name": "Релвар Эллипта", "strength": "22/184 мкг/доза", "label": "Релвар Эллипта — 22/184 мкг/доза"}, {"id": "spiriva-25", "name": "Спирива Респимат", "strength": "2,5 мкг/доза", "label": "Спирива Респимат — 2,5 мкг/доза"}];
 const baselinePicker=el('baseline-picker');
 for(const item of baselineCatalog){const option=document.createElement('option');option.value=item.id;option.textContent=item.label;baselinePicker.append(option);}
 function syncBaselinePicker(){
  baselinePicker.value=baselineCatalog.find(item=>item.name===el('baseline-name').value&&item.strength===el('baseline-strength').value)?.id||'';
  el('baseline-picker-status').textContent='';
 }
 baselinePicker.addEventListener('change',()=>{
  const selected=baselineCatalog.find(item=>item.id===baselinePicker.value);
  if(!selected){el('baseline-picker-status').textContent='Введите или отредактируйте название и дозировку ниже.';return;}
  const changed=el('baseline-name').value!==selected.name||el('baseline-strength').value!==selected.strength;
  el('baseline-name').value=selected.name;
  el('baseline-strength').value=selected.strength;
  if(changed)el('baseline-schedule').value='';
  el('baseline-picker-status').textContent='Название и дозировка заполнены. Укажите схему применения из назначения врача и сохраните профиль.';
 });
 for(const id of ['baseline-name','baseline-strength'])el(id).addEventListener('input',syncBaselinePicker);
 el('baseline-smart').addEventListener('click',syncBaselinePicker);

 const smartCatalog={
  budesonide:['Симбикорт Турбухалер — 80/4,5 мкг/доза','Симбикорт Турбухалер — 160/4,5 мкг/доза'],
  beclometasone:['Фостер — 100/6 мкг/доза · аэрозоль']
 };
 function syncSmartPicker(){
  const list=smartCatalog[el('smart-name').value]||[],current=el('smart-product').value;
  el('smart-picker').replaceChildren(new Option('Выберите препарат из назначения',''));
  list.forEach(label=>el('smart-picker').append(new Option(label,label)));
  el('smart-picker').append(new Option('Другой назначенный вариант / ручной ввод','custom'));
  el('smart-picker').value=list.includes(current)?current:current?'custom':'';
  el('smart-custom').hidden=el('smart-picker').value!=='custom';
 }
 el('smart-picker').addEventListener('change',()=>{
  const value=el('smart-picker').value;el('smart-custom').hidden=value!=='custom';
  el('smart-product').value=value==='custom'?'':value;previewSettings();
 });
 el('smart-name').addEventListener('change',()=>{el('smart-product').value='';syncSmartPicker();previewSettings();});

 // Calendar reminders contain no patient identifiers or measurements.
 function defaultReminders(){return {adult:{am:'08:00',pm:'21:00',id:crypto.randomUUID()},child:{am:'08:00',pm:'21:00',id:crypto.randomUUID()}};}
 let reminders=defaultReminders();
 function validReminder(r){return r&&typeof r==='object'&&['am','pm'].every(k=>typeof r[k]==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(r[k]))&&r.am!==r.pm&&typeof r.id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(r.id);}
 function loadReminders(){const r=reminders[state.profile];el('reminder-am').value=r.am;el('reminder-pm').value=r.pm;el('reminder-status').textContent='';}
 function readReminders(){return {...reminders[state.profile],am:el('reminder-am').value,pm:el('reminder-pm').value};}
 function calendarText(value){return String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
 function foldCalendarLine(line){let result='',part='',bytes=0;for(const ch of line){const size=new TextEncoder().encode(ch).length;if(bytes+size>75){result+=part+'\r\n';part=' ';bytes=1;}part+=ch;bytes+=size;}return result+part;}
 function reminderCalendar(r,now=new Date()){
  if(!validReminder(r)||!Number.isFinite(now.getTime()))throw new Error('Укажите два разных времени в формате ЧЧ:ММ.');
  const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Dyshu//Calendar reminders//RU','CALSCALE:GREGORIAN'];
  for(const slot of ['am','pm']){
   const [hour,minute]=r[slot].split(':').map(Number),date=new Date(now);date.setHours(hour,minute,0,0);if(date<=now)date.setDate(date.getDate()+1);
   const pad=n=>String(n).padStart(2,'0');
   const start=`${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}T${pad(hour)}${pad(minute)}00`;
   const title=slot==='am'?'Дышу — утреннее измерение':'Дышу — вечернее измерение';
   lines.push('BEGIN:VEVENT',`UID:${r.id}-${slot}@dyshu-diary`,`DTSTAMP:${stamp}`,`DTSTART:${start}`,'DURATION:PT5M','RRULE:FREQ=DAILY','TRANSP:TRANSPARENT',`SUMMARY:${calendarText(title)}`,`DESCRIPTION:${calendarText('Измерьте ПСВ по назначению врача и внесите результат в дневник.\nhttps://maksimkorsunov259-lab.github.io/dyshu-diary/')}`,'URL:https://maksimkorsunov259-lab.github.io/dyshu-diary/','BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:PT0M',`DESCRIPTION:${calendarText(title)}`,'END:VALARM','END:VEVENT');
  }
  return [...lines,'END:VCALENDAR'].map(foldCalendarLine).join('\r\n')+'\r\n';
 }
 el('reminder-save').addEventListener('click',async()=>{
  const r=readReminders();if(!validReminder(r)){el('reminder-status').textContent='Укажите два разных времени: утро и вечер.';return;}
  if(!storageReady){el('reminder-status').textContent='Хранилище недоступно. Время не сохранено.';return;}
  reminders[state.profile]=r;await persist();
  el('reminder-status').textContent=failedWrite?'Время не удалось сохранить. Проверьте сообщение об ошибке.':'Время сохранено. Для оповещений добавьте события в календарь. Уже добавленные события измените в самом календаре.';
 });
 el('reminder-export').addEventListener('click',()=>{
  try{const contents=reminderCalendar(readReminders()),url=URL.createObjectURL(new Blob([contents],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='dyshu-reminders.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);el('reminder-status').textContent='Файл подготовлен. Добавьте обе серии в календарь и проверьте оповещения. Скачивание само по себе не включает напоминания.';}catch(e){el('reminder-status').textContent=e.message;}
 });

 // Device-local persistence, versioned backups, date navigation and printing.
 let storageReady=false,databaseReady=false,saveQueue=Promise.resolve(),pendingImport=null,unsaved=false,pendingWrites=0,failedWrite=false;
 const saveStatus=el('storage-status');
 // The updater waits for writes and never reloads after a failed save.
 window.DyshuUpdate={prepare:async()=>{await saveQueue;return storageReady&&!failedWrite&&pendingWrites===0&&!unsaved;}};
 function snapshot(){return structuredClone({format:'dyshu-diary',version:2,exportedAt:new Date().toISOString(),profiles,histories,records:state.records,events:eventsByProfile,assessments,guideDismissed,reminders});}
 function applySnapshot(s){reminders=s.reminders||defaultReminders();for(const key of ['adult','child']){profiles[key]=s.profiles[key];histories[key]=s.histories[key];state.records[key]=s.records[key];eventsByProfile[key]=s.events[key];assessments[key]=s.assessments[key];guideDismissed[key]=s.guideDismissed?.[key]===true;}assessmentSerial=Math.max(0,...Object.values(assessments).flat().map(a=>a.sequence));}
 function persist(){
  if(!storageReady)return;
  const data=snapshot();pendingWrites++;unsaved=true;saveStatus.textContent='Сохраняем на устройстве…';saveStatus.dataset.error='false';
  saveQueue=saveQueue.then(()=>DiaryStore.write(data)).then(()=>{failedWrite=false;saveStatus.textContent='';saveStatus.dataset.error='false';}).catch(e=>{failedWrite=true;saveStatus.dataset.error='true';saveStatus.textContent='Изменения НЕ сохранены. '+e.message+' Скачайте резервную копию из профиля, чтобы не потерять введённое.';}).finally(()=>{pendingWrites--;unsaved=failedWrite||pendingWrites>0;});
  return saveQueue;
 }
 function validateSnapshot(s){
  const fail=()=>{throw new Error('Файл не соответствует формату дневника (версии 1–2). Данные не изменены.');};
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const str=(v,n)=>typeof v==='string'&&v.length<=n;
  const list=v=>Array.isArray(v)&&v.length<=100000;
  const date=d=>validDate(d);
  if(!obj(s)||s.format!=='dyshu-diary'||![1,2].includes(s.version)||!['profiles','histories','records','events','assessments'].every(k=>obj(s[k])))fail();
  if(s.reminders!==undefined&&(!obj(s.reminders)||!['adult','child'].every(k=>validReminder(s.reminders[k]))))fail();
  if(s.version===2&&s.reminders===undefined)fail();
  const meds=rows=>list(rows)&&rows.every(m=>obj(m)&&['salbutamol','berodual','smart'].includes(m.key)&&str(m.name,150)&&str(m.product||'',120)&&str(m.amount,80)&&str(m.time,5)&&(!m.time||/^([01]\d|2[0-3]):[0-5]\d$/.test(m.time))&&['rescue','maintenance'].includes(m.purpose));
  const common=r=>obj(r)&&date(r.date)&&Object.hasOwn(symptoms,r.symptom)&&[null,true,false].includes(r.night)&&Object.hasOwn(relievers,r.reliever)&&str(r.note,160)&&meds(r.meds||[]);
  for(const key of ['adult','child']){
   const p=s.profiles[key];if(!obj(p)||!str(p.label,80)||!p.label.trim()||!str(p.birth,10)||p.birth&&(!date(p.birth)||ageAt(p.birth,today())>120))fail();
   if(!['histories','records','events','assessments'].every(k=>list(s[k][key])))fail();
   const dates=new Set();
   for(const c of s.histories[key]){
    if(!obj(c)||!obj(c.baseline)||!str(c.baseline.name,120)||!str(c.baseline.strength,120)||!str(c.baseline.schedule,300)||!str(c.source,120)||!str(c.smartProduct,100)||typeof c.smartEnabled!=='boolean'||!Object.hasOwn(smartNames,c.smartName)||dates.has(c.from))fail();
    c.predicted=calculatePredicted(c);if(c.targetMode==='table'&&c.target!==c.predicted.value)fail();if(!validSettings(c))fail();dates.add(c.from);
   }
   s.histories[key].sort((a,b)=>a.from.localeCompare(b.from));
   const keys=new Set();for(const r of s.records[key]){if(!common(r)||!['am','pm'].includes(r.slot)||!Object.hasOwn(contexts,r.context)||!Array.isArray(r.attempts)||!validValues(r.attempts)||r.pef!==Math.max(...r.attempts)||keys.has(r.date+r.slot))fail();r.attemptSpread=attemptSpread(r.attempts);keys.add(r.date+r.slot);}
   const ids=new Set();for(const e of s.events[key]){if(!common(e)||!str(e.id,100)||!e.id||ids.has(e.id)||!['symptoms','infection','therapy','note'].includes(e.kind)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time))fail();ids.add(e.id);}
   const aids=new Set();for(const a of s.assessments[key]){
    if(!obj(a)||!str(a.id,100)||aids.has(a.id)||!date(a.date)||!controlScaleAllowed(a.instrument,a.age)||!Number.isInteger(a.sequence)||a.sequence<1||!['unknown','saba','ics_formoterol','ics_saba','other'].includes(a.reliever))fail();
    const score=calculateControlScore(a.instrument,a.answers);if(!score.ok)fail();a.score=score;
    for(const field of ['version','respondent','period','source','sourceUrl','mode','interpretation'])if(!str(a[field],3000))fail();
    if(a.translationNotice!==null&&!str(a.translationNotice,3000))fail();
    if(!list(a.responseDetails)||a.responseDetails.length!==a.answers.length||!a.responseDetails.every((r,i)=>obj(r)&&str(r.question,3000)&&str(r.answer,3000)&&r.score===a.answers[i]))fail();
    aids.add(a.id);
   }
  }
  s.reminders=s.reminders||defaultReminders();s.version=2;
  return s;
 }
 function downloadJSON(data,prefix){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=prefix+'-'+today()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 el('backup').addEventListener('click',()=>{downloadJSON(snapshot(),'dyshu-backup');el('data-message').textContent='Копия подготовлена. Убедитесь, что файл сохранён в загрузках или выбранной папке.';});
 el('import').addEventListener('change',async()=>{
  pendingImport=null;el('import-preview').hidden=true;const file=el('import').files[0];if(!file)return;
  try{if(file.size>30*1024*1024)throw new Error('Размер копии больше 30 МБ.');pendingImport=validateSnapshot(JSON.parse(await file.text()));const count=Object.values(pendingImport.records).reduce((n,r)=>n+r.length,0);el('import-description').textContent='В копии: '+count+' измерений. Профили: '+Object.values(pendingImport.profiles).map(p=>p.label).join(', ')+'. Все текущие данные будут заменены. Сначала сохраните их резервную копию.';el('import-preview').hidden=false;el('data-message').textContent='Копия проверена. Для замены подтвердите действие ниже.';}catch(e){el('data-message').textContent=e.message;}
 });
 el('import-cancel').addEventListener('click',()=>{pendingImport=null;el('import-preview').hidden=true;el('import').value='';el('data-message').textContent='Восстановление отменено.';});
 el('import-confirm').addEventListener('click',async()=>{
  if(!pendingImport||!databaseReady)return;const incoming=pendingImport;pendingImport=null;el('import-confirm').disabled=true;
  await saveQueue;
  try{await DiaryStore.write(incoming);applySnapshot(incoming);unsaved=false;failedWrite=false;storageReady=true;root.querySelectorAll('#pf-save,#pf-settings-save,#pf-control-save').forEach(b=>b.disabled=false);saveStatus.textContent='Дневник восстановлен на устройстве';saveStatus.dataset.error='false';el('import-preview').hidden=true;el('import').value='';render();loadSettings();el('data-message').textContent='Восстановлено. Новые записи сохраняются в этом дневнике.';}catch(e){el('data-message').textContent='Восстановление не выполнено: '+e.message;}finally{el('import-confirm').disabled=false;}
 });
 function updateAge(){const birth=el('birth').value;el('age').readOnly=!!birth;if(birth)el('age').value=ageAt(birth,el('effective').value)??'';}
 el('birth').addEventListener('input',()=>{updateAge();previewSettings();});el('effective').addEventListener('change',()=>{updateAge();previewSettings();});
 for(const id of ['range-end','range-end-report'])el(id).addEventListener('change',()=>{const date=el(id).value;if(!validDate(date)){el(id).value=ending;return;}ending=date;focusDate=date;render();});
 function preparePrint(){show('report');el('report-panel').querySelectorAll('details').forEach(d=>{d.dataset.wasOpen=d.open?'1':'0';d.open=true;});draw();}
 el('print').addEventListener('click',()=>{preparePrint();window.print();});
 window.addEventListener('beforeprint',preparePrint);window.addEventListener('afterprint',()=>{el('report-panel').querySelectorAll('details').forEach(d=>{d.open=d.dataset.wasOpen==='1';});});
 window.addEventListener('beforeunload',e=>{if(unsaved){e.preventDefault();e.returnValue='';}});
 const refreshDates=()=>{root.querySelectorAll('input[type=date]').forEach(input=>{input.min='1900-01-01';input.max=today();});};refreshDates();el('date').value=today();el('control-date').value=today();el('effective').value=today();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDates();});
 try{const saved=await DiaryStore.read();databaseReady=true;if(saved)applySnapshot(validateSnapshot(saved));storageReady=true;saveStatus.textContent=saved?'':'Пустой дневник. Начните с профиля или первого измерения.';}catch(e){saveStatus.dataset.error='true';saveStatus.textContent='Хранилище недоступно или данные не удалось прочитать. '+e.message+' Не очищайте данные браузера. Попробуйте другой браузер или восстановите резервную копию.';root.querySelectorAll('#pf-save,#pf-settings-save,#pf-control-save').forEach(b=>b.disabled=true);el('import-confirm').disabled=!databaseReady;}
 root.querySelector('.pf-content').inert=false;el('profile').disabled=false;root.querySelector('.pf-tabs').inert=false;
 el('loading').hidden=true;

 render();if(state.screen==='entry')loadEntry();if(state.screen==='settings')loadSettings();if(state.screen==='control')loadControl();
 new ResizeObserver(draw).observe(el('chart'));
})();

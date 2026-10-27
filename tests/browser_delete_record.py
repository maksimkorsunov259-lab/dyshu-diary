"""Delete a diary source atomically, retaining other times, events and patients."""
import os,copy
from playwright.sync_api import sync_playwright,expect
URL=os.environ.get('APP_URL','http://127.0.0.1:8056/dyshu-diary/')
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context(viewport={'width':390,'height':844});p=c.new_page();errors=[];messages=[];accept=[False]
 p.on('pageerror',lambda e:errors.append(str(e)))
 def answer(d):
  messages.append(d.message)
  d.accept() if accept[0] else d.dismiss()
 p.on('dialog',answer);p.goto(URL);expect(p.locator('#pf-loading')).to_be_hidden()
 p.locator('#pf-add').click();p.locator('#pf-slot').select_option('am')
 for i,v in enumerate([300,310,305],1):p.locator('#pf-a'+str(i)).fill(str(v))
 p.locator('#pf-save').click();expect(p.locator('#pf-graph-panel')).to_be_visible();p.evaluate('DyshuUpdate.prepare()')
 base=p.evaluate('DiaryStore.read()');record=base['records']['adult'][0];record.update(symptom='cough',symptoms=['cough'],note='Тестовая утренняя запись')
 evening=copy.deepcopy(record);evening.update(slot='pm',pef=410,attempts=[400,410,405],note='Вечерняя запись')
 base['records']['adult'].append(evening);base['records']['child']=[copy.deepcopy(record)]
 base['events']['adult']=[dict(date=record['date'],id='test-event',time='14:00',kind='note',kinds=['note'],symptom='unknown',symptoms=['unknown'],night=None,reliever='unknown',meds=[],note='Отдельное событие')]
 p.evaluate('(data)=>DiaryStore.write(data)',base);p.reload();expect(p.locator('#pf-loading')).to_be_hidden()
 def ready():p.evaluate('DyshuUpdate.prepare()')
 def remove_am():return p.locator('#pf-timeline [data-item-type=pef]').filter(has_text='Утро').locator('[data-delete-source]')
 ready()
 for width in [320,390,1440]:
  p.set_viewport_size({'width':width,'height':900});assert not p.evaluate('document.documentElement.scrollWidth>innerWidth')
  actions=p.locator('.pf-record-actions').first;buttons=actions.locator('button');assert buttons.count()==2
  a=buttons.nth(0).bounding_box();d=buttons.nth(1).bounding_box();assert abs(a['y']-d['y'])<2
 remove_am().click();assert 'ПСВ 310' in messages[-1] and 'включая' in messages[-1];assert p.evaluate('DiaryStore.read()')['records']==base['records']
 # A failed write must neither remove the row nor lose data in storage.
 ready();p.evaluate("()=>{window.originalWrite=DiaryStore.write;DiaryStore.write=()=>Promise.reject(new Error('Тестовая ошибка хранилища'));}")
 accept[0]=True;remove_am().click();expect(p.locator('#pf-status')).to_contain_text('Запись не удалена');expect(remove_am()).to_be_visible();assert not p.locator('#pf-demo').evaluate('(e)=>e.inert')
 assert p.evaluate('DiaryStore.read()')['records']==base['records'];p.evaluate('()=>{DiaryStore.write=window.originalWrite;}')
 remove_am().click();expect(p.locator('#pf-status')).to_contain_text('Запись удалена.');ready();after=p.evaluate('DiaryStore.read()')
 assert after['records']['adult']==[evening];assert after['records']['child']==base['records']['child'];assert after['events']==base['events'];assert after['histories']==base['histories']
 expect(p.locator('#pf-timeline [data-item-type=pef]')).to_have_count(1)
 assert p.locator('#pf-chart [data-series=am]').get_attribute('d')==''
 expect(p.locator('#pf-today')).to_contain_text('Не записано')
 p.locator('.pf-tabs [data-screen=report]').click();expect(p.locator('#pf-records')).not_to_contain_text('Тестовая утренняя запись');expect(p.locator('#pf-records')).to_contain_text('Вечерняя запись')
 p.locator('.pf-tabs [data-screen=graph]').click();ready();p.locator('[data-delete-source=test-event]').click();expect(p.locator('#pf-status')).to_contain_text('Запись удалена.');ready();assert p.evaluate('DiaryStore.read()')['events']['adult']==[]
 # Persistence through reload and deletion of the last measurement, including offline use.
 p.evaluate('navigator.serviceWorker.ready');p.reload();expect(p.locator('#pf-loading')).to_be_hidden();c.set_offline(True);p.reload();expect(p.locator('#pf-loading')).to_be_hidden();ready()
 p.locator('#pf-timeline [data-item-type=pef] [data-delete-source]').click();expect(p.locator('#pf-status')).to_contain_text('Запись удалена.');ready();expect(p.locator('#pf-timeline')).to_contain_text('На эту дату записей нет')
 saved=p.evaluate('DiaryStore.read()');assert saved['records']['adult']==[] and saved['records']['child']==base['records']['child']
 p.reload();expect(p.locator('#pf-loading')).to_be_hidden();assert p.evaluate('DiaryStore.read()')['records']['adult']==[]
 assert not errors,errors;b.close()
print('PASS: cancel, failed atomic write, selected source deletion, linked rows, independent events/patients, graph/report refresh, responsive actions, reload and offline.')

"""Top navigation, direct guide access and draft-preserving guide return."""
import os,tempfile
from playwright.sync_api import sync_playwright,expect
URL=os.environ.get('APP_URL','http://127.0.0.1:8055/dyshu-diary/')
with sync_playwright() as pw,tempfile.TemporaryDirectory() as tmp:
 c=pw.chromium.launch_persistent_context(tmp,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'],viewport={'width':390,'height':844});p=c.new_page();errors=[];prompts=[];accept=[False]
 p.on('pageerror',lambda e:errors.append(str(e)))
 def answer(d):
  prompts.append(d.type);d.accept() if accept[0] else d.dismiss()
 p.on('dialog',answer);p.goto(URL);expect(p.locator('#pf-loading')).to_be_hidden();p.evaluate('DyshuUpdate.prepare()');nav=p.locator('.pf-tabs')
 assert nav.locator('button').all_text_contents()==['Дневник','Отчёт для врача','Памятка','Профиль'];assert nav.locator('svg').count()==4;assert nav.locator('[data-screen=entry]').count()==0
 assert nav.evaluate('e=>!!(e.compareDocumentPosition(document.querySelector(".pf-content"))&Node.DOCUMENT_POSITION_FOLLOWING)')
 for width in [320,390,1440]:
  p.set_viewport_size({'width':width,'height':900});p.evaluate('scrollTo(0,0)');header=p.locator('.pf-header').bounding_box();n=nav.bounding_box();assert n['y']>=header['y']+header['height'];assert n['y']<400;assert not p.evaluate('document.documentElement.scrollWidth>innerWidth')
  p.evaluate('scrollTo(0,600)');assert abs(nav.bounding_box()['y'])<2
  nav.locator('[data-screen=guide]').click();expect(p.locator('#pf-guide-panel')).to_be_visible();expect(nav).to_be_visible();expect(nav.locator('[data-screen=guide]')).to_have_attribute('aria-current','page');assert p.locator('.pf-guide-steps li').count()==10
  p.locator('#pf-guide-back').click();expect(p.locator('#pf-graph-panel')).to_be_visible();expect(nav.locator('[data-screen=graph]')).to_have_attribute('aria-current','page');p.evaluate('DyshuUpdate.prepare()')
 p.set_viewport_size({'width':390,'height':844});p.locator('#pf-add').click();p.locator('#pf-a1').fill('300');p.locator('#pf-a2').fill('310');p.locator('#pf-a3').fill('305');p.evaluate('DyshuUpdate.prepare()')
 nav.locator('[data-screen=guide]').click();expect(p.locator('#pf-guide-panel')).to_be_visible();assert not prompts;assert p.locator('#pf-a2').input_value()=='310';p.evaluate('DyshuUpdate.prepare()')
 nav.locator('[data-screen=report]').click();assert prompts==['confirm'];expect(p.locator('#pf-guide-panel')).to_be_visible();p.locator('#pf-guide-done').click();expect(p.locator('#pf-entry-panel')).to_be_visible();assert p.locator('#pf-a2').input_value()=='310'
 p.locator('#pf-guide-entry').click();p.keyboard.press('Escape');expect(p.locator('#pf-entry-panel')).to_be_visible();assert p.locator('#pf-a2').input_value()=='310'
 p.locator('#pf-save').click();expect(p.locator('#pf-graph-panel')).to_be_visible();p.evaluate('DyshuUpdate.prepare()');saved=p.evaluate('DiaryStore.read()');assert saved['records']['adult'][0]['pef']==310
 nav.locator('[data-screen=report]').click();expect(p.locator('#pf-report-panel')).to_be_visible();p.evaluate('DyshuUpdate.prepare()');nav.locator('[data-screen=settings]').click();expect(p.locator('#pf-settings-panel')).to_be_visible();p.locator('#pf-patient-name').fill('Черновик профиля');p.evaluate('DyshuUpdate.prepare()')
 nav.locator('[data-screen=guide]').click();p.locator('#pf-guide-back').click();assert p.locator('#pf-patient-name').input_value()=='Черновик профиля'
 # Confirmed navigation works and does not modify saved data with the abandoned draft.
 p.evaluate('DyshuUpdate.prepare()');accept[0]=True;nav.locator('[data-screen=graph]').click();expect(p.locator('#pf-graph-panel')).to_be_visible();p.evaluate('DyshuUpdate.prepare()');assert p.evaluate('DiaryStore.read()')['records']==saved['records']
 p.evaluate('navigator.serviceWorker.ready');p.reload();expect(p.locator('#pf-loading')).to_be_hidden();c.set_offline(True);p.reload();expect(p.locator('#pf-loading')).to_be_hidden();p.evaluate('DyshuUpdate.prepare()');nav.locator('[data-screen=guide]').click();expect(p.locator('#pf-guide-panel')).to_be_visible();assert p.evaluate('DiaryStore.read()')['records']==saved['records'];assert not errors,errors;c.close()
print('PASS: top sticky navigation and SVG icons at 320/390/1440, diary measurement entry/save, report/profile routes, guide from all entry points, cancel/confirm navigation, draft preservation, saved records and offline.')

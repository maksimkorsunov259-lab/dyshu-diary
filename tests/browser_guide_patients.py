"""Patient controls remain usable in the guide without mixing patient drafts/data."""
import os, tempfile
from playwright.sync_api import sync_playwright, expect
URL = os.environ.get('APP_URL', 'http://127.0.0.1:8055/dyshu-diary/')
with sync_playwright() as pw, tempfile.TemporaryDirectory() as tmp:
    c = pw.chromium.launch_persistent_context(tmp, executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'], viewport={'width':390,'height':844})
    p = c.new_page(); prompts = []; accept = [False]; errors = []
    p.on('pageerror', lambda e: errors.append(str(e)))
    def answer(d):
        prompts.append(d.type)
        d.accept() if accept[0] else d.dismiss()
    p.on('dialog', answer)
    p.goto(URL); expect(p.locator('#pf-loading')).to_be_hidden()
    def flush(): p.evaluate('DyshuUpdate.prepare()')
    def guide():
        flush(); p.locator('[data-screen=guide]').click(); flush()
        expect(p.locator('#pf-guide-panel')).to_be_visible()
        for id in ['profile', 'edit-profile', 'patients']:
            expect(p.locator('#pf-'+id)).to_be_enabled()
    guide(); p.locator('#pf-patients').click(); expect(p.locator('#pf-patients-panel')).to_be_visible()
    flush(); p.locator('[data-patient=child]').click(); expect(p.locator('#pf-profile')).to_have_value('child')
    guide(); p.locator('#pf-edit-profile').click(); expect(p.locator('#pf-settings-panel')).to_be_visible()
    p.locator('#pf-patient-name').fill('Черновик ребёнка'); guide()
    p.locator('#pf-edit-profile').click(); expect(p.locator('#pf-settings-panel')).to_be_visible()
    expect(p.locator('#pf-patient-name')).to_have_value('Черновик ребёнка'); assert not prompts
    guide(); p.locator('#pf-profile').select_option('adult')
    assert prompts == ['confirm']; expect(p.locator('#pf-guide-panel')).to_be_visible()
    expect(p.locator('#pf-profile')).to_have_value('child')
    p.locator('#pf-patients').click(); assert prompts == ['confirm','confirm']
    expect(p.locator('#pf-guide-panel')).to_be_visible()
    p.locator('#pf-guide-back').click(); expect(p.locator('#pf-patient-name')).to_have_value('Черновик ребёнка')
    guide(); accept[0] = True; p.locator('#pf-profile').select_option('adult')
    expect(p.locator('#pf-profile')).to_have_value('adult'); expect(p.locator('#pf-graph-panel')).to_be_visible()
    flush(); p.locator('#pf-add').click()
    for id, value in [('a1','300'),('a2','310'),('a3','305')]: p.locator('#pf-'+id).fill(value)
    p.locator('#pf-save').click(); expect(p.locator('#pf-graph-panel')).to_be_visible(); flush()
    saved = p.evaluate('DiaryStore.read()'); assert saved['records']['adult'][0]['pef']==310
    guide(); p.locator('#pf-profile').select_option('child'); expect(p.locator('#pf-profile')).to_have_value('child'); flush()
    stored = p.evaluate('DiaryStore.read()'); assert stored['records']==saved['records']; assert stored['records']['child']==[]
    assert stored['profiles']['child']['label']!='Черновик ребёнка'
    guide(); p.locator('#pf-patients').click(); expect(p.locator('#pf-patients-panel')).to_be_visible()
    assert not errors, errors
    c.close()
print('PASS: guide patient controls, profile draft return, cancelled/confirmed switches, and patient data isolation.')

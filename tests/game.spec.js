import {test,expect} from '@playwright/test';
import {questions} from '../questions.js';
async function disconnectApp(page,context,browserName){
 if(browserName==='webkit'){
  // Playwright WebKit's setOffline makes reload fail internally before SW handling.
  // Cut the app server connection instead; APIRequest bypasses SW to verify the outage.
  await page.request.post('http://127.0.0.1:4174/offline',{data:'true'});
  await expect(page.request.get('index.html',{timeout:3000,maxRetries:0})).rejects.toThrow();
 }else await context.setOffline(true);
}
test.beforeEach(async({page})=>{await page.request.post('http://127.0.0.1:4174/version',{data:'v1'});});
test('retry, gated next, duplicate prevention, all 20 and shuffled restart',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto('./');await expect(page.locator('#sentence')).toHaveText('I ？ money.');await expect(page.locator('#next')).toBeDisabled();
 await page.getByRole('button',{name:'safe',exact:true}).click();await expect(page.locator('#message')).toContainText('もう一度');await expect(page.locator('#number')).toContainText('1 / 20');await expect(page.locator('#progress')).toHaveJSProperty('value',0);await expect(page.locator('#next')).toBeDisabled();
 for(let i=0;i<20;i++){
  await page.getByRole('button',{name:questions[i].answer,exact:true}).click();
  await expect(page.locator('#sentence')).toHaveText(questions[i].sentence.replace('___',questions[i].answer));
  await page.getByRole('button',{name:questions[i].answer,exact:true}).evaluate(b=>{b.click();b.click();});await expect(page.locator('#progress')).toHaveJSProperty('value',i+1);
  await expect(page.locator('#listen')).toBeEnabled();await expect(page.locator('#slow')).toBeEnabled();await page.locator('#next').click();
 }
 await expect(page.locator('#finish')).toBeVisible();await page.locator('#restart').click();await expect(page.locator('#progress')).toHaveJSProperty('value',0);
 const sequence=[];for(let i=0;i<20;i++){const sentence=await page.locator('#sentence').textContent();const q=questions.find(q=>q.sentence.replace('___','？')===sentence);sequence.push(q.id);await page.getByRole('button',{name:q.answer,exact:true}).click();await page.locator('#next').click();}
 expect(sequence).not.toEqual(questions.map(q=>q.id));expect(new Set(sequence).size).toBe(20);expect(errors).toEqual([]);
});
test('speech calls use English only, voice preference, cancel, rates; sound toggle',async({page})=>{
 await page.addInitScript(()=>{
  window.audioCalls=[];const Native=window.AudioContext||window.webkitAudioContext;if(Native)window.AudioContext=class extends Native{createOscillator(){window.audioCalls.push('tone');return super.createOscillator();}};
  window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};window.speechCalls=[];Object.defineProperty(window,'speechSynthesis',{value:{cancel(){window.speechCalls.push('cancel');},getVoices(){return[{lang:'ja-JP'},{lang:'en-GB'},{lang:'en-US'}];},speak(u){window.speechCalls.push({text:u.text,rate:u.rate,lang:u.lang});}}});
 });await page.goto('./');await page.locator('#sound').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');await page.getByRole('button',{name:'save',exact:true}).click();expect(await page.evaluate(()=>window.audioCalls)).toEqual([]);
 await page.locator('#listen').click();await page.locator('#slow').click();await page.locator('#listen').click();await page.locator('#next').click();
 expect(await page.evaluate(()=>window.speechCalls)).toEqual(['cancel',{text:'I save money.',rate:1,lang:'en-US'},'cancel',{text:'I save money.',rate:.65,lang:'en-US'},'cancel',{text:'I save money.',rate:1,lang:'en-US'},'cancel']);
 await page.locator('#sound').click();await page.getByRole('button',{name:'safe',exact:true}).click();expect((await page.evaluate(()=>window.audioCalls)).length).toBe(2);
});
test('unavailable audio still allows play',async({page})=>{await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:undefined});Object.defineProperty(window,'SpeechSynthesisUtterance',{value:undefined});});await page.goto('./');await page.getByRole('button',{name:'save',exact:true}).click();await page.locator('#listen').click();await expect(page.locator('#next')).toBeEnabled();});
test('small screen, manifest, icons, offline restart',async({page,context,browserName})=>{
 await page.goto('./');await expect(page.locator('#offline')).toContainText('準備完了');await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const manifest=await (await page.request.get('manifest.webmanifest')).json();expect(manifest.start_url).toBe('./');expect(manifest.scope).toBe('./');expect(manifest.display).toBe('standalone');
 for(const icon of manifest.icons){const response=await page.request.get(icon.src);expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/png');}
 await disconnectApp(page,context,browserName);await page.reload();await expect(page.locator('#sentence')).toHaveText('I ？ money.');await page.getByRole('button',{name:'save',exact:true}).click();await expect(page.locator('#sentence')).toHaveText('I save money.');await page.locator('#next').click();await expect(page.locator('#number')).toContainText('2 / 20');await page.screenshot({path:`test-results/${test.info().project.name}.png`,fullPage:true});
});
test('service worker update waits for consent, removes old caches, offline after update',async({page,context,browserName})=>{
 await page.goto('./');await expect(page.locator('#offline')).toContainText('準備完了');await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller);
 await page.getByRole('button',{name:'save',exact:true}).click();
 // Serve a changed worker, leaving the repository intact. Browser HTTP routes do not intercept SW script requests.
 const result=await page.evaluate(async()=>{await caches.open('which-word-obsolete');const reg=await navigator.serviceWorker.getRegistration();return {scope:reg.scope,keys:await caches.keys()};});expect(result.keys).toContain('which-word-v1');
 // Real worker transition is exercised with a second HTTP server response via test-only control file.
 await page.request.post('http://127.0.0.1:4174/version',{data:'v2'});
 await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});
 await expect(page.locator('#update')).toBeVisible();await expect(page.locator('#sentence')).toHaveText('I save money.');
 await Promise.all([page.waitForNavigation(),page.locator('#apply-update').click()]);await page.waitForFunction(async()=>{const keys=await caches.keys();return keys.includes('which-word-v2')&&!keys.includes('which-word-v1')&&!keys.includes('which-word-obsolete');});
 await disconnectApp(page,context,browserName);await page.reload();await page.getByRole('button',{name:'save',exact:true}).click();await expect(page.locator('#progress')).toHaveJSProperty('value',1);
});
test('320px and desktop layouts have no horizontal overflow',async({page})=>{await page.goto('./');for(const width of [320,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);for(const b of await page.locator('#choices button').all()){const box=await b.boundingBox();expect(box.height).toBeGreaterThanOrEqual(48);}await page.screenshot({path:`test-results/layout-${width}-${test.info().project.name}.png`,fullPage:true});}});

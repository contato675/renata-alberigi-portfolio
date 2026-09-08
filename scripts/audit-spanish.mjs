import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {loadContent} from './load.mjs';
import {LOCALES,localePath} from './i18n.mjs';
import {cvPath} from './curriculum.mjs';
import {startServer} from './serve.mjs';
import {browser,pause} from './audit/cdp.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=await loadContent(root),live=process.argv.includes('--live');
const server=live?null:await startServer(path.join(root,'dist'),data.site.basePath),base=live?data.site.origin+data.site.basePath:server.url;
const out=path.join(root,'artifacts/spanish'+(live?'-live':''));await fs.mkdir(out,{recursive:true});
const results=[],screenshots=[];let chrome;
async function check(name,fn){try{const detail=await fn();results.push({name,status:'PASS',...detail});}catch(error){results.push({name,status:'FAIL',error:error.message});}console.log('ES_AUDIT | '+name+' | '+results.at(-1).status);}
async function shot(name){const image=await chrome.call('Page.captureScreenshot',{format:'jpeg',quality:82,captureBeyondViewport:false});await fs.writeFile(path.join(out,name+'.jpg'),Buffer.from(image.data,'base64'));screenshots.push(name+'.jpg');}
async function settle(dest){for(let i=0;i<180;i++){try{if(await chrome.evaluate('location.pathname==='+JSON.stringify(dest)+'&&document.readyState==="complete"')){await pause(180);return;}}catch{}await pause(50);}throw new Error('Destination did not settle: '+dest);}
async function choose(locale,width){const scope=width<1024?'[data-navigation]':'.desktop-navigation';await chrome.evaluate(width<1024?'document.querySelector("[data-menu-open]").click()':'document.querySelector("[data-language-picker] summary").click()');const sel=scope+' [data-locale-link][hreflang="'+locale+'"]';const dest=await chrome.evaluate('document.querySelector('+JSON.stringify(sel)+').pathname');await chrome.evaluate('document.querySelector('+JSON.stringify(sel)+').click()');await settle(dest);}
async function key(name,code){await chrome.call('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:code,...(name==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});await chrome.call('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:code});}
try{
 chrome=await browser();await chrome.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const width of [320,390,480,768,1024,1440,1920])await check('Spanish home and compact navigation '+width,async()=>{
  await chrome.go(base+'es/',width,1000);await chrome.evaluate('document.querySelector(".portrait img").decode()');
  assert.equal(await chrome.evaluate('document.documentElement.lang'),'es');assert.equal(await chrome.evaluate('document.querySelector("h1").textContent'),'Renata Alberigi');assert.ok(await chrome.evaluate('document.documentElement.scrollWidth<=innerWidth'));
  assert.equal(await chrome.evaluate('document.querySelectorAll("[data-collection] .project").length'),20);assert.equal(await chrome.evaluate('document.querySelectorAll("iframe").length'),0);
  if(width>=1024){assert.ok(await chrome.evaluate('!document.querySelector("[data-language-picker]").open'));assert.equal(await chrome.evaluate('document.querySelector(".language-picker-trigger span:not(.sr-only)").textContent'),'Español');assert.ok(await chrome.evaluate('document.querySelector(".language-picker-trigger").getBoundingClientRect().width<=180'));}
  if([390,768,1440].includes(width))await shot('es-home-'+width);
 });
 for(const locale of LOCALES)for(const width of [1024,1440])await check(locale+' desktop disclosure '+width,async()=>{
  await chrome.go(base+localePath(locale),width,1000);await chrome.evaluate('document.querySelector("[data-language-picker] summary").click()');
  const m=await chrome.evaluate('(()=>{const d=document.querySelector("[data-language-picker]"),s=d.querySelector("summary").getBoundingClientRect(),p=d.querySelector(".language-picker-panel").getBoundingClientRect();return{open:d.open,count:d.querySelectorAll("[data-locale-link]").length,current:d.querySelector("[aria-current=page]").getAttribute("hreflang"),trigger:s.height>=44&&s.width>=44,inside:p.left>=0&&p.right<=innerWidth,small:[...d.querySelectorAll("a")].filter(a=>{const r=a.getBoundingClientRect();return r.width<44||r.height<44;}).length};})()');
  assert.deepEqual(m,{open:true,count:4,current:locale,trigger:true,inside:true,small:0});if(width===1440)await shot(locale+'-picker-open');
  await key('Escape',27);assert.ok(await chrome.evaluate('!document.querySelector("[data-language-picker]").open&&document.activeElement.matches(".language-picker-trigger")'));
  await key('Enter',13);assert.ok(await chrome.evaluate('document.querySelector("[data-language-picker]").open'));
  await key('Tab',9);assert.ok(await chrome.evaluate('document.activeElement.matches("[data-language-picker] a")'));
  await chrome.call('Input.dispatchMouseEvent',{type:'mousePressed',x:100,y:250,button:'left',clickCount:1});await chrome.call('Input.dispatchMouseEvent',{type:'mouseReleased',x:100,y:250,button:'left',clickCount:1});assert.ok(await chrome.evaluate('!document.querySelector("[data-language-picker]").open'));
 });
 for(const other of LOCALES.filter(x=>x!=='es'))for(const [from,to]of [['es',other],[other,'es']])for(const width of [390,1440])await check(from+' to '+to+' CV preserves reading '+width,async()=>{
  await chrome.go(base+cvPath(from),width,1000);await chrome.evaluate('document.getElementById("cv-exhibitions").scrollIntoView({behavior:"instant"})');const top=await chrome.evaluate('document.getElementById("cv-exhibitions").getBoundingClientRect().top');await choose(to,width);
  assert.equal(await chrome.evaluate('location.pathname'),data.site.basePath+cvPath(to));assert.equal(await chrome.evaluate('document.documentElement.lang'),to);assert.equal(await chrome.evaluate('location.hash'),'');assert.ok(Math.abs(await chrome.evaluate('document.getElementById("cv-exhibitions").getBoundingClientRect().top')-top)<=2);
 });
 await check('Choosing current desktop language closes selector without moving',async()=>{
  await chrome.go(base+'es/curriculo/',1440,1000);await chrome.evaluate('document.getElementById("cv-paintings").scrollIntoView({behavior:"instant"})');const before=await chrome.evaluate('scrollY');await choose('es',1440);assert.equal(await chrome.evaluate('scrollY'),before);assert.ok(await chrome.evaluate('!document.querySelector("[data-language-picker]").open'));assert.ok(await chrome.evaluate('document.activeElement.matches(".language-picker-trigger")'));
 });
 await check('Desktop disclosure works without JavaScript and changes to Spanish CV',async()=>{
  await chrome.call('Emulation.setScriptExecutionDisabled',{value:true});
  try{await chrome.go(base+'cv/',1440,1000);await chrome.evaluate('document.querySelector("[data-language-picker] summary").click()');assert.ok(await chrome.evaluate('document.querySelector("[data-language-picker]").open'));await chrome.evaluate('document.querySelector("[data-language-picker] a[hreflang=es]").click()');await settle(data.site.basePath+'es/curriculo/');assert.equal(await chrome.evaluate('document.querySelectorAll(".cv-entry").length'),34);await shot('es-cv-no-js');}
  finally{await chrome.call('Emulation.setScriptExecutionDisabled',{value:false});}
 });
 await check('Spanish CV has public-only content and translated chronology',async()=>{
  await chrome.go(base+'es/curriculo/',390,1000);const text=await chrome.evaluate('document.documentElement.outerHTML');assert.doesNotMatch(text,/mailto:|tel:|@gmail|1993|Petrolina|autodidacta|Renata da Silva/i);assert.equal(await chrome.evaluate('document.querySelectorAll(".cv-section").length'),5);await shot('es-cv-mobile');await chrome.evaluate('document.getElementById("cv-analogiaeu").scrollIntoView({behavior:"instant"})');await shot('es-chronology-mobile');
 });
 await check('Spanish gallery viewer and artwork language links',async()=>{
  await chrome.go(base+'es/',390,1000);await chrome.evaluate('document.querySelector("[data-open-project=amor-incondicional-2026]").click()');
  assert.equal(await chrome.evaluate('document.querySelector("dialog[data-project][open] [data-close]").textContent'),data.dictionaries.es.close);
  assert.equal(await chrome.evaluate('document.querySelectorAll("dialog[data-project][open] [data-locale-link]").length'),4);
  assert.ok(await chrome.evaluate('document.querySelector("dialog[data-project][open]").scrollWidth<=document.querySelector("dialog[data-project][open]").clientWidth'));
  await shot('es-viewer');await chrome.evaluate('document.querySelector("dialog[data-project][open] [hreflang=fr]").click()');await settle(data.site.basePath+'fr/works/amor-incondicional-2026/');assert.equal(await chrome.evaluate('document.querySelector("h1").textContent'),'Amor Incondicional');
 });
 await check('Spanish biography has the CV call to action and no video subtitle',async()=>{
  await chrome.go(base+'es/',1440,1000);await chrome.evaluate('document.getElementById("about").scrollIntoView({behavior:"instant"})');await shot('es-biography');assert.equal(await chrome.evaluate('document.querySelector("#about [data-cv-link]").pathname'),data.site.basePath+'es/curriculo/');assert.equal(await chrome.evaluate('document.querySelector("#film .section-heading .meta")'),null);
 });
 await check('Resizing closes the compact picker without altering mobile navigation',async()=>{
  await chrome.go(base+'es/',1440,1000);await chrome.evaluate('document.querySelector("[data-language-picker] summary").click()');await chrome.call('Emulation.setDeviceMetricsOverride',{width:768,height:1000,deviceScaleFactor:1,mobile:false});await pause(100);assert.ok(await chrome.evaluate('!document.querySelector("[data-language-picker]").open'));await chrome.evaluate('document.querySelector("[data-menu-open]").click()');assert.equal(await chrome.evaluate('document.querySelectorAll("[data-navigation] [data-locale-link]").length'),4);assert.ok(await chrome.evaluate('document.documentElement.scrollWidth<=innerWidth'));await shot('es-mobile-menu');
 });
 const report={date:new Date().toISOString(),live,url:base,browser:(await chrome.call('Browser.getVersion')).product,locales:LOCALES,results,screenshots,checks:results.length,failures:results.filter(r=>r.status==='FAIL').length,limits:['Browser emulation is not physical-device or screen-reader-user testing','Independent native-speaker editorial review of Spanish remains pending']};
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,results:undefined}));if(report.failures){console.log(JSON.stringify(results.filter(r=>r.status==='FAIL')));process.exitCode=1;}
}finally{await chrome?.close();if(server){server.server.closeAllConnections();await new Promise(resolve=>server.server.close(resolve));}}

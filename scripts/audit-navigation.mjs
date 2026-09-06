import {LOCALES,localePath} from './i18n.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {loadContent} from './load.mjs';
import {startServer} from './serve.mjs';
import {browser,pause} from './audit/cdp.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=await loadContent(root);
const server=await startServer(path.join(root,'dist'),data.site.basePath),results=[];
const output=path.join(root,'artifacts/navigation-review');await fs.mkdir(output,{recursive:true});
let chrome;
const check=async(name,run)=>{try{await run();results.push({name,status:'PASS'});}catch(error){results.push({name,status:'FAIL',error:error.message});}};
async function key(name,code,modifiers=0){await chrome.call('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:code,modifiers});await chrome.call('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:code,modifiers});}
async function capture(name){const {data:bytes}=await chrome.call('Page.captureScreenshot',{format:'jpeg',quality:68,captureBeyondViewport:false});await fs.writeFile(path.join(output,name+'.jpg'),Buffer.from(bytes,'base64'));}
try {
 chrome=await browser();await chrome.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const locale of LOCALES)for(const width of [320,390,480,768,1023])await check(locale+' mobile drawer '+width,async()=>{
  await chrome.go(server.url+(localePath(locale)),width,844);
  const closed=await chrome.evaluate(`(()=>{const b=document.querySelector('[data-menu-open]'),r=b.getBoundingClientRect();return {open:!!document.querySelector('dialog[open]'),header:document.querySelector('header').getBoundingClientRect().height,target:r.width>=44&&r.height>=44,desktop:getComputedStyle(document.querySelector('.desktop-navigation')).display,overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth)};})()`);
  assert.equal(closed.open,false);assert.ok(closed.header<=80);assert.ok(closed.target);assert.equal(closed.desktop,'none');assert.ok(closed.overflow<=1);
  if(width===390)await capture('mobile-'+locale);
  await chrome.evaluate("document.querySelector('[data-menu-open]').click()");
  const opened=await chrome.evaluate(`(()=>{const d=document.querySelector('[data-navigation]');return {open:d.open,links:d.querySelectorAll('.main-nav a').length,locales:d.querySelectorAll('[data-locale-link]').length,expanded:document.querySelector('[data-menu-open]').getAttribute('aria-expanded'),overflow:d.scrollWidth-d.clientWidth,focus:document.activeElement.hasAttribute('data-menu-close'),small:[...d.querySelectorAll('a,button')].filter(el=>{const r=el.getBoundingClientRect();return r.width<44||r.height<44;}).length};})()`);
  assert.deepEqual(opened,{open:true,links:6,locales:LOCALES.length,expanded:'true',overflow:0,focus:true,small:0});
  if(width===390)await capture('drawer-'+locale);
  await key('Escape',27);assert.equal(await chrome.evaluate("document.querySelector('[data-navigation]').open"),false);
  assert.ok(await chrome.evaluate("document.activeElement.hasAttribute('data-menu-open')"));
 });
 for(const locale of LOCALES)for(const width of [1024,1440,1920])await check(locale+' desktop navigation '+width,async()=>{
  await chrome.go(server.url+(localePath(locale)),width,900);
  const v=await chrome.evaluate(`({display:getComputedStyle(document.querySelector('.desktop-navigation')).display,menu:getComputedStyle(document.querySelector('[data-menu-open]')).display,name:document.querySelector('header').textContent.includes('Renata Alberigi'),links:document.querySelectorAll('.desktop-navigation .main-nav a').length,overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth)})`);
  assert.deepEqual(v,{display:'flex',menu:'none',name:false,links:6,overflow:0});
  if(width===1440){await chrome.evaluate("document.querySelector('.portrait img').decode()");await capture('desktop-'+locale);}
 });
 await check('Drawer traps Tab and Shift+Tab; Escape restores focus',async()=>{
  await chrome.go(server.url,390,844);await chrome.evaluate("document.querySelector('[data-menu-open]').click()");
  for(let i=0;i<18;i++){await key('Tab',9,i%2?8:0);assert.ok(await chrome.evaluate("!!document.activeElement.closest('[data-navigation][open]')"));}
  await key('Escape',27);assert.ok(await chrome.evaluate("document.activeElement.hasAttribute('data-menu-open')"));
 });
 await check('Accessible dialog name and reduced motion',async()=>{
  await chrome.evaluate("document.querySelector('[data-menu-open]').click()");
  const tree=await chrome.call('Accessibility.getFullAXTree');assert.ok(tree.nodes.some(n=>n.role?.value==='dialog'&&n.name?.value==='Navigation'));
  assert.equal(await chrome.evaluate("getComputedStyle(document.querySelector('[data-navigation]')).animationName"),'none');
 });
 await check('Section selection closes the drawer, scrolls and focuses the section',async()=>{
  await chrome.evaluate("document.querySelector('[data-navigation] a[href$=\"#digital\"]').click()");await pause(120);
  assert.ok(await chrome.evaluate("!document.querySelector('[data-navigation]').open&&location.hash==='#digital'&&document.activeElement.id==='digital-title'&&scrollY>0"));
 });
 await check('Drawer language links preserve the equivalent project route',async()=>{
  await chrome.go(server.url+'pt-br/works/digital-03/',390,844);await chrome.evaluate("document.querySelector('[data-menu-open]').click()");
  const url=await chrome.evaluate("document.querySelector('[data-navigation] a[hreflang=en]').href");assert.ok(url.endsWith('/works/digital-03/'));assert.ok(!url.includes('/pt-br/'));
 });
 await check('Resizing to desktop closes drawer and restores visible focus',async()=>{
  await chrome.call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await pause(120);
  assert.ok(await chrome.evaluate("!document.querySelector('[data-navigation]').open&&!!document.activeElement.closest('.desktop-navigation')&&!document.documentElement.classList.contains('navigation-open')"));
 });
 await check('Backdrop dismisses tablet drawer without changing the page',async()=>{
  await chrome.go(server.url,768,844);await chrome.evaluate("document.querySelector('[data-menu-open]').click()");
  await chrome.call('Input.dispatchMouseEvent',{type:'mousePressed',x:20,y:300,button:'left',clickCount:1});await chrome.call('Input.dispatchMouseEvent',{type:'mouseReleased',x:20,y:300,button:'left',clickCount:1});
  assert.equal(await chrome.evaluate("document.querySelector('[data-navigation]').open"),false);
 });
 await check('No JavaScript: native menu disclosure and language links remain usable',async()=>{
  await chrome.call('Emulation.setScriptExecutionDisabled',{value:true});
  try{await chrome.go(server.url+'pt-br/',390,844);await chrome.evaluate("document.querySelector('.mobile-fallback summary').click()");
   assert.ok(await chrome.evaluate("document.querySelector('.mobile-fallback').open&&document.querySelector('[data-menu-open]').hidden"));
   assert.equal(await chrome.evaluate("document.querySelectorAll('.mobile-fallback a').length"),6+LOCALES.length);
   assert.ok(await chrome.evaluate("document.documentElement.scrollWidth<=innerWidth"));
  }finally{await chrome.call('Emulation.setScriptExecutionDisabled',{value:false});}
 });
 await check('New portrait loads intact; all old visible chrome has been removed',async()=>{
  await chrome.go(server.url+'pt-br/',390,844);await chrome.evaluate("document.querySelector('.portrait img').decode()");
  const v=await chrome.evaluate(`(()=>{const im=document.querySelector('.portrait img'),r=im.getBoundingClientRect();return {src:im.currentSrc,ratio:r.width/r.height,source:im.naturalWidth/im.naturalHeight,grid:!!document.querySelector('[data-grid-toggle]'),notice:!!document.querySelector('.notice'),email:document.querySelector('a[href^=mailto]').textContent,intro:document.querySelector('.intro').textContent};})()`);
  assert.ok(v.src.includes('c758528aa6'));assert.ok(Math.abs(v.ratio-v.source)<.005);assert.equal(v.grid,false);assert.equal(v.notice,false);assert.equal(v.email,'estudiorenascida@gmail.com');assert.equal(v.intro,data.artist.intro['pt-BR']);
 });
 const report={date:new Date().toISOString(),browser:(await chrome.call('Browser.getVersion')).product,results,failures:results.filter(r=>r.status==='FAIL').length,limits:['Browser keyboard/resize and no-JS checks are not physical iOS/Android or screen-reader-user tests','New specifications come from the user; dimensions without units follow the supplied centimetre convention','Public preview remains noindex even without a visible review label']};
 await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.failures)process.exitCode=1;
}finally{await chrome?.close();server.server.closeAllConnections();await new Promise(resolve=>server.server.close(resolve));}

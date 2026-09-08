import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {loadContent} from './load.mjs';
import {cvPath} from './curriculum.mjs';
import {LOCALES,localePath} from './i18n.mjs';
import {startServer} from './serve.mjs';
import {browser,pause} from './audit/cdp.mjs';
import {inspectLayout} from './audit/metrics.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=await loadContent(root),live=process.argv.includes('--live');
const server=live?null:await startServer(path.join(root,'dist'),data.site.basePath);
const base=live?data.site.origin+data.site.basePath:server.url;
const out=path.join(root,'artifacts/curriculum'+(live?'-live':''));await fs.mkdir(out,{recursive:true});
const results=[],screenshots=[];let chrome;
async function check(name,fn){try{const detail=await fn();results.push({name,status:'PASS',...detail});}catch(error){results.push({name,status:'FAIL',error:error.message});}console.log('CV_AUDIT | '+name+' | '+results.at(-1).status);}
async function settled(p){for(let i=0;i<180;i++){try{if(await chrome.evaluate(`location.pathname===${JSON.stringify(p)}&&document.readyState==='complete'`)){await pause(180);return;}}catch{}await pause(40);}throw new Error('Navigation did not settle');}
async function click(selector){const p=await chrome.evaluate(`document.querySelector(${JSON.stringify(selector)}).pathname`);await chrome.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await settled(p);}
async function capture(name){const image=await chrome.call('Page.captureScreenshot',{format:'jpeg',quality:82,captureBeyondViewport:false});await fs.writeFile(path.join(out,name+'.jpg'),Buffer.from(image.data,'base64'));screenshots.push(name+'.jpg');}
try{
 chrome=await browser();await chrome.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const locale of LOCALES)for(const width of [320,390,480,768,1024,1440,1920])await check(locale+' CV '+width,async()=>{
  await chrome.go(base+cvPath(locale),width,1000);const m=await chrome.evaluate('('+inspectLayout.toString()+')()');
  assert.equal(m.overflow,0);assert.equal(m.h1,1);assert.equal(m.language,locale);assert.equal(m.smallControls.length,0);assert.equal(m.unnamedControls.length,0);assert.ok(m.maxGridDrift<=1);assert.ok(m.bodyContrast>=4.5);
  assert.equal(await chrome.evaluate('document.querySelectorAll(".cv-entry").length'),34);assert.equal(await chrome.evaluate('document.querySelectorAll(".cv-section").length'),5);
  assert.equal(await chrome.evaluate('document.querySelector("[data-cv-menu]").getAttribute("aria-current")'),'page');
  if([390,768,1440].includes(width))await capture(locale+'-'+width);return {metrics:m};
 });
 for(const locale of LOCALES)await check(locale+' home biography CTA',async()=>{
  await chrome.go(base+localePath(locale),390,900);await chrome.evaluate('document.getElementById("about").scrollIntoView({behavior:"instant"})');await click('#about [data-cv-link]');
  assert.equal(await chrome.evaluate('location.pathname'),data.site.basePath+cvPath(locale));assert.ok(await chrome.evaluate('scrollY<=1'));
 });
 for(const locale of LOCALES)for(const width of [390,1440])await check(locale+' menu entry '+width,async()=>{
  await chrome.go(base+localePath(locale),width,900);if(width<1024)await chrome.evaluate('document.querySelector("[data-menu-open]").click()');await click((width<1024?'[data-navigation]':'.desktop-navigation')+' [data-cv-menu]');
  assert.equal(await chrome.evaluate('location.pathname'),data.site.basePath+cvPath(locale));assert.ok(await chrome.evaluate('!document.querySelector("[data-navigation]").open'));
 });
 for(const from of LOCALES)for(const to of LOCALES.filter(l=>l!==from))await check(from+' to '+to+' same CV reading section',async()=>{
  await chrome.go(base+cvPath(from),390,1000);await chrome.evaluate('document.getElementById("cv-exhibitions").scrollIntoView({behavior:"instant"})');
  const before=await chrome.evaluate('document.getElementById("cv-exhibitions").getBoundingClientRect().top');
  await chrome.evaluate('document.querySelector("[data-menu-open]").click()');await click('[data-navigation] [hreflang="'+to+'"]');
  assert.equal(await chrome.evaluate('location.pathname'),data.site.basePath+cvPath(to));assert.equal(await chrome.evaluate('location.hash'),'');
  assert.ok(Math.abs((await chrome.evaluate('document.getElementById("cv-exhibitions").getBoundingClientRect().top'))-before)<=2);
 });
 for(const locale of LOCALES)await check(locale+' selected painting link',async()=>{
  await chrome.go(base+cvPath(locale),390,1000);await click('#cv-paintings-maternidade-2026 a');
  assert.equal(await chrome.evaluate('document.querySelector("h1").textContent'),'Poço da Maternidade');assert.equal(await chrome.evaluate('location.pathname'),data.site.basePath+localePath(locale)+'works/maternidade-2026/');
 });
 for(const [locale,width,id] of [['pt-BR',1440,'cv-paintings'],['pt-BR',390,'cv-exhibitions'],['fr',768,'cv-cultural-actions'],['en',1440,'cv-analogiaeu']]){
  await chrome.go(base+cvPath(locale),width,1000);await chrome.evaluate('document.getElementById('+JSON.stringify(id)+').scrollIntoView({behavior:"instant"})');await capture(locale+'-'+id+'-'+width);
 }
 for(const locale of LOCALES)await check(locale+' no JavaScript curriculum and native navigation',async()=>{
  await chrome.call('Emulation.setScriptExecutionDisabled',{value:true});
  try{await chrome.go(base+cvPath(locale),390,1000);assert.equal(await chrome.evaluate('document.querySelectorAll(".cv-entry").length'),34);
   await chrome.evaluate('document.querySelector(".mobile-fallback summary").click()');
   assert.ok(await chrome.evaluate('document.querySelector(".mobile-fallback").open'));assert.equal(await chrome.evaluate('document.querySelectorAll(".mobile-fallback [data-locale-link]").length'),LOCALES.length);
   assert.equal(await chrome.evaluate('document.querySelector(".mobile-fallback [data-cv-menu]").pathname'),data.site.basePath+cvPath(locale));
   await capture(locale+'-no-js');
  }finally{await chrome.call('Emulation.setScriptExecutionDisabled',{value:false});}
 });
 for(const locale of LOCALES)await check(locale+' CV privacy includes metadata and footer',async()=>{
  await chrome.go(base+cvPath(locale),390,1000);
  assert.doesNotMatch(await chrome.evaluate('document.documentElement.outerHTML'),/mailto:|tel:|@gmail|birthDate|birthPlace|telephone|homeLocation|alumniOf|1993|Petrolina|autodidata|self-taught|autodidacte|autodidacta|Ensino médio completo/i);
  assert.equal(await chrome.evaluate('document.querySelectorAll("main img,main iframe").length'),0);
 });
 for(const locale of LOCALES)await check(locale+' back to portfolio and existing painting links',async()=>{
  await chrome.go(base+cvPath(locale),1440,1000);await click('.cv-work-link');assert.ok((await chrome.evaluate('location.pathname')).endsWith('/works/amor-incondicional-2026/'));
  await chrome.go(base+cvPath(locale),1440,1000);await click('.cv-back');assert.equal(await chrome.evaluate('location.pathname'),data.site.basePath+localePath(locale));
 });
 await check('CV keyboard drawer Escape and current language',async()=>{
  await chrome.go(base+cvPath('pt-BR'),390,1000);await chrome.evaluate('document.querySelector("[data-menu-open]").click()');
  await chrome.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await chrome.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  assert.ok(await chrome.evaluate('document.activeElement.hasAttribute("data-menu-open")&&!document.querySelector("[data-navigation]").open'));
  await chrome.evaluate('document.getElementById("cv-paintings").scrollIntoView({behavior:"instant"})');const y=await chrome.evaluate('scrollY');await chrome.evaluate('document.querySelector("[data-menu-open]").click()');
  await chrome.evaluate(`document.querySelector('[data-navigation] [hreflang="pt-BR"]').click()`);await pause(120);assert.equal(await chrome.evaluate('scrollY'),y);
 });
 await check('CV native index and printable layout',async()=>{
  await chrome.go(base+cvPath('pt-BR'),1440,1000);await chrome.evaluate(`document.querySelector('.cv-index a[href="#cv-paintings"]').click()`);await pause(120);
  assert.equal(await chrome.evaluate('location.hash'),'#cv-paintings');await capture('pt-paintings-desktop');
  await chrome.evaluate('document.getElementById("cv-analogiaeu").scrollIntoView({behavior:"instant"})');await capture('pt-analogiaeu-desktop');
  await chrome.call('Emulation.setEmulatedMedia',{media:'print'});
  try{assert.equal(await chrome.evaluate('getComputedStyle(document.querySelector(".site-header")).display'),'none');assert.equal(await chrome.evaluate('document.querySelectorAll(".cv-entry").length'),34);assert.ok(await chrome.evaluate('document.documentElement.scrollWidth<=innerWidth'));}
  finally{await chrome.call('Emulation.setEmulatedMedia',{media:'screen',features:[{name:'prefers-reduced-motion',value:'reduce'}]});}
 });
 for(const locale of LOCALES){
  await chrome.go(base+cvPath(locale),390,1000);await chrome.evaluate('document.getElementById("cv-paintings").scrollIntoView({behavior:"instant"})');await capture(locale+'-paintings-mobile');
  await chrome.evaluate('document.getElementById("cv-analogiaeu").scrollIntoView({behavior:"instant"})');await capture(locale+'-analogiaeu-mobile');
 }
 await check('Double-size text on CV keeps horizontal reflow',async()=>{
  await chrome.go(base+cvPath('pt-BR'),1024,1000);await chrome.call('DOM.enable');await chrome.call('CSS.enable');const {frameTree}=await chrome.call('Page.getFrameTree');const {styleSheetId}=await chrome.call('CSS.createStyleSheet',{frameId:frameTree.frame.id});
  await chrome.call('CSS.setStyleSheetText',{styleSheetId,text:'html { font-size: 200% !important; }'});await pause(120);
  assert.ok(await chrome.evaluate('document.documentElement.scrollWidth<=innerWidth'));assert.equal(await chrome.evaluate('parseFloat(getComputedStyle(document.body).fontSize)'),32);await capture('pt-BR-text-200');
 });
 await check('Print layout preserves all CV records',async()=>{
  await chrome.go(base+cvPath('pt-BR'),1440,1000);await chrome.call('Emulation.setEmulatedMedia',{media:'print'});assert.equal(await chrome.evaluate('getComputedStyle(document.querySelector(".site-header")).display'),'none');assert.equal(await chrome.evaluate('getComputedStyle(document.querySelector(".cv-entry")).breakInside'),'avoid');assert.equal(await chrome.evaluate('document.querySelectorAll(".cv-entry").length'),34);await capture('pt-BR-print');await chrome.call('Emulation.setEmulatedMedia',{media:'screen'});
 });
 const report={date:new Date().toISOString(),live,url:base,browser:(await chrome.call('Browser.getVersion')).product,results,screenshots,checks:results.length,failures:results.filter(r=>r.status==='FAIL').length,limits:['Browser emulation and doubled text are not physical-device or assistive-technology user tests','Independent EN/FR editorial review remains pending']};
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,results:undefined}));if(report.failures){console.log(JSON.stringify(results.filter(r=>r.status==='FAIL')));process.exitCode=1;}
}finally{await chrome?.close();if(server){server.server.closeAllConnections();await new Promise(resolve=>server.server.close(resolve));}}

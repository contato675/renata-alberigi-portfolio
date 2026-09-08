import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {loadContent} from './load.mjs';
import {LOCALES,localePath} from './i18n.mjs';
import {startServer} from './serve.mjs';
import {browser,pause} from './audit/cdp.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=await loadContent(root),live=process.argv.includes('--live');
const server=live?null:await startServer(path.join(root,'dist'),data.site.basePath);
const base=live?data.site.origin+data.site.basePath:server.url;
const results=[],screenshots=[],out=path.join(root,'artifacts/locale-navigation'+(live?'-live':''));
await fs.mkdir(out,{recursive:true});let chrome;
async function check(name,run){try{const evidence=await run();results.push({name,status:'PASS',...evidence});}catch(error){results.push({name,status:'FAIL',error:error.message});}console.log('LOCALE_CHECK | '+name+' | '+results.at(-1).status);}
async function settled(pathname){
 for(let i=0;i<200;i++){try{if(await chrome.evaluate(`location.pathname===${JSON.stringify(pathname)}&&document.readyState==='complete'`)){await pause(150);return;}}catch{}await pause(40);}
 throw new Error('Locale destination did not settle: '+pathname);
}
async function choose(locale,width){
 if(width<1024)await chrome.evaluate("document.querySelector('[data-menu-open]').click()");
 const selector=(width<1024?'[data-navigation]':'.desktop-navigation')+' [data-locale-link][hreflang="'+locale+'"]';
 const destination=await chrome.evaluate(`document.querySelector(${JSON.stringify(selector)}).pathname`);
 await chrome.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
 await settled(destination);
 return chrome.evaluate('({language:document.documentElement.lang,path:location.pathname,hash:location.hash,y:scrollY})');
}
async function capture(name){const {data:bytes}=await chrome.call('Page.captureScreenshot',{format:'jpeg',quality:75,captureBeyondViewport:false});await fs.writeFile(path.join(out,name+'.jpg'),Buffer.from(bytes,'base64'));screenshots.push(name+'.jpg');}
try{
 chrome=await browser();await chrome.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const width of [390,1440])for(const from of LOCALES)for(const to of LOCALES.filter(l=>l!==from))await check(`${from} -> ${to}: stale #works at top, ${width}px`,async()=>{
  await chrome.go(base+localePath(from)+'#works',width,900);
  await chrome.evaluate("scrollTo({top:0,behavior:'instant'})");await pause(80);
  const before=await chrome.evaluate('({hash:location.hash,y:scrollY})');assert.equal(before.y,0);
  const after=await choose(to,width);assert.equal(after.language,to);assert.equal(after.hash,'');assert.ok(after.y<=1,JSON.stringify(after));return {before,after};
 });
 for(const from of LOCALES)for(const section of ['film','digital','about'])await check(`${from}: preserve actual ${section} section despite old #works`,async()=>{
  const to=LOCALES[(LOCALES.indexOf(from)+1)%LOCALES.length];
  await chrome.go(base+localePath(from)+'#works',390,900);
  await chrome.evaluate(`document.getElementById(${JSON.stringify(section)}).scrollIntoView({behavior:'instant',block:'start'})`);await pause(80);
  const before=await chrome.evaluate(`({y:scrollY,top:document.getElementById(${JSON.stringify(section)}).getBoundingClientRect().top})`);
  const after=await choose(to,390);
  const top=await chrome.evaluate(`document.getElementById(${JSON.stringify(section)}).getBoundingClientRect().top`);
  assert.equal(after.hash,'');assert.ok(after.y>0);assert.ok(Math.abs(top-before.top)<=2,JSON.stringify({before,after,top}));return {before,after,sectionTop:top};
 });
 for(const locale of LOCALES)await check(`${locale}: selecting current language is a no-op`,async()=>{
  await chrome.go(base+localePath(locale)+'#works',390,900);await chrome.evaluate("scrollTo({top:0,behavior:'instant'})");
  const before=await chrome.evaluate('location.href');await choose(locale,390);
  assert.equal(await chrome.evaluate('location.href'),before);assert.equal(await chrome.evaluate('scrollY'),0);
  assert.equal(await chrome.evaluate("document.querySelector('[data-navigation]').open"),false);
 });
 for(const from of LOCALES)await check(`${from}: permanent project route remains equivalent`,async()=>{
  const to=LOCALES[(LOCALES.indexOf(from)+1)%LOCALES.length];
  await chrome.go(base+localePath(from)+'works/digital-02/',390,900);
  const result=await choose(to,390);assert.equal(result.path,data.site.basePath+localePath(to)+'works/digital-02/');assert.equal(result.language,to);assert.equal(result.hash,'');
  assert.equal(await chrome.evaluate("document.querySelectorAll('.work-images img').length"),5);
 });
 await check('French viewer language link opens the equivalent project, not a stale gallery hash',async()=>{
  await chrome.go(base+'fr/',390,900);await chrome.evaluate("document.querySelector('[data-open-project=\"amor-incondicional-2026\"]').click()");
  assert.ok(await chrome.evaluate("document.querySelector('dialog[data-project][open]').open"));
  await chrome.evaluate("document.querySelector('dialog[data-project][open] [data-locale-link][hreflang=\"pt-BR\"]').click()");await settled(data.site.basePath+'pt-br/works/amor-incondicional-2026/');
  const state=await chrome.evaluate('({hash:location.hash,y:scrollY,lang:document.documentElement.lang})');assert.equal(state.hash,'');assert.equal(state.lang,'pt-BR');assert.ok(state.y<=1);return state;
 });
 await check('Back and Forward retain native navigation without replaying a consumed scroll token',async()=>{
  await chrome.go(base+'#works',1440,900);await chrome.evaluate("scrollTo({top:0,behavior:'instant'})");await choose('fr',1440);
  assert.equal(await chrome.evaluate("sessionStorage.getItem('renata.locale-scroll.v1')"),null);
  await chrome.evaluate('history.back()');await settled(data.site.basePath);assert.equal(await chrome.evaluate('document.documentElement.lang'),'en');
  await chrome.evaluate('history.forward()');await settled(data.site.basePath+'fr/');assert.equal(await chrome.evaluate('document.documentElement.lang'),'fr');assert.ok((await chrome.evaluate('scrollY'))<=1);
 });
 await check('Disabled sessionStorage keeps native language links working without stale-hash jumps',async()=>{
  const {identifier}=await chrome.call('Page.addScriptToEvaluateOnNewDocument',{source:"Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new DOMException('Blocked for test','SecurityError');}});"});
  try{await chrome.go(base+'#works',390,900);await chrome.evaluate("scrollTo({top:0,behavior:'instant'})");const result=await choose('fr',390);assert.equal(result.hash,'');assert.ok(result.y<=1);assert.equal(result.language,'fr');}
  finally{await chrome.call('Page.removeScriptToEvaluateOnNewDocument',{identifier});}
 });
 await check('French permanent detail and all three menu links remain usable without JavaScript',async()=>{
  await chrome.call('Emulation.setScriptExecutionDisabled',{value:true});
  try{await chrome.go(base+'fr/works/digital-02/',390,900);assert.equal(await chrome.evaluate("document.querySelectorAll('.work-images img').length"),5);await chrome.evaluate("document.querySelector('.mobile-fallback summary').click()");assert.equal(await chrome.evaluate("document.querySelectorAll('.mobile-fallback [data-locale-link]').length"),3);assert.equal(await chrome.evaluate('document.documentElement.lang'),'fr');await capture('fr-detail-no-javascript');}
  finally{await chrome.call('Emulation.setScriptExecutionDisabled',{value:false});}
 });
 await check('French desktop, mobile, drawer and gallery use full translated controls without overflow',async()=>{
  await chrome.go(base+'fr/',1440,900);await chrome.evaluate("document.querySelector('.portrait img').decode()");assert.ok(await chrome.evaluate('document.documentElement.scrollWidth<=innerWidth'));await capture('fr-desktop');
  await chrome.go(base+'fr/',390,900);await chrome.evaluate("document.querySelector('.portrait img').decode()");await capture('fr-mobile');await chrome.evaluate("document.querySelector('[data-menu-open]').click()");await capture('fr-drawer');
  assert.equal(await chrome.evaluate("document.querySelector('[data-menu-close]').getAttribute('aria-label')"),data.dictionaries.fr.closeMenu);
  await chrome.evaluate("document.querySelector('[data-menu-close]').click();document.querySelector('[data-open-project=\"amor-incondicional-2026\"]').click()");await pause(100);
  assert.equal(await chrome.evaluate("document.querySelector('dialog[data-project][open] output').textContent"),'1 sur 14');assert.equal(await chrome.evaluate("document.querySelector('dialog[data-project][open] [data-close]').textContent"),data.dictionaries.fr.close);
  await capture('fr-viewer');
 });
 for(const locale of LOCALES)for(const width of [320,1440])await check(locale+' films without subtitle and Instagram footer '+width,async()=>{
  await chrome.go(base+localePath(locale),width,900);
  const info=await chrome.evaluate(`(()=>{const section=document.getElementById('film'),footer=document.querySelector('footer'),link=footer.querySelector('a[href*="instagram.com"]'),rect=link?.getBoundingClientRect();return {subtitle:section.querySelector('.section-heading .meta')?.textContent??null,iframes:document.querySelectorAll('iframe').length,videos:section.querySelectorAll('[data-video]').length,url:link?.href,label:link?.getAttribute('aria-label'),target:link?.target,rel:link?.rel,touchTarget:!!rect&&rect.width>=44&&rect.height>=44,overflow:document.documentElement.scrollWidth-innerWidth};})()`);
  assert.equal(info.subtitle,null);assert.equal(info.iframes,0);assert.equal(info.videos,2);assert.equal(info.url,data.artist.instagram);assert.equal(info.label,data.dictionaries[locale].instagramProfile);assert.equal(info.target,'_blank');assert.ok(info.rel.includes('noopener')&&info.rel.includes('noreferrer'));assert.ok(info.touchTarget);assert.ok(info.overflow<=1);
  if(locale==='fr'){await chrome.evaluate("document.getElementById('film').scrollIntoView({behavior:'instant'})");await capture('fr-films-'+width);await chrome.evaluate("document.getElementById('contact').scrollIntoView({behavior:'instant'})");await capture('fr-footer-'+width);}
  return info;
 });
 const report={date:new Date().toISOString(),live,url:base,browser:(await chrome.call('Browser.getVersion')).product,locales:LOCALES,results,screenshots,failures:results.filter(r=>r.status==='FAIL').length,limits:['Browser emulation is not a physical device or screen-reader-user test','Position restoration requires JavaScript and available tab storage; native links still work without them']};
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,results:undefined}));if(report.failures){console.log(JSON.stringify(report.results.filter(r=>r.status==='FAIL')));process.exitCode=1;}
}finally{await chrome?.close();if(server){server.server.closeAllConnections();await new Promise(resolve=>server.server.close(resolve));}}

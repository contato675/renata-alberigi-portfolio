import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {loadContent} from './load.mjs';
import {startServer} from './serve.mjs';
import {browser,pause} from './audit/cdp.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=await loadContent(root),work=data.works.find(w=>w.collection==='brand-design');
const output=path.join(root,'artifacts/brand-review');await fs.mkdir(output,{recursive:true});
const server=await startServer(path.join(root,'dist'),data.site.basePath),results=[];let chrome;
async function check(name,run){try{await run();results.push({name,status:'PASS'});}catch(error){results.push({name,status:'FAIL',error:error.message});}}
async function capture(name){const {data:bytes}=await chrome.call('Page.captureScreenshot',{format:'jpeg',quality:65,captureBeyondViewport:false});await fs.writeFile(path.join(output,name+'.jpg'),Buffer.from(bytes,'base64'));}
try{
 chrome=await browser();await chrome.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const locale of ['en','pt-BR'])for(const width of [390,768,1440])await check(locale+' one-row brand collection '+width,async()=>{
  await chrome.go(server.url+(locale==='en'?'':'pt-br/'),width,900);await chrome.evaluate("document.getElementById('brand-design').scrollIntoView({behavior:'instant'})");await pause(180);
  const v=await chrome.evaluate(`(()=>{const rail=document.querySelector('.brand-rail'),items=[...rail.children],tops=items.map(e=>e.getBoundingClientRect().top);return {count:items.length,rows:Math.max(...tops)-Math.min(...tops),overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),hasHorizontal:rail.scrollWidth>rail.clientWidth,afterDigital:document.querySelector('#digital').nextElementSibling.id,fit:getComputedStyle(rail.querySelector('img')).objectFit,link:document.querySelector('.brand-actions a').pathname};})()`);
  assert.equal(v.count,66);assert.equal(v.rows,0);assert.equal(v.overflow,0);assert.ok(v.hasHorizontal);assert.equal(v.afterDigital,'brand-design');assert.equal(v.fit,'contain');assert.ok(v.link.endsWith('/works/'+work.id+'/'));
  await chrome.evaluate("document.querySelector('[data-brand-next]').click()");await pause(120);assert.ok(await chrome.evaluate("document.querySelector('.brand-rail').scrollLeft>0"));
  await chrome.evaluate("document.querySelector('[data-brand-prev]').click()");await pause(120);assert.ok(await chrome.evaluate("document.querySelector('.brand-rail').scrollLeft<2"));
  if(width===390||width===1440)await capture('brand-'+locale+'-'+width);
 });
 await check('An image opens the correct position in the complete brand viewer',async()=>{
  await chrome.evaluate("document.querySelectorAll('.brand-rail a')[7].click()");await pause(120);const v=await chrome.evaluate("({count:document.querySelector('dialog[data-project][open]').querySelectorAll('.image-rail img').length,index:document.querySelector('dialog[data-project][open] output').textContent})");assert.equal(v.count,66);assert.ok(v.index.startsWith('8 '));
  await chrome.evaluate("document.querySelector('dialog[data-project][open] [data-close]').click()");await pause(120);
 });
 for(const locale of ['en','pt-BR'])await check(locale+' complete project page with every design',async()=>{
  await chrome.go(server.url+(locale==='en'?'':'pt-br/')+'works/'+work.id+'/',locale==='en'?1440:390,900);
  const v=await chrome.evaluate("({images:document.querySelectorAll('.brand-full-gallery img').length,h1:document.querySelectorAll('h1').length,overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),last:!!document.getElementById('brand-image-66')})");assert.deepEqual(v,{images:66,h1:1,overflow:0,last:true});
  await capture('brand-page-'+locale);
  await chrome.evaluate("document.querySelector('.brand-full-gallery [data-start=\"65\"]').click()");await pause(120);assert.ok((await chrome.evaluate("document.querySelector('dialog[data-project][open] output').textContent")).startsWith('66 '));assert.ok(await chrome.evaluate("document.querySelector('dialog[data-project][open] [data-next]').disabled"));
 });
 await check('Vertical wheel on the horizontal collection still scrolls the page',async()=>{
  await chrome.go(server.url,390,900);await chrome.evaluate("document.getElementById('brand-design').scrollIntoView({behavior:'instant'})");
  const p=await chrome.evaluate("(()=>{const r=document.querySelector('.brand-rail').getBoundingClientRect();return {x:r.left+80,y:r.top+60,scroll:scrollY};})()");
  await chrome.call('Input.dispatchMouseEvent',{type:'mouseWheel',x:p.x,y:p.y,deltaX:0,deltaY:360});await pause(160);assert.ok((await chrome.evaluate('scrollY'))>p.scroll);
 });
 await check('Collection page remains complete without JavaScript',async()=>{
  await chrome.call('Emulation.setScriptExecutionDisabled',{value:true});
  try{await chrome.go(server.url+'works/'+work.id+'/',390,900);assert.equal(await chrome.evaluate("document.querySelectorAll('.brand-full-gallery img').length"),66);assert.equal(await chrome.evaluate("document.querySelectorAll('.brand-full-gallery a[href$=\".webp\"]').length"),66);}finally{await chrome.call('Emulation.setScriptExecutionDisabled',{value:false});}
 });
 const report={date:new Date().toISOString(),browser:(await chrome.call('Browser.getVersion')).product,collection:work.id,images:work.images.length,results,failures:results.filter(r=>r.status==='FAIL').length,limits:['All imagery is supplied brand presentation material; source files remain local','Synthetic browser wheel and keyboard checks do not replace real iOS/Android touch or screen-reader-user evaluation']};
 await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.failures)process.exitCode=1;
}finally{await chrome?.close();server.server.closeAllConnections();await new Promise(resolve=>server.server.close(resolve));}

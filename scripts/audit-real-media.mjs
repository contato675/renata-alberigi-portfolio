import {inspectMediaMetadata} from './audit/media-metadata.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {loadContent} from './load.mjs';
import {startServer} from './serve.mjs';
import {browser,pause} from './audit/cdp.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=await loadContent(root);
const server=await startServer(path.join(root,'dist'),data.site.basePath),results=[];
let chrome;
async function check(name,run){try{await run();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.message});}}
async function capture(name){const r=await chrome.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(root,'artifacts/apple-like/screenshots/'+name+'.png'),Buffer.from(r.data,'base64'));}
try{
 chrome=await browser();await chrome.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const locale of ['en','pt-BR']){
  await chrome.go(server.url+(locale==='en'?'':'pt-br/'),locale==='en'?1440:390,900);
  await check(locale+' collection counts and sequence',async()=>{const v=await chrome.evaluate(`({hand:document.querySelectorAll('#works [data-open-project]').length,digital:document.querySelectorAll('#digital [data-open-project]').length,first:document.querySelector('[data-collection]').dataset.collection})`);assert.deepEqual(v,{hand:9,digital:11,first:'paintings'});});
  for(const w of data.works)await check(locale+' viewer '+w.id,async()=>{
   await chrome.evaluate(`document.querySelector('[data-open-project="${w.id}"]').click()`);await pause(80);
   const v=await chrome.evaluate(`(()=>{const d=document.querySelector('dialog[open]');return {id:d.dataset.project,count:d.querySelectorAll('.image-rail img').length,overflow:d.scrollWidth-d.clientWidth};})()`);
   assert.equal(v.id,w.id);assert.equal(v.count,w.images.length);assert.ok(v.overflow<=1);
   if(w.images.length>1){await chrome.evaluate(`document.querySelector('dialog[open] [data-next]').click()`);await pause(60);assert.ok((await chrome.evaluate(`document.querySelector('dialog[open] output').textContent`)).startsWith('2 '));}
   if(w===data.works[0]||w.id==='digital-03')await capture('real-viewer-'+locale+'-'+w.id);
   await chrome.evaluate(`document.querySelector('dialog[open] [data-close]').click()`);await pause(80);
  });
 }
 await check('both supplied YouTube players are click-to-load without autoplay',async()=>{
  await chrome.go(server.url,1440,900);assert.equal(await chrome.evaluate('document.querySelectorAll("iframe").length'),0);
  const ids=['Q1bbei1X3VA','hS3SNQcha2o'];
  for(let i=0;i<ids.length;i++){
   await chrome.evaluate('document.querySelector("[data-video]").click()');await pause(250);
   const frames=await chrome.evaluate('[...document.querySelectorAll("iframe")].map(f=>({src:f.src,title:f.title,referrer:f.referrerPolicy}))');
   assert.ok(frames[i].src.startsWith('https://www.youtube-nocookie.com/embed/'+ids[i]));assert.ok(!frames[i].src.includes('autoplay=1'));assert.ok(frames[i].title.length>5);assert.equal(frames[i].referrer,'strict-origin-when-cross-origin');
  }
 });
 await check('all 42 permanent project pages return localized complete HTML',async()=>{
  for(const locale of ['en','pt-BR'])for(const w of data.works){const url=server.url+(locale==='en'?'':'pt-br/')+'works/'+w.id+'/';const r=await fetch(url),html=await r.text();assert.equal(r.status,200);assert.ok(html.includes('lang="'+locale+'"'));assert.ok(html.includes(w.images.at(-1).path));assert.ok(html.includes('noindex'));}
 });
 await check('preview media has no EXIF GPS/XMP metadata and no original file extensions',async()=>{
  const media=await inspectMediaMetadata(root,data);assert.equal(media.personalMetadata,0);assert.ok(media.images>=192);
 });
 const report={date:new Date().toISOString(),browser:(await chrome.call('Browser.getVersion')).product,works:data.works.length,artworkImages:data.works.reduce((n,w)=>n+w.images.length,0),results,failures:results.filter(r=>r.status==='FAIL').length,limits:['YouTube frame source and consent verified; playback/network availability controlled by YouTube','Real-device gestures, assistive-technology and artist colour/title approval remain pending']};
 await fs.writeFile(path.join(root,'artifacts/apple-like/real-media-report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));if(report.failures)process.exitCode=1;
}finally{await chrome?.close();server.server.closeAllConnections();await new Promise(r=>server.server.close(r));}

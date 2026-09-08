import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {loadContent} from './load.mjs';
import {LOCALES} from './i18n.mjs';
import {cvPath} from './curriculum.mjs';
import {browser,pause} from './audit/cdp.mjs';
import {startServer} from './serve.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),data=await loadContent(root),live=process.argv.includes('--live');
const server=live?null:await startServer(path.join(root,'dist'),data.site.basePath),base=live?data.site.origin+data.site.basePath:server.url;
const dir=path.join(root,'artifacts/editorial-v2'+(live?'-live':''));await fs.mkdir(dir,{recursive:true});
let chrome;const results=[],shots=[];
async function check(name,run){try{const info=await run();results.push({name,status:'PASS',...info});}catch(e){results.push({name,status:'FAIL',error:e.message});}console.log('EDITORIAL_V2 | '+name+' | '+results.at(-1).status);}
try{
 chrome=await browser();await chrome.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const locale of LOCALES)for(const width of [320,390,1440])await check(locale+' editorial and titles '+width,async()=>{
  await chrome.go(base+cvPath(locale),width,1000);
  const state=await chrome.evaluate(`(()=>{const row=id=>document.getElementById('cv-'+id),title=id=>row(id).querySelector('h3').textContent.trim();return {count:document.querySelectorAll('.cv-entry').length,exhibitions:document.querySelectorAll('#cv-exhibitions .cv-entry').length,post:title('exhibitions-pos-futurismo'),renascida:title('exhibitions-renascida'),nibia:title('paintings-nibia-2023'),dimensions:{lar:row('paintings-lar-2026').querySelector('.cv-detail').textContent,nibia:row('paintings-nibia-2023').querySelector('.cv-detail').textContent,correnteza:row('paintings-correnteza-2022').querySelector('.cv-detail').textContent},protected:row('exhibitions-renascida').querySelector('h3').getAttribute('translate'),mav:row('cultural-actions-municipal-workshops').textContent,cafe:row('exhibitions-renascida').textContent,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),bad:/d[ií]zimo|Re-nascimento/.test(document.querySelector('main').textContent)};})()`);
  assert.equal(state.count,33);assert.equal(state.exhibitions,9);assert.equal(state.post,'O começo do pós-futurismo');assert.equal(state.renascida,'Re-nascida');assert.equal(state.nibia,'Níbia');assert.equal(state.protected,'no');assert.equal(state.bad,false);assert.equal(state.overflow,0);
  assert.ok(state.mav.includes('(MAV)'));assert.ok(state.cafe.includes('Café del Tiempo'));assert.ok(state.dimensions.lar.endsWith('100 × 120'));assert.ok(state.dimensions.nibia.endsWith('130 × 130'));assert.ok(state.dimensions.correnteza.endsWith('70 cm × 100'));
  if(width!==320){await chrome.evaluate('document.getElementById("cv-exhibitions-pos-futurismo").scrollIntoView({behavior:"instant"})');await pause(80);const shot=await chrome.call('Page.captureScreenshot',{format:'jpeg',quality:80,captureBeyondViewport:false});const name=locale+'-'+width+'.jpg';await fs.writeFile(path.join(dir,name),Buffer.from(shot.data,'base64'));shots.push(name);}return {state};
 });
 if(live)for(const locale of LOCALES)await check(locale+' same HTML on mobile and desktop',async()=>{
  const text=[];for(const ua of ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)','Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)']){const r=await fetch(base+cvPath(locale),{headers:{'User-Agent':ua},signal:AbortSignal.timeout(25000)});assert.equal(r.status,200);text.push(await r.text());}
  assert.equal(text[0],text[1]);assert.doesNotMatch(text.join(''),/d[ií]zimo|Re-nascimento/);return {sameHTML:true,originalNames:true};
 });
 const report={date:new Date().toISOString(),live,base,checks:results.length,failures:results.filter(r=>r.status==='FAIL').length,results,screenshots:shots,limits:['No access to the user phone browser translation settings. Automatic retranslation is a hypothesis, not a confirmed device diagnosis.','Browser emulation does not certify physical-device or screen-reader behaviour.']};
 await fs.writeFile(path.join(dir,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,results:undefined}));if(report.failures)process.exitCode=1;
}finally{await chrome?.close();if(server){server.server.closeAllConnections();await new Promise(resolve=>server.server.close(resolve));}}

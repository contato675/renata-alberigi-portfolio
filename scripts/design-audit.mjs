import {mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {buildSite} from './build.mjs';
import {loadContent} from './load.mjs';
import {startServer} from './serve.mjs';
import {browser,pause} from './audit/cdp.mjs';
import {createFixtures} from './audit/fixtures.mjs';
import {inspectLayout} from './audit/metrics.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'artifacts/apple-like');
const screens=path.join(output,'screenshots');
const widths=[320,390,480,768,1024,1440,1920];
const results=[],checks=[],environmentResources=[];
const servers=[];
let chrome,temp;
async function screenshot(name) {
  const {data}=await chrome.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:!name.startsWith('viewer-')});
  const filename=`screenshots/${name}.png`;
  await writeFile(path.join(output,filename),Buffer.from(data,'base64'));
  return filename;
}
async function prepareVisualMedia() {
  await chrome.evaluate(`(async()=>{
    await document.fonts.ready;
    const position=scrollY;
    for(const image of [...document.querySelectorAll('main img')].filter(im=>im.getClientRects().length&&!im.closest('dialog'))) {
      image.scrollIntoView({behavior:'instant',block:'center'});
      await new Promise(resolve=>setTimeout(resolve,80));
      await Promise.race([image.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Image decode timeout')),3000))]);
    }
    scrollTo({top:position,behavior:'instant'});
  })()`);
}
async function check(name,fn) {
  try {await fn();checks.push({name,status:'PASS'});}catch(error){checks.push({name,status:'FAIL',error:error.message});}
}
try {
  await mkdir(screens,{recursive:true});
  const data=await loadContent(root);
  await buildSite(root);
  const real=await startServer(path.join(root,'dist'),data.site.basePath);servers.push(real.server);
  temp=await mkdtemp(path.join(os.tmpdir(),'renata-layout-fixture-'));
  const fixtureData=await createFixtures(root,temp,data);
  await buildSite(temp,{data:fixtureData});
  const fixture=await startServer(path.join(temp,'dist'),data.site.basePath);servers.push(fixture.server);
  chrome=await browser();
  const browserVersion=await chrome.call('Browser.getVersion');
  for(const [kind,base] of [['actual',real.url],['fixture',fixture.url]]) {
    for(const locale of ['en','pt-BR']) for(const width of widths) {
      const url=base+(locale==='en'?'':'pt-br/');
      await chrome.go(url,width,width<768?844:1000);
      await prepareVisualMedia();
      const metrics=await chrome.evaluate(`(${inspectLayout.toString()})()`);
      const failures=[];
      if(metrics.overflow>1)failures.push('horizontal-overflow');
      if(metrics.h1!==1)failures.push('h1-count');
      if(metrics.smallControls.length)failures.push('touch-target');
      if(metrics.unnamedControls.length)failures.push('control-name');
      if(metrics.imageProblems.length)failures.push('media-contract');
      if(metrics.maxGridDrift>1)failures.push('grid-drift');
      if(metrics.bodyContrast<4.5||metrics.secondaryContrast<4.5)failures.push('contrast');
      if(metrics.language!==locale)failures.push('locale');
      const image=await screenshot(`${kind}-${locale}-${width}`);
      results.push({kind,locale,width,status:failures.length?'FAIL':'PASS',failures,metrics,screenshot:image});
      console.log(`LAYOUT | ${kind} | ${locale} | ${width} | ${failures.length?failures.join(','):'PASS'}`);
    }
  }
  await check('native dialog: open, next, previous, Escape, focus and page position',async()=>{
    await chrome.go(fixture.url,1440,900);
    await chrome.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    const state=await chrome.evaluate(`(()=>{const a=document.querySelector('[data-open-project="audit-0"]');a.scrollIntoView();a.focus();const y=scrollY;a.click();return {y,open:document.querySelector('dialog[open]')?.dataset.project};})()`);
    assert.equal(state.open,'audit-0');await pause(150);
    assert.equal(await chrome.evaluate(`document.querySelector('dialog[open] output').textContent`),'1 of 3');
    await chrome.evaluate(`document.querySelector('dialog[open] [data-next]').click()`);await pause(100);
    assert.equal(await chrome.evaluate(`document.querySelector('dialog[open] output').textContent`),'2 of 3');
    await chrome.evaluate(`document.querySelector('dialog[open] [data-prev]').click()`);await pause(100);
    assert.equal(await chrome.evaluate(`document.querySelector('dialog[open] output').textContent`),'1 of 3');
    await screenshot('viewer-desktop');
    await chrome.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await chrome.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await pause(200);
    const closed=await chrome.evaluate(`({open:!!document.querySelector('dialog[open]'),focus:document.activeElement.dataset.openProject,y:scrollY})`);
    assert.equal(closed.open,false);assert.equal(closed.focus,'audit-0');assert.ok(Math.abs(closed.y-state.y)<=1);
  });
  await check('keyboard focus remains within native dialog',async()=>{
    await chrome.evaluate(`document.querySelector('[data-open-project="audit-0"]').click()`);
    for(let i=0;i<12;i++) {
      await chrome.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      await chrome.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      assert.ok(await chrome.evaluate(`!!document.activeElement.closest('dialog[open]')`));
    }
    await chrome.evaluate(`document.querySelector('dialog[open] [data-close]').click()`);await pause(150);
  });
  await check('single image hides pagination',async()=>{
    await chrome.evaluate(`document.querySelector('[data-open-project="audit-1"]').click()`);
    assert.ok(await chrome.evaluate(`document.querySelector('dialog[open] .viewer-controls').hidden`));
    await chrome.evaluate(`document.querySelector('dialog[open] [data-close]').click()`);await pause(150);
  });
  await check('mobile viewer: intact media, contained layout, close target',async()=>{
    await chrome.go(fixture.url+'pt-br/',390,844);
    await chrome.evaluate(`document.querySelector('[data-open-project="audit-0"]').click()`);await pause(150);
    const viewer=await chrome.evaluate(`(()=>{const d=document.querySelector('dialog[open]'),im=d.querySelector('img'),b=d.querySelector('[data-close]').getBoundingClientRect();return {overflow:d.scrollWidth-d.clientWidth,fit:getComputedStyle(im).objectFit,close:b.width>=44&&b.height>=44};})()`);
    assert.ok(viewer.overflow<=1);assert.equal(viewer.fit,'contain');assert.ok(viewer.close);
    await screenshot('viewer-mobile-pt-br');
  });
  await check('reduced motion disables overlay animation and smooth scroll',async()=>{
    const reduced=await chrome.evaluate(`({scroll:getComputedStyle(document.documentElement).scrollBehavior,animation:getComputedStyle(document.querySelector('dialog[open]')).animationName})`);
    assert.equal(reduced.scroll,'auto');assert.equal(reduced.animation,'none');
  });
  await check('browser Back closes gallery and Forward restores it',async()=>{
    await chrome.evaluate('history.back()');await pause(150);assert.equal(await chrome.evaluate(`!!document.querySelector('dialog[open]')`),false);
    await chrome.evaluate('history.forward()');await pause(150);assert.equal(await chrome.evaluate(`document.querySelector('dialog[open]')?.dataset.project`),'audit-0');
  });
  await check('project detail works without JavaScript',async()=>{
    await chrome.call('Emulation.setScriptExecutionDisabled',{value:true});
    try {
    await chrome.go(fixture.url+'pt-br/works/audit-0/',390,844);
    const count=await chrome.evaluate("document.querySelectorAll('.work-images img').length");
    for(let i=0;i<count;i++) {
      await chrome.evaluate(`document.querySelectorAll('.work-images img')[${i}].scrollIntoView({behavior:'instant'})`);
      await pause(100);
    }
    await chrome.evaluate("scrollTo({top:0,behavior:'instant'})");
    const metrics=await chrome.evaluate(`(${inspectLayout.toString()})()`);
    assert.equal(metrics.h1,1);assert.equal(metrics.overflow,0);assert.equal(metrics.language,'pt-BR');
    assert.equal(await chrome.evaluate(`document.querySelectorAll('.work-images img').length`),3);
    await screenshot('project-without-javascript');
    } finally { await chrome.call('Emulation.setScriptExecutionDisabled',{value:false}); }
  });
  await check('no player iframe or app third-party before click; OS injection recorded separately',async()=>{
    await chrome.go(fixture.url,390,844);
    assert.equal(await chrome.evaluate(`document.querySelectorAll('iframe').length`),0);
    const thirdParty=await chrome.evaluate(`performance.getEntriesByType('resource').filter(e=>new URL(e.name).origin!==location.origin).map(e=>new URL(e.name).origin)`);
    const osInjected=thirdParty.filter((origin)=>new URL(origin).hostname==='gc.kis.v2.scr.kaspersky-labs.com');
    environmentResources.push(...new Set(osInjected));
    assert.deepEqual(thirdParty.filter((origin)=>!osInjected.includes(origin)),[]);
  });
  await check('grid overlay uses the exact content box',async()=>{
    await chrome.go(real.url,1920,1000);
    await chrome.evaluate(`document.body.classList.add('grid-on')`);
    const drift=await chrome.evaluate(`(()=>{const g=document.querySelector('.hero.grid'),o=g.querySelector('.guides'),a=g.getBoundingClientRect(),b=o.getBoundingClientRect();return Math.max(Math.abs(a.left-b.left),Math.abs(a.right-b.right));})()`);
    assert.ok(drift<=1);await screenshot('grid-overlay-1920');
  });
  const failures=results.filter((r)=>r.status==='FAIL').length+checks.filter((r)=>r.status==='FAIL').length;
  const report={date:new Date().toISOString(),browser:browserVersion.product,platform:process.platform,policy:'Apple-like + Müller-Brockmann; no certification by Apple',status:failures?'FAIL':'PASS_WITH_EDITORIAL_PENDING',scope:{actual:`Portfolio preview with ${data.works.length} supplied artwork records and their photographs`,fixture:'Isolated neutral calibration media, not real artwork; never part of dist/',widths,locales:['en','pt-BR']},results,checks,environmentResources,environmentNote:environmentResources.length?'Observed OS antivirus injection, not app code. Security software was not disabled; external hosts are reported without query strings.':null,pending:['Final artist approval of titles, years, medium per work and photographic colour','Human review of the English biography','VoiceOver/TalkBack and real iOS/Android touch gestures','Real browser 200% text zoom and media fidelity/colour','Field performance measurements and live origin-root robots verification'],failures};
  await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`APPLE_AUDIT | ${report.status} | layouts=${results.length} | interactions=${checks.length} | failures=${failures}`);
  for(const result of results.filter((r)=>r.status==='FAIL'))console.log(JSON.stringify(result));
  for(const result of checks.filter((r)=>r.status==='FAIL'))console.log(JSON.stringify(result));
  if(failures)process.exitCode=1;
} catch(error){console.error('APPLE_AUDIT_FAIL: '+error.stack);process.exitCode=1;}
finally {
  await chrome?.close();
  for(const server of servers){server.closeAllConnections();await new Promise((resolve)=>server.close(resolve));}
  if(temp)await rm(temp,{recursive:true,force:true});
}

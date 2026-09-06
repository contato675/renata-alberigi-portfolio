import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
export const pause=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
export async function browser() {
  const candidates=[process.env.CHROME_BIN,'/usr/bin/chromium','/usr/bin/google-chrome',...(process.platform==='win32' ? [path.join(process.env.PROGRAMFILES||'C:\\Program Files','Google/Chrome/Application/chrome.exe'),path.join(process.env['PROGRAMFILES(X86)']||'C:\\Program Files (x86)','Microsoft/Edge/Application/msedge.exe')] : [])].filter(Boolean);
  const exe=candidates.find(existsSync);
  if (!exe) throw new Error('Chrome/Chromium not found. Set CHROME_BIN to an installed browser.');
  const profile=await mkdtemp(path.join(os.tmpdir(),'renata-audit-browser-'));
  const args=['--headless=new','--remote-debugging-port=0',`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--disable-background-networking'];
  if (process.env.AUDIT_NO_SANDBOX==='1') args.push('--no-sandbox'); // isolated Linux CI only; never disables the user's installed browser sandbox
  const child=spawn(exe,args,{stdio:['ignore','ignore','pipe']});
  let ws;
  try {
    const endpoint=await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('Browser launch timed out.')),15000);
      let text='';
      child.stderr.on('data',(chunk)=>{text+=chunk;const m=text.match(/DevTools listening on (ws:\/\/\S+)/);if(m){clearTimeout(timer);resolve(m[1]);}});
      child.once('error',(error)=>{clearTimeout(timer);reject(error);});
      child.once('exit',(code)=>{clearTimeout(timer);reject(new Error(`Browser exited early: ${code}`));});
    });
    ws=new WebSocket(endpoint);
    await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
    let id=0;
    const pending=new Map(),events=[];
    ws.addEventListener('message',(event)=>{
      const message=JSON.parse(event.data);
      if(message.id && pending.has(message.id)) {
        const p=pending.get(message.id);clearTimeout(p.timer);pending.delete(message.id);
        if(message.error)p.reject(new Error(JSON.stringify(message.error)));else p.resolve(message.result);
      } else events.push(message);
    });
    const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{
      const callId=++id,timer=setTimeout(()=>{pending.delete(callId);reject(new Error(`CDP timeout: ${method}`));},15000);
      pending.set(callId,{resolve,reject,timer});
      ws.send(JSON.stringify({id:callId,method,params,...(sessionId ? {sessionId}: {})}));
    });
    const {targetId}=await send('Target.createTarget',{url:'about:blank'});
    const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
    const call=(method,params={})=>send(method,params,sessionId);
    await call('Page.enable');await call('Runtime.enable');await call('Network.enable');await call('Accessibility.enable');
    const evaluate=async(expression)=>{
      const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});
      if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
      return result.result.value;
    };
    const go=async(url,width=1440,height=900)=>{
      await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
      const navigation=await call('Page.navigate',{url});
      if(navigation.errorText)throw new Error('Navigation blocked/failed: '+navigation.errorText+' '+url);
      for(let i=0;i<150;i++) {
        try {if(await evaluate(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`)){await evaluate('document.fonts.ready.then(()=>true)');await pause(120);return;}}catch{/* execution context may change during navigation */}
        await pause(40);
      }
      throw new Error('Navigation did not settle: '+url);
    };
    return {call,evaluate,go,events,exe,close:async()=>{try{await send('Browser.close');}catch{/* already stopped */}ws.close();if(child.exitCode===null)child.kill();await pause(200);await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:150});}};
  } catch(error){ws?.close();if(child.exitCode===null)child.kill();await pause(200);await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:150});throw error;}
}

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../site/assets/js/locale-navigation.js',import.meta.url),'utf8');
const origin='https://renataalberigi.com.br';
const makeAnchor=(id,top)=>({id,getClientRects:()=>[1],getBoundingClientRect:()=>({top,height:500})});
function environment({href=origin+'/',y=0,pending=null,anchors=[],navType='navigate',blocked=false}={}){
 let raw=pending===null?null:typeof pending==='string'?pending:JSON.stringify(pending),handler;
 const location=new URL(href),scrolls=[];
 const storage={getItem(){if(blocked)throw new Error('Storage disabled');return raw;},setItem(k,v){if(blocked)throw new Error('Storage disabled');raw=v;},removeItem(){if(blocked)throw new Error('Storage disabled');raw=null;}};
 const document={fonts:{ready:Promise.resolve()},querySelectorAll(selector){return selector.startsWith('.site-header')?['/','/pt-br/','/fr/'].map(p=>({href:origin+p})):anchors;},querySelector:()=>null,getElementById:id=>anchors.find(a=>a.id===id),addEventListener(name,fn){if(name==='click')handler=fn;}};
 const window={scrollY:y,addEventListener(){},scrollTo(value){scrolls.push(value.top);this.scrollY=value.top;}};
 vm.runInNewContext(source,{document,window,location,sessionStorage:storage,performance:{getEntriesByType:()=>[{type:navType}]},URL,requestAnimationFrame(){}});
 function click(path,extra={}){let prevented=false;const link={href:origin+path,target:'',hasAttribute:()=>false};const event={target:{closest:()=>link},button:0,preventDefault(){prevented=true;},...extra};handler(event);return {prevented,link,stored:raw?JSON.parse(raw):null};}
 return {click,scrolls,stored:()=>raw};
}
const record=(extra={})=>({version:1,at:Date.now(),destination:'/fr/',anchor:'about',offset:24,y:1000,...extra});
test('Locale navigation never copies a stale #works into a destination link',()=>{
 const e=environment({href:origin+'/#works',y:0}),result=e.click('/fr/');
 assert.equal(result.link.href,origin+'/fr/');assert.equal(result.stored.destination,'/fr/');assert.equal(result.stored.y,0);assert.equal(result.prevented,false);
});
test('The actual section within its scroll margin is preferred to a previous section',()=>{
 const e=environment({href:origin+'/#works',y:900,anchors:[makeAnchor('brand-design',-400),makeAnchor('about',24)]});const r=e.click('/fr/');assert.equal(r.stored.anchor,'about');assert.equal(r.stored.offset,24);
});
test('Current-language selection does not reload, and modified clicks keep native semantics',()=>{
 assert.equal(environment({href:origin+'/#works'}).click('/').prevented,true);
 for(const extra of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{defaultPrevented:true}]){const r=environment().click('/fr/',extra);assert.equal(r.prevented,false);assert.equal(r.stored,null);}
});
test('Project links from the home viewer are not assigned a home reading position',()=>{
 const r=environment({href:origin+'/#project-digital-02',y:900}).click('/fr/works/digital-02/');assert.equal(r.prevented,false);assert.equal(r.stored,null);
});
test('A valid one-shot record restores the equivalent landmark and is consumed',()=>{
 const e=environment({href:origin+'/fr/',pending:record(),anchors:[makeAnchor('about',200)]});assert.deepEqual(e.scrolls,[176]);assert.equal(e.stored(),null);
});
test('Missing landmark uses a bounded pixel fallback without inventing a URL fragment',()=>{
 const e=environment({href:origin+'/fr/',pending:record()});assert.deepEqual(e.scrolls,[1000]);
});
test('Expired, wrong-route, malformed and unsafe scroll records fail closed',()=>{
 for(const pending of ['{bad-json',record({at:Date.now()-60000}),record({at:Date.now()+60000}),record({destination:'/pt-br/'}),record({y:-1}),record({y:1e20}),record({offset:'bad'}),record({anchor:{unexpected:true}})]){const e=environment({href:origin+'/fr/',pending});assert.deepEqual(e.scrolls,[]);assert.equal(e.stored(),null);}
});
test('History traversal, reload and intentional fragments are not overridden by locale restoration',()=>{
 for(const navType of ['back_forward','reload'])assert.deepEqual(environment({href:origin+'/fr/',pending:record(),navType}).scrolls,[]);
 assert.deepEqual(environment({href:origin+'/fr/#about',pending:record()}).scrolls,[]);
});
test('Disabled storage does not break normal static language navigation',()=>{
 const e=environment({href:origin+'/#works',blocked:true}),r=e.click('/fr/');assert.equal(r.prevented,false);assert.equal(r.link.href,origin+'/fr/');assert.deepEqual(e.scrolls,[]);
});
test('The old blind hash propagation is absent and the shipped script has no network or unsafe DOM insertion',async()=>{
 const gallery=await readFile(new URL('../site/assets/js/gallery.js',import.meta.url),'utf8');assert.doesNotMatch(gallery,/link\.hash\s*=\s*location\.hash/);assert.doesNotMatch(source,/innerHTML|\beval\s*\(|\bfetch\s*\(|navigator\.language|localStorage/);
});

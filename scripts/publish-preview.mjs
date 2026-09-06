/** Deliberate publication of the approved, noindex PR preview. Never merges main. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {loadContent} from './load.mjs';
import {buildSite} from './build.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const repo='contato675/renata-alberigi-portfolio', branch='pages-preview';
const remote='https://github.com/'+repo+'.git';
const run=(cwd,...args)=>execFileSync('git',['-C',cwd,...args],{encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
if(!process.argv.includes('--confirm-public-preview'))throw new Error('Pass --confirm-public-preview after reviewing the public media.');
const data=await loadContent(root);
if(data.site.repo!==repo||!data.site.previewApproved||!data.site.previewPublic)throw new Error('Public preview not authorized.');
if(run(root,'branch','--show-current')!=='feat/english-ai-apple-audit')throw new Error('Expected PR branch.');
if(run(root,'status','--porcelain'))throw new Error('Commit and push reviewed changes before publishing.');
const source=run(root,'rev-parse','HEAD');
const pushed=run(root,'ls-remote','--heads',remote,'refs/heads/feat/english-ai-apple-audit').split(/\s/)[0];
if(pushed!==source)throw new Error('Local source is not the reviewed remote PR head.');
const mainBefore=run(root,'ls-remote','--heads',remote,'refs/heads/main').split(/\s/)[0];
const output=path.join(root,'dist');
await buildSite(root,{release:false});
const entries=JSON.parse(await fs.readFile(path.join(output,'.build-manifest.json'),'utf8'));
if(!entries.includes('index.html')||!entries.includes('.nojekyll'))throw new Error('Incomplete build.');
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'renata-pages-preview-'));
let pushedCommit;
try {
 const existing=run(root,'ls-remote','--heads',remote,'refs/heads/'+branch);
 if(existing){run(root,'clone','--branch',branch,'--single-branch','--depth','1',remote,temp);}
 else {run(temp,'init','--initial-branch='+branch);run(temp,'remote','add','origin',remote);}
 run(temp,'config','user.name',run(root,'config','user.name'));
 run(temp,'config','user.email','249978315+contato675@users.noreply.github.com');
 if(existing){
  let receipt;try{receipt=JSON.parse(await fs.readFile(path.join(temp,'preview-build.json'),'utf8'));}catch{throw new Error('Existing deployment branch is not owned by this publisher.');}
  if(receipt.repo!==repo||receipt.mode!=='public-preview-noindex')throw new Error('Foreign deployment branch.');
  for(const name of await fs.readdir(temp)){if(name!=='.git')await fs.rm(path.join(temp,name),{recursive:true,force:true});}
 }
 const hashes={};
 for(const entry of entries){
  if(entry.split('/').includes('..')||path.isAbsolute(entry)||/^(?:docs|scripts|tests|artifacts|\.git)\//.test(entry))throw new Error('Unsafe build entry.');
  const sourcePath=path.join(output,entry),stat=await fs.lstat(sourcePath);
  if(!stat.isFile()||stat.isSymbolicLink())throw new Error('Non-file output.');
  const content=await fs.readFile(sourcePath);
  if(entry.endsWith('.html')&&!/<meta name="robots" content="noindex[^"\n]*"/.test(content.toString()))throw new Error('Preview lacks noindex: '+entry);
  const target=path.join(temp,entry);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,content);
  hashes[entry]=createHash('sha256').update(content).digest('hex');
 }
 await fs.writeFile(path.join(temp,'preview-build.json'),JSON.stringify({repo,mode:'public-preview-noindex',sourceCommit:source,builtAt:new Date().toISOString(),files:entries.length,hashes},null,2)+'\n');
 run(temp,'add','--all');run(temp,'commit','-m','deploy: public noindex preview of PR #1 at '+source.slice(0,8));
 pushedCommit=run(temp,'rev-parse','HEAD');run(temp,'push','origin','HEAD:refs/heads/'+branch);
 const actual=run(temp,'ls-remote','--heads','origin','refs/heads/'+branch).split(/\s/)[0];
 if(actual!==pushedCommit)throw new Error('Deployment head not confirmed.');
 if(run(root,'ls-remote','--heads',remote,'refs/heads/main').split(/\s/)[0]!==mainBefore)throw new Error('Main changed externally; inspect before claiming it unchanged.');
 console.log(JSON.stringify({repo,sourceCommit:source,deployCommit:pushedCommit,branch,files:entries.length,mainUnchanged:true,pagesEnabledByThisScript:false}));
}finally{await fs.rm(temp,{recursive:true,force:true,maxRetries:3});}

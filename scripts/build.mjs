import {customDomainFiles} from './hosting.mjs';
import {addRouteAliases} from './route-aliases.mjs';
import {readFile,mkdir,writeFile,readdir,lstat,rm,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadContent,verifyFiles} from './load.mjs';
import {validateContent,publicationErrors,containedPath,allVideos,imagePaths} from './content.mjs';
import {LOCALES,localePath} from './i18n.mjs';
import {renderPage,pagePath,publicWorks} from './render.mjs';
import {pageMarkdown,llmsIndex,robotsText,sitemap,structuredPortfolio} from './discovery.mjs';
export function generatePages(data,template,{release=false}={}) {
  const errors=validateContent(data);
  if (release) errors.push(...publicationErrors(data));
  if (errors.length) throw new Error(errors.join('\n'));
  const files=customDomainFiles(data.site);
  for (const locale of LOCALES) {
    for (const work of [null,...publicWorks(data)]) {
      const route=pagePath(locale,work);
      files.set(route+'index.html',renderPage(data,template,locale,{work,release}));
      files.set(route+'index.md',pageMarkdown(data,locale,work));
    }
    files.set(localePath(locale)+'portfolio.json',JSON.stringify(structuredPortfolio(data,locale),null,2)+'\n');
  }
  addRouteAliases(files,data,template,{release});
  files.set('llms.txt',llmsIndex(data,{release}));
  files.set('llms-full.txt',`# ${data.artist.name} — public trilingual portfolio\n\n`+(!release?(data.site.previewPublic?'Public preview for editorial review.\n\n':'Review build. Not published.\n\n'):'')+LOCALES.map((locale)=>[null,...publicWorks(data)].map((work)=>pageMarkdown(data,locale,work)).join('\n---\n\n')).join('\n---\n\n'));
  files.set('robots.txt',robotsText(data.site,{release}));
  files.set('sitemap.xml',sitemap(data,{release}));
  for (const locale of LOCALES) files.set(localePath(locale)+'404.html',renderPage(data,template,locale,{release,notFound:true}));
  files.set('.nojekyll','');
  return files;
}
async function assertOwnedOutput(output) {
  let entries;
  try {entries=await readdir(output);} catch (error) {if (error.code==='ENOENT') return;throw error;}
  if ((await lstat(output)).isSymbolicLink()) throw new Error('Output cannot be a symlink.');
  let owned;
  try {owned=JSON.parse(await readFile(path.join(output,'.build-manifest.json'),'utf8'));}
  catch {owned=['index.html','.nojekyll','assets/css/tokens.css','assets/css/scaffold.css'];}
  const walk=async (dir)=>{
    for (const entry of await readdir(dir,{withFileTypes:true})) {
      if (entry.isSymbolicLink()) throw new Error('Symlink in generated output.');
      const filename=path.join(dir,entry.name), relative=path.relative(output,filename).split(path.sep).join('/');
      if (entry.isDirectory()) await walk(filename);
      else if (relative!=='.build-manifest.json' && !owned.includes(relative)) throw new Error(`Refusing to replace unowned output: ${relative}`);
    }
  };
  if (entries.length) await walk(output);
}
export async function buildSite(root,{output=path.join(root,'dist'),data=null,release=false}={}) {
  data ??= await loadContent(root);
  const errors=await verifyFiles(root,data);
  if (errors.length) throw new Error(errors.join('\n'));
  const template=await readFile(path.join(root,'site/index.template.html'),'utf8');
  const files=generatePages(data,template,{release});
  for (const rel of ['assets/css/tokens.css','assets/css/scaffold.css','assets/css/gallery.css','assets/js/gallery.js','assets/css/navigation.css','assets/js/navigation.js','assets/js/locale-navigation.js','assets/css/brand.css','assets/js/brand-carousel.js']) files.set(rel,await readFile(path.join(root,'site',rel)));
  const images=[data.artist.portrait,...allVideos(data.artist).map(v=>v.poster),...data.artist.studioImages,...publicWorks(data).flatMap((w)=>w.images)].filter(Boolean);
  for (const rel of new Set([...imagePaths(images),data.artist.pdf,data.artist.pdfPt,data.artist.pdfFr].filter(Boolean))) files.set(rel,await readFile(containedPath(path.join(root,'site'),rel)));
  await assertOwnedOutput(output);
  const stage=output+`.stage-${process.pid}`;
  let stageCreated=false;
  try {
    await mkdir(stage);
    stageCreated=true; // refuses to overwrite an existing stage
    for (const [relative,content] of files) {
      const filename=containedPath(stage,relative);
      await mkdir(path.dirname(filename),{recursive:true});
      await writeFile(filename,content);
    }
    await writeFile(path.join(stage,'.build-manifest.json'),JSON.stringify([...files.keys()])+ '\n');
    await rm(output,{recursive:true,force:true}); // only files verified above as generated
    await rename(stage,output);
  } catch (error) {if (stageCreated) await rm(stage,{recursive:true,force:true});throw error;}
  if (data.site.basePath!=='/') console.log('DEPLOY_NOTICE: robots.txt must be installed/verified at the origin root; a subpath copy is not effective.');
  return {files:files.size,works:publicWorks(data).length,locales:LOCALES,release};
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const root=fileURLToPath(new URL('../',import.meta.url));
    const result=await buildSite(root,{release:process.argv.includes('--release')});
    console.log('BUILD_OK | '+JSON.stringify(result)+' | deploy=false');
  } catch (error) {console.error(`BUILD_FAIL: ${error.message}`);process.exitCode=1;}
}

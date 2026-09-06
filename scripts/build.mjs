import {readFile, mkdir, writeFile, copyFile, readdir, lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {escapeHtml} from './content.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root,'dist');
try {
  const artist = JSON.parse(await readFile(path.join(root,'site/content/artist.json'),'utf8'));
  const site = JSON.parse(await readFile(path.join(root,'site/content/site.json'),'utf8'));
  if (site.phase !== 'planning') throw new Error('Build da fase 0. Implementar renderer definitivo antes de mudar de fase.');
  // Rebuild determinístico: não apaga nem sobrescreve assets arbitrários em dist/.
  await mkdir(output,{recursive:true});
  if ((await lstat(output)).isSymbolicLink()) throw new Error('dist não pode ser symlink.');
  const existing = await readdir(output);
  if (existing.some((item) => !['index.html','.nojekyll','assets'].includes(item))) throw new Error('dist contém arquivos inesperados.');
  const template = await readFile(path.join(root,'site/index.template.html'),'utf8');
  const paragraphs = artist.bio['pt-BR'].split(/(?=Entre seus trabalhos,)|(?=Sua trajetória também inclui)/).map((p) => `<p>${escapeHtml(p.trim())}</p>`).join('\n');
  const replacements = {NAME:escapeHtml(artist.name),ROLE:escapeHtml(artist.role),INTRO:escapeHtml(artist.intro),LOCATION:escapeHtml(artist.location),EMAIL:escapeHtml(artist.email),BIO:paragraphs};
  const html = template.replace(/\{\{([A-Z]+)\}\}/g, (_, key) => {if (!(key in replacements)) throw new Error('Placeholder desconhecido.'); return replacements[key];});
  await mkdir(path.join(output,'assets/css'),{recursive:true});
  for (const css of ['tokens.css','scaffold.css']) await copyFile(path.join(root,'site/assets/css',css),path.join(output,'assets/css',css));
  await writeFile(path.join(output,'index.html'),html);
  await writeFile(path.join(output,'.nojekyll'),'');
  console.log('BUILD_OK | dist/index.html | scaffold=true | imagens=0 | deploy=false');
} catch (error) { console.error(`BUILD_ERROR: ${error.message}`); process.exitCode=1; }

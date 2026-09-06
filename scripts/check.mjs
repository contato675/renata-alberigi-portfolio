import {readFile, readdir, lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {validateWorks, containedPath} from './content.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const load = async (name) => JSON.parse(await readFile(path.join(root, 'site/content', name), 'utf8'));
try {
  const [artist, site, works] = await Promise.all(['artist.json','site.json','works.json'].map(load));
  const errors = validateWorks(works);
  if (artist.name !== 'Renata Alberigi' || !artist.bio?.['pt-BR'] || !artist.intro) errors.push('Identidade/release ausente.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(artist.email ?? '')) errors.push('E-mail inválido.');
  if (!['planning','implementation','ready'].includes(site.phase)) errors.push('Fase inválida.');
  if (typeof site.publicationApproved !== 'boolean' || typeof site.implementationComplete !== 'boolean') errors.push('Flags de publicação inválidas.');
  for (const work of Array.isArray(works) ? works : []) for (const image of Array.isArray(work?.images) ? work.images : []) {
    if (typeof image?.path !== 'string') continue;
    try { const info = await lstat(containedPath(path.join(root,'site'),image.path)); if (!info.isFile() || info.isSymbolicLink()) throw new Error(); }
    catch { errors.push('Imagem referenciada não existe ou não é arquivo regular.'); }
  }
  const scan = async (dir) => {
    for (const item of await readdir(dir,{withFileTypes:true})) {
      const target = path.join(dir,item.name);
      if (item.isSymbolicLink()) { errors.push('Symlink não permitido na publicação.'); continue; }
      if (item.isDirectory()) { await scan(target); continue; }
      if (/\.(psd|psb|tiff?|raw|dng|cr2|nef|arw|mov|mp4|wav|pem|key)$/i.test(item.name) || /^\.env/.test(item.name)) errors.push('Arquivo não publicável em site/.');
      const size = (await lstat(target)).size;
      if (size > 25 * 1024 * 1024) errors.push('Arquivo excede orçamento editorial de 25MiB.');
      if (size < 256) { const content = await readFile(target,'utf8'); if (content.startsWith('version https://git-lfs.github.com/spec/v1')) errors.push('Ponteiro Git LFS não permitido.'); }
    }
  };
  await scan(path.join(root,'site'));
  if (process.argv.includes('--publish')) {
    if (site.phase !== 'ready' || !site.implementationComplete || !site.publicationApproved) errors.push('Publicação não aprovada/concluída.');
    if (!works.some((work) => work.status === 'published')) errors.push('Sem obras aprovadas.');
    if (!artist.portrait || !artist.featuredVideo || !artist.pdf) errors.push('Retrato, vídeo ou PDF final pendente.');
    const template = await readFile(path.join(root,'site/index.template.html'),'utf8');
    if (template.includes('data-stage="planning"')) errors.push('Template ainda é scaffold, não portfólio final.');
  }
  if (errors.length) { errors.forEach((error) => console.error(`FAIL: ${error}`)); process.exitCode = 1; }
  else console.log(`CHECK_OK | phase=${site.phase} | works=${works.length} | publicacao=${site.publicationApproved}`);
} catch (error) { console.error(`CHECK_ERROR: ${error.message}`); process.exitCode = 1; }

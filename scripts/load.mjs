import {readFile, readdir, lstat, realpath} from 'node:fs/promises';
import path from 'node:path';
import {validateContent, containedPath, allVideos, imagePaths} from './content.mjs';
import {LOCALES} from './i18n.mjs';
export async function loadContent(root) {
  const load = async (name) => JSON.parse(await readFile(path.join(root, 'site/content', name), 'utf8'));
  const [artist, site, works, curriculum] = await Promise.all(['artist.json','site.json','works.json','curriculum.json'].map(load));
  const dictionaries = Object.fromEntries(await Promise.all(LOCALES.map(async (locale) => [locale, await load(`locales/${locale}.json`)])));
  if (!curriculum) throw new Error('Public curriculum content is required in the source tree.');
  const data = {artist,site,works,dictionaries,curriculum};
  const errors = validateContent(data);
  if (errors.length) throw new Error(errors.join('\n'));
  return data;
}
export async function verifyFiles(root, data) {
  const base = path.join(root, 'site');
  const errors = [];
  const scan = async (dir) => {
    for (const entry of await readdir(dir, {withFileTypes:true})) {
      const filename = path.join(dir,entry.name);
      if (entry.isSymbolicLink()) {errors.push('Symlinks are not permitted in site/.');continue;}
      if (entry.isDirectory()) {await scan(filename);continue;}
      if (/\.(psd|psb|tiff?|raw|dng|cr2|nef|arw|mov|mp4|wav|pem|key)$/i.test(entry.name) || /^\.env/.test(entry.name)) errors.push('Non-public file in site/.');
      const info = await lstat(filename);
      if (info.size > 25 * 1024 * 1024) errors.push('File exceeds 25 MiB editorial budget.');
      if (info.size < 256 && (await readFile(filename,'utf8')).startsWith('version https://git-lfs.github.com/spec/v1')) errors.push('Git LFS pointers cannot be published.');
    }
  };
  await scan(base);
  const {artist,works} = data;
  const images = [artist.portrait, ...allVideos(artist).map(v=>v.poster), ...artist.studioImages, ...works.flatMap((w) => w.images)].filter(Boolean);
  const paths = [...imagePaths(images), artist.pdf, artist.pdfPt, artist.pdfFr, artist.pdfEs].filter(Boolean);
  const baseReal = await realpath(base);
  for (const relative of paths) {
    try {
      const filename = containedPath(base,relative), info = await lstat(filename);
      if (!info.isFile() || info.isSymbolicLink() || !(await realpath(filename)).startsWith(baseReal + path.sep)) throw new Error();
    } catch {errors.push(`Referenced media missing or unsafe: ${relative}`);}
  }
  return errors;
}

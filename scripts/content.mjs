import path from 'node:path';
import {hostingErrors} from './hosting.mjs';
import {validateLocalized, validateTranslations, LOCALES} from './i18n.mjs';
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}
export function safeAssetPath(value) {
  return typeof value === 'string' && /^assets\/images\/[a-z0-9][a-z0-9/_.-]*\.(webp|jpe?g|png|avif)$/.test(value)
    && !value.split('/').includes('..') && !value.includes('//');
}
export function containedPath(root, relative) {
  if (typeof relative !== 'string' || relative.includes('\\') || path.isAbsolute(relative)) throw new Error('Unsafe relative path.');
  const full = path.resolve(root, relative);
  if (!full.startsWith(path.resolve(root) + path.sep)) throw new Error('Path outside allowed directory.');
  return full;
}
export function validateImage(image, label = 'Image') {
  if (!image || typeof image !== 'object' || Array.isArray(image)) return [`${label}: invalid image.`];
  const errors = [];
  if (Object.keys(image).some((key) => !['path','alt','width','height','caption','variants'].includes(key))) errors.push(`${label}: unknown image field.`);
  if (!safeAssetPath(image.path)) errors.push(`${label}: invalid image path.`);
  errors.push(...validateLocalized(image.alt, `${label}.alt`));
  if (!Number.isSafeInteger(image.width) || image.width <= 0 || !Number.isSafeInteger(image.height) || image.height <= 0) errors.push(`${label}: invalid image dimensions.`);
  errors.push(...validateLocalized(image.caption, `${label}.caption`, true));
  if(image.variants !== undefined){
    if(!Array.isArray(image.variants)) errors.push(`${label}: invalid image variants.`);
    else for(const v of image.variants){
      if(!v||Object.keys(v).some(k=>!['path','width','height'].includes(k))||!safeAssetPath(v.path)||!Number.isInteger(v.width)||!Number.isInteger(v.height)||v.width<=0||v.height<=0||v.width>=image.width||Math.abs(v.width/v.height-image.width/image.height)>.01) errors.push(`${label}: invalid variant.`);
    }
  }
  return errors;
}
export function validateWorks(works) {
  if (!Array.isArray(works)) return ['works must be an array.'];
  const errors = [], ids = new Set();
  for (const [index, work] of works.entries()) {
    const label = `Work ${index + 1}`;
    if (!work || typeof work !== 'object' || Array.isArray(work)) { errors.push(`${label}: invalid record.`); continue; }
    const keys = ['id','title','originalTitle','year','technique','dimensions','status','cover','images','description','category','collection','titleStatus','yearIsCollectionPeriod'];
    if (Object.keys(work).some((key) => !keys.includes(key))) errors.push(`${label}: unknown field.`);
    for (const key of ['id','year']) if (typeof work[key] !== 'string' || !work[key].trim()) errors.push(`${label}: ${key} required.`);
    if(work.dimensions!==null && (typeof work.dimensions!=='string'||!work.dimensions.trim()))errors.push(`${label}: invalid dimensions.`);
    if(work.collection!==undefined&&!['paintings','digital','brand-design'].includes(work.collection))errors.push(`${label}: invalid collection.`);
    if(work.titleStatus!==undefined&&work.titleStatus!=='catalogue-label')errors.push(`${label}: invalid title status.`);
    if(work.yearIsCollectionPeriod!==undefined&&typeof work.yearIsCollectionPeriod!=='boolean')errors.push(`${label}: invalid date precision.`);
    for (const key of ['title','technique']) errors.push(...validateLocalized(work[key], `${label}.${key}`));
    for (const key of ['description','category']) errors.push(...validateLocalized(work[key], `${label}.${key}`, true));
    if ('originalTitle' in work && (typeof work.originalTitle !== 'string' || !work.originalTitle.trim())) errors.push(`${label}: invalid original title.`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(work.id ?? '')) errors.push(`${label}: invalid id.`);
    if (ids.has(work.id)) errors.push(`${label}: duplicate id.`);
    ids.add(work.id);
    if (!['draft','published'].includes(work.status)) errors.push(`${label}: invalid status.`);
    if (!Array.isArray(work.images) || work.images.length === 0) { errors.push(`${label}: images required.`); continue; }
    if (!Number.isInteger(work.cover) || work.cover < 0 || work.cover >= work.images.length) errors.push(`${label}: cover outside image list.`);
    work.images.forEach((image) => errors.push(...validateImage(image, label)));
  }
  return errors;
}
export function validateContent({artist, site, works, dictionaries}) {
  const errors = [...validateWorks(works), ...validateTranslations(dictionaries), ...hostingErrors(site)];
  if (artist.name !== 'Renata Alberigi') errors.push('Unexpected artist identity.');
  for (const key of ['role','intro','bio','location']) errors.push(...validateLocalized(artist[key], `artist.${key}`));
  if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(artist.email ?? '')) errors.push('Invalid public email.');
  if (typeof artist.instagram !== 'string' || !/^https:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9._]+\/?$/.test(artist.instagram)) errors.push('Invalid public Instagram profile.');
  if (!['planning','implementation','ready'].includes(site.phase)) errors.push('Invalid phase.');
  for (const key of ['publicationApproved','implementationComplete','robotsRootVerified']) if (typeof site[key] !== 'boolean') errors.push(`Invalid flag: ${key}.`);
  if (site.defaultLocale !== 'en' || JSON.stringify(site.locales) !== JSON.stringify(LOCALES)) errors.push('English-first locale contract violated.');
  try {
    const origin = new URL(site.origin);
    if (origin.protocol !== 'https:' || origin.origin !== site.origin || origin.username || origin.password) throw new Error();
  } catch { errors.push('Invalid HTTPS canonical origin.'); }
  if (typeof site.basePath !== 'string' || !/^\/(?:[a-z0-9-]+\/)*$/.test(site.basePath)) errors.push('Invalid Pages base path.');
  if (artist.portrait) errors.push(...validateImage(artist.portrait, 'Portrait'));
  if (!Array.isArray(artist.studioImages)) errors.push('studioImages must be an array.');
  else artist.studioImages.forEach((im) => errors.push(...validateImage(im, 'Studio')));
  if (artist.pdf !== null && !(typeof artist.pdf === 'string' && /^downloads\/[a-z0-9-]+\.pdf$/.test(artist.pdf))) errors.push('Invalid PDF path.');
  if(artist.additionalVideos!==undefined&&!Array.isArray(artist.additionalVideos))errors.push('Invalid additional videos.');
  for (const [label, value] of [['Portuguese',artist.pdfPt],['French',artist.pdfFr]]) if(value && !/^downloads\/[a-z0-9-]+\.pdf$/.test(value))errors.push(`Invalid ${label} PDF path.`);
  for (const video of allVideos(artist)) {
    if (!['youtube','vimeo'].includes(video.provider) || !/^[a-zA-Z0-9_-]+$/.test(video.id ?? '') || (video.provider === 'vimeo' && !/^\d+$/.test(video.id))) errors.push('Invalid video provider/id.');
    errors.push(...validateLocalized(video.title, 'Video title'), ...validateLocalized(video.transcript??undefined, 'Video transcript',true), ...validateLocalized(video.description,'Video description',true), ...validateImage(video.poster, 'Video poster'));
  }
  for (const locale of LOCALES) if (typeof artist.editorialReview?.[locale] !== 'boolean') errors.push(`Missing editorial review status: ${locale}.`);
  return errors;
}
export function publicationErrors({artist,site,works}) {
  const errors = [];
  if (site.phase !== 'ready' || !site.implementationComplete || !site.publicationApproved) errors.push('Publication not approved/completed.');
  if (!Array.isArray(works) || !works.some((w) => w?.status === 'published')) errors.push('No approved artworks.');
  if (!artist.portrait || !artist.featuredVideo || !artist.pdf) errors.push('Final portrait, film or PDF pending.');
  if (!LOCALES.every((locale) => artist.editorialReview?.[locale])) errors.push('Editorial review pending for supported languages.');
  if (!site.robotsRootVerified) errors.push('robots.txt at the origin root has not been verified.');
  return errors;
}

export const allVideos = artist => [artist.featuredVideo,...(Array.isArray(artist.additionalVideos)?artist.additionalVideos:[])].filter(Boolean);
export const imagePaths = images => images.flatMap(im=>[im.path,...(im.variants||[]).map(v=>v.path)]);
export const pdfPath = (artist,locale) => {
  if (!LOCALES.includes(locale)) throw new Error('Unsupported locale');
  return ({'pt-BR':artist.pdfPt,fr:artist.pdfFr}[locale]) || artist.pdf;
};

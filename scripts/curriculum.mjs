import {LOCALES,localePath,validateLocalized,localized as l} from './i18n.mjs';
const routes = Object.freeze({en:'cv/','pt-BR':'curriculo/',fr:'cv/'});
export const cvPath = locale => localePath(locale) + routes[locale];
export const CV_SECTIONS = Object.freeze(['art-direction','cultural-actions','exhibitions','paintings','analogiaeu']);
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
const slug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const plain = value => typeof value === 'string' && !!value.trim();
/** An explicit public record; no profile, schooling, contact or residence fields. */
export function validateCurriculum(value) {
  if (value === undefined || value === null) return []; // isolated historical test fixtures
  if (!object(value)) return ['Curriculum: object required.'];
  const errors=[];
  if (Object.keys(value).some(k=>k!=='sections')) errors.push('Curriculum: unknown public field.');
  if (!Array.isArray(value.sections)) return [...errors,'Curriculum: sections required.'];
  if (JSON.stringify(value.sections.map(s=>s?.id))!==JSON.stringify(CV_SECTIONS)) errors.push('Curriculum: unexpected sections or order.');
  for (const section of value.sections) {
    if (!object(section)) { errors.push('Curriculum: invalid section.');continue; }
    const label='Curriculum.'+section.id;
    if (Object.keys(section).some(k=>!['id','title','entries'].includes(k))) errors.push(label+': unknown field.');
    errors.push(...validateLocalized(section.title,label+'.title'));
    if (!Array.isArray(section.entries)||!section.entries.length) { errors.push(label+': entries required.');continue; }
    const ids=new Set();
    for (const entry of section.entries) {
      if (!object(entry)) { errors.push(label+': invalid entry.');continue; }
      const at=label+'.'+entry.id;
      if (Object.keys(entry).some(k=>!['id','date','dateLabel','title','description','workId','technique','dimensions'].includes(k))) errors.push(at+': unknown field.');
      if (!slug(entry.id)||ids.has(entry.id)) errors.push(at+': invalid or duplicate id.');
      ids.add(entry.id);
      if (typeof entry.date!=='string'||!/^\d{4}(?:[–-]\d{4}|-\d{2}-\d{2})?$/.test(entry.date)) errors.push(at+': invalid date.');
      if (/^\d{4}-\d{2}-\d{2}$/.test(entry.date??'') && (!entry.dateLabel||!Number.isFinite(Date.parse(entry.date)))) errors.push(at+': full date requires localized label.');
      errors.push(...validateLocalized(entry.title,at+'.title'));
      for (const key of ['description','dateLabel','technique']) errors.push(...validateLocalized(entry[key],at+'.'+key,true));
      if (entry.workId!==undefined&&!slug(entry.workId)) errors.push(at+': unsafe work link.');
      if (entry.dimensions!==undefined&&!plain(entry.dimensions)) errors.push(at+': invalid dimensions.');
      if (section.id==='paintings'&&!entry.technique) errors.push(at+': painting technique required.');
    }
  }
  return errors;
}
/** Emit only an allowlisted, locale-specific view, even if a caller supplies other fields. */
export function curriculumRecords(data,locale) {
  return data.curriculum.sections.map(section=>({id:section.id,title:l(section.title,locale),entries:section.entries.map(entry=>({
    id:entry.id,date:entry.date,dateLabel:entry.dateLabel?l(entry.dateLabel,locale):entry.date,title:l(entry.title,locale),
    ...(entry.description?{description:l(entry.description,locale)}:{}),
    ...(entry.technique?{technique:l(entry.technique,locale)}:{}),...(entry.dimensions?{dimensions:entry.dimensions}:{}),
    ...(entry.workId&&data.works.some(w=>w.id===entry.workId&&w.status==='published')?{workPath:localePath(locale)+'works/'+entry.workId+'/'}:{})
  }))}));
}

import path from 'node:path';
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}
export function safeAssetPath(value) {
  return typeof value === 'string' && /^assets\/images\/[a-z0-9][a-z0-9/_.-]*\.(webp|jpe?g|png|avif)$/.test(value)
    && !value.split('/').includes('..') && !value.includes('//');
}
export function containedPath(root, relative) {
  const full = path.resolve(root, relative);
  if (!full.startsWith(path.resolve(root) + path.sep)) throw new Error('Path fora da pasta permitida.');
  return full;
}
export function validateWorks(works) {
  if (!Array.isArray(works)) return ['works deve ser uma lista.'];
  const errors = [], ids = new Set();
  for (const [index, work] of works.entries()) {
    const label = `Obra ${index + 1}`;
    if (!work || typeof work !== 'object' || Array.isArray(work)) { errors.push(`${label}: registro inválido.`); continue; }
    const keys = ['id','title','year','technique','dimensions','status','cover','images','description','category'];
    if (Object.keys(work).some((key) => !keys.includes(key))) errors.push(`${label}: campo desconhecido.`);
    for (const key of ['id','title','year','technique','dimensions']) {
      if (typeof work[key] !== 'string' || !work[key].trim()) errors.push(`${label}: ${key} obrigatório.`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(work.id ?? '')) errors.push(`${label}: id inválido.`);
    if (ids.has(work.id)) errors.push(`${label}: id repetido.`);
    ids.add(work.id);
    if (!['draft','published'].includes(work.status)) errors.push(`${label}: status inválido.`);
    for (const key of ['description','category']) if (key in work && typeof work[key] !== 'string') errors.push(`${label}: ${key} deve ser texto.`);
    if (!Array.isArray(work.images) || work.images.length === 0) { errors.push(`${label}: imagens obrigatórias.`); continue; }
    if (!Number.isInteger(work.cover) || work.cover < 0 || work.cover >= work.images.length) errors.push(`${label}: capa fora da lista.`);
    for (const image of work.images) {
      if (!image || typeof image !== 'object' || Array.isArray(image)) { errors.push(`${label}: imagem inválida.`); continue; }
      if (Object.keys(image).some((key) => !['path','alt','width','height','caption'].includes(key))) errors.push(`${label}: campo de imagem desconhecido.`);
      if (!safeAssetPath(image.path)) errors.push(`${label}: path de imagem inválido.`);
      if (typeof image.alt !== 'string' || !image.alt.trim()) errors.push(`${label}: alt obrigatório.`);
      if (!Number.isInteger(image.width) || image.width <= 0 || !Number.isInteger(image.height) || image.height <= 0) errors.push(`${label}: dimensões de imagem inválidas.`);
      if ('caption' in image && typeof image.caption !== 'string') errors.push(`${label}: legenda inválida.`);
    }
  }
  return errors;
}

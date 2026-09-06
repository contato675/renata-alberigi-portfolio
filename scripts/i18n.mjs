export const LOCALES = Object.freeze(['en', 'pt-BR']);
export function localized(value, locale) {
  if (!LOCALES.includes(locale) || typeof value?.[locale] !== 'string') {
    throw new Error(`Missing translation: ${locale}`);
  }
  return value[locale];
}
export const localePath = (locale) => {
  if (!LOCALES.includes(locale)) throw new Error('Unsupported locale');
  return locale === 'en' ? '' : 'pt-br/';
};
export function validateTranslations(dictionaries) {
  const errors = [];
  const keys = Object.keys(dictionaries.en ?? {}).sort();
  if (!keys.length) errors.push('English UI dictionary is empty.');
  for (const locale of LOCALES) {
    const values = dictionaries[locale];
    if (!values || JSON.stringify(Object.keys(values).sort()) !== JSON.stringify(keys)) {
      errors.push(`UI key parity failed: ${locale}`);
      continue;
    }
    for (const [key, value] of Object.entries(values)) {
      if (typeof value !== 'string' || !value.trim()) errors.push(`Empty UI translation: ${locale}.${key}`);
    }
  }
  return errors;
}
export function validateLocalized(value, label, optional = false) {
  if (optional && value === undefined) return [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${label}: localized text required.`];
  const errors = Object.keys(value).some((key) => !LOCALES.includes(key)) ? [`${label}: unknown locale.`] : [];
  for (const locale of LOCALES) if (typeof value[locale] !== 'string' || !value[locale].trim()) errors.push(`${label}: missing ${locale}.`);
  return errors;
}

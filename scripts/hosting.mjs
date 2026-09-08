// Custom-domain configuration is explicit and must match canonical URLs.
export function hostingErrors(site) {
  if (site.customDomain === undefined || site.customDomain === null) return [];
  const domain = site.customDomain;
  const errors = [];
  if (typeof domain !== 'string' || domain.length > 253 || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
    errors.push('Invalid custom domain: use a lowercase hostname without protocol, path or wildcard.');
    return errors;
  }
  if (site.origin !== `https://${domain}`) errors.push('Custom domain must match the HTTPS canonical origin.');
  if (site.basePath !== '/') errors.push('Custom-domain hosting requires basePath /.');
  return errors;
}
export function customDomainFiles(site) {
  const errors = hostingErrors(site);
  if (errors.length) throw new Error(errors.join('\n'));
  return site.customDomain ? new Map([['CNAME', `${site.customDomain}\n`]]) : new Map();
}

import {fileURLToPath} from 'node:url';
import {loadContent,verifyFiles} from './load.mjs';
import {publicationErrors} from './content.mjs';
const root = fileURLToPath(new URL('../',import.meta.url));
try {
  const data = await loadContent(root);
  const errors = await verifyFiles(root,data);
  if (process.argv.includes('--publish')) errors.push(...publicationErrors(data));
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`CHECK_OK | locales=en,pt-BR | works=${data.works.length} | publication=${data.site.publicationApproved}`);
} catch (error) {console.error(`CHECK_FAIL: ${error.message}`);process.exitCode=1;}

const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');

const content = `// This file is auto-generated. Do not edit manually.
export const APP_VERSION = '${packageJson.version}';
`;

const targetPath = path.join(__dirname, '../src/environment/version.ts');

fs.writeFileSync(targetPath, content, 'utf8');

console.log(`Version file generated: ${packageJson.version}`);
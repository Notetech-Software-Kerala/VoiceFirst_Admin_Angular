const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const targetPath = path.join(__dirname, '../src/environments/version.ts');

const content = `// Auto-generated file. Do not edit manually.
export const APP_VERSION = '${packageJson.version}';
export const BUILD_TIME = '${new Date().toISOString()}';
`;

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, content, 'utf8');

console.log(`Version file generated: ${targetPath}`);
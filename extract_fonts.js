const fs = require('fs');
const path = require('path');

function findCssFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findCssFiles(filePath, fileList);
    } else if (file.endsWith('.css') || file.endsWith('.scss')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const cssFiles = findCssFiles(path.join(__dirname, 'src'));
const fontSizes = {};

cssFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /font-size:\s*([^;}!]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const size = match[1].trim().replace(/\s+!important/, '');
    if (!fontSizes[size]) fontSizes[size] = { count: 0, files: new Set() };
    fontSizes[size].count++;
    fontSizes[size].files.add(file.replace(__dirname, ''));
  }
});

const sorted = Object.entries(fontSizes).sort((a,b) => b[1].count - a[1].count);
sorted.forEach(([size, data]) => {
  console.log(`${size}: ${data.count} occurrences`);
  if (data.count < 15) {
     console.log(`  Found in: ${Array.from(data.files).join(', ')}`);
  }
});

const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Odstranit placeholder="..." a případné další prázdné mezery, které mohly vzniknout
  const result = content.replace(/ \placeholder="[^"]*"/g, '').replace(/ placeholder="[^"]*"/g, '');
  if (content !== result) {
    fs.writeFileSync(filePath, result);
    console.log('Processed', filePath);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

traverse('src');

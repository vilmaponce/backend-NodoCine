const fs = require('fs');
const path = require('path');

function printTree(dir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return '';
  let output = '';
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules') continue;
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    output += '  '.repeat(depth) + file + '\n';
    if (stats.isDirectory()) {
      output += printTree(filePath, depth + 1, maxDepth);
    }
  }
  return output;
}

const output = printTree(__dirname);
fs.writeFileSync('estructura.txt', output);

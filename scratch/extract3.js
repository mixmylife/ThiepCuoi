const fs = require('fs');
const html = fs.readFileSync('d:/DamCuoi/demo_sl.html', 'utf8');
const urls = html.match(/https?:\/\/[^\s\"\'\>\)]+/gi) || [];
const relativeUrls = html.match(/(?<=\")\/[^\s\"\'\>\)]+/gi) || [];
const allUrls = [...new Set([...urls, ...relativeUrls])];
console.log('All URLs:', allUrls.filter(u => u.includes('image') || u.includes('bg') || u.includes('pattern')));

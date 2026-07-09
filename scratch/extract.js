const fs = require('fs');
const html = fs.readFileSync('d:\\DamCuoi\\demo_sl.html', 'utf8');

const fonts = html.match(/font-family:[^;\"\}]+/gi) || [];
console.log('Fonts found:', [...new Set(fonts)]);

const bgs = html.match(/background(?:-image)?:(?:url\([^\)]+\)|[^;\"\}]+)/gi) || [];
console.log('Backgrounds found:', [...new Set(bgs)].filter(x => x.includes('url')));

const bgcolors = html.match(/background-color:[^;\"\}]+/gi) || [];
console.log('Background Colors:', [...new Set(bgcolors)]);

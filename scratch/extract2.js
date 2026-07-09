const fs = require('fs');
const html = fs.readFileSync('d:\\DamCuoi\\demo_sl.html', 'utf8');
const matches = html.match(/\/images\/themes\/songlong-red\/[^\"]+/gi) || [];
console.log('Images:', [...new Set(matches)]);

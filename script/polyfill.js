var fs = require('fs');
var resolve = require('resolve');

var outPath = 'build/shopify-buy-ui.globals.polyfilled.js';
var polyfills = fs.readFileSync(resolve.sync('shopify-buy/dist/polyfills.js'));
var lib = fs.readFileSync('build/shopify-buy-ui.globals.js');

fs.writeFileSync(outPath, polyfills + '\n' + lib);

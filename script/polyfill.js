var fs = require('fs');
var resolve = require('resolve');

var outPath = 'build/shopify-buy-ui.globals.polyfilled.js';
var polyfills = fs.readFileSync(resolve.sync('shopify-buy/dist/polyfills.js'));
var lib = fs.readFileSync('build/shopify-buy-ui.globals.js');

var libPolyfills = fs.readdirSync('src/polyfills').reduce(function (acc, file) {
  return acc + fs.readFileSync('src/polyfills/' + file);
}, '');

fs.writeFileSync(outPath, libPolyfills + polyfills + lib);

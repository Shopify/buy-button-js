var fs = require('fs');
var resolve = require('resolve');
var globalsFile = process.argv[2];

var outPath = `build/${globalsFile}.globals.polyfilled.js`;
var polyfills = fs.readFileSync(resolve.sync('shopify-buy/dist/polyfills.js'));
var lib = fs.readFileSync(`build/${globalsFile}.globals.js`);

fs.writeFileSync(outPath, polyfills + '\n' + lib);

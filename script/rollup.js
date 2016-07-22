/* global require, module, __dirname */

/* Depends on
    "rollup": "0.32.0",
    "rollup-plugin-commonjs": "3.0.0",
    "rollup-plugin-node-resolve": "1.7.0",
    "rollup-plugin-strip": "1.1.1",
*/

const rollup = require('rollup').rollup;
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const nodeResolver = nodeResolve({
  jsnext: true,  // Default: false
  main: true,  // Default: true
  skip: [],  // Default: []
  browser: true,  // Default: false
  extensions: ['.js'],
  preferBuiltins: true
});

rollup({
  entry: 'build/shopify-buy-ui.js',
  plugins: [
    nodeResolver,
    commonjs()
  ]
}).then(bundle => {
  bundle.write({
    format: 'iife',
    moduleName: 'ShopifyBuyUI',
    dest: 'build/shopify-buy-ui.globals.js'
  });
});

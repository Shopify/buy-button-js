process.env.BABEL_ENV = 'production';
require('./util/work-from-root')();

const fs = require('fs');
const rollup = require('rollup').rollup;
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const UglifyJS = require('uglify-js');

const srcPath = 'src/shopify-buy-ui.js';
const buildPaths = {
  globals: 'dist/shopify-buy-ui.js',
  min: 'dist/shopify-buy-ui.min.js',
  umd: 'lib/shopify-buy-ui.umd.js',
  es: 'lib/shopify-buy-ui.es.js',
}

rollup({
  entry: srcPath,
  plugins: [
    babel({
      exclude: ['node_modules/hogan.js/**', 'node_modules/morphdom/**'],
    }),
    nodeResolve({
      extensions: ['.js'],
      preferBuiltins: true
    }),
    commonjs()
  ],
}).then(function (bundle) {
  return Promise.all([
    bundle.write({
      dest: buildPaths.globals,
      format: 'iife',
      moduleName: 'ShopifyBuy',
    }),
    bundle.write({
      dest: buildPaths.umd,
      format: 'umd',
      moduleName: 'ShopifyBuy',
    }),
    bundle.write({
      dest: buildPaths.es,
      format: 'es',
      moduleName: 'ShopifyBuy',
    }),
  ]);
}).then(function () {
  const bundle = UglifyJS.minify(buildPaths.globals);
  fs.writeFileSync(buildPaths.min, bundle.code);
}).catch(function (err) {
  console.log(err);
  process.exit(1);
});

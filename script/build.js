process.env.BABEL_ENV = 'production';

const fs = require('fs');
const rollup = require('rollup').rollup;
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const UglifyJS = require('uglify-js');

const srcPath = 'lib/buybutton.js';
const buildPaths = {
  globals: 'dist/buybutton.js',
  min: 'dist/buybutton.min.js',
  umd: 'dist/buybutton.umd.js',
}

rollup({
  entry: srcPath,
  plugins: [
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
  ]);
}).then(function () {
  const bundle = UglifyJS.minify(buildPaths.globals);
  fs.writeFileSync(buildPaths.min, bundle.code);
}).catch(function (err) {
  console.log(err);
  process.exit(1);
});

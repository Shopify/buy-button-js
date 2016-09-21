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

process.env.BABEL_ENV = 'production';

rollup({
  entry: srcPath,
  plugins: [
    babel({
      exclude: ['node_modules/hogan.js/**', 'node_modules/morphdom/**'],
      plugins: [
        require("babel-plugin-transform-es2015-template-literals"),
        require("babel-plugin-transform-es2015-literals"),
        require("babel-plugin-transform-es2015-function-name"),
        require("babel-plugin-transform-es2015-arrow-functions"),
        require("babel-plugin-transform-es2015-block-scoped-functions"),
        [require("babel-plugin-transform-es2015-classes"), {loose: true}],
        require("babel-plugin-transform-es2015-object-super"),
        require("babel-plugin-transform-es2015-shorthand-properties"),
        require("babel-plugin-transform-es2015-duplicate-keys"),
        require("babel-plugin-transform-es2015-computed-properties"),
        require("babel-plugin-check-es2015-constants"),
        require("babel-plugin-transform-es2015-spread"),
        require("babel-plugin-transform-es2015-parameters"),
        require("babel-plugin-transform-es2015-destructuring"),
        require("babel-plugin-transform-es2015-block-scoping"),
        require("babel-plugin-transform-es2015-typeof-symbol"),
        require("babel-plugin-transform-object-assign"),
        require("babel-plugin-external-helpers")
      ]
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

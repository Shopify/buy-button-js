process.env.BABEL_ENV = 'production';

const fs = require('fs');
const rollup = require('rollup').rollup;
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const { minify } = require('terser');

const srcPath = 'src/buybutton.js';
const buildPaths = {
  globals: 'dist/buybutton.js',
  min: 'dist/buybutton.min.js',
  umd: 'lib/buybutton.umd.js',
  cjs: 'lib/buybutton.cjs.js',
};

async function build() {
  try {
    const bundle = await rollup({
      input: srcPath,
      plugins: [
        babel({
          exclude: ['node_modules/**'],
          extensions: ['.js', '.ts'],
        }),
        nodeResolve({
          extensions: ['.js', '.ts'],
          mainFields: ['module', 'main'],
        }),
        commonjs(),
      ],
    });

    await Promise.all([
      bundle.write({
        file: buildPaths.globals,
        format: 'iife',
        name: 'ShopifyBuy',
      }),
      bundle.write({
        file: buildPaths.umd,
        format: 'umd',
        name: 'ShopifyBuy',
      }),
      bundle.write({
        file: buildPaths.cjs,
        format: 'cjs',
        name: 'ShopifyBuy',
      }),
    ]);

    const code = fs.readFileSync(buildPaths.globals, 'utf8');
    const minified = await minify(code);
    if (!minified.code) {
      throw new Error('terser minification failed: output code is empty');
    }
    fs.writeFileSync(buildPaths.min, minified.code);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

build();

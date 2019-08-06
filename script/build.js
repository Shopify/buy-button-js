process.env.BABEL_ENV = 'production';

const fs = require('fs');
const rollup = require('rollup').rollup;
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const UglifyJS = require('uglify-js');

const srcPath = 'src/buybutton.js';
const buildPaths = {
  globals: 'dist/buybutton.js',
  min: 'dist/buybutton.min.js',
  umd: 'lib/buybutton.umd.js',
  cjs: 'lib/buybutton.cjs.js',
};

async function build() {
  // create a bundle
  try {
    const bundle = await rollup({
      input: srcPath,
      plugins: [
        babel({
          exclude: ['node_modules/**'],
        }),
        nodeResolve({
          extensions: ['.js'],
          mainFields: ['module', 'main'],
        }),
        commonjs(),
      ],
    });

    // or write the bundle to disk
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

    const code = await fs.readFileSync(buildPaths.globals, 'utf8');
    const uglifyBundle = UglifyJS.minify(code);
    await fs.writeFileSync(buildPaths.min, uglifyBundle.code);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

build();

import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'src/shopify-buy-ui.js',
  plugins: [
    babel({
      exclude: ['node_modules/hogan.js/**'],
    }),
    nodeResolve({
      jsnext: true,
      browser: true,
      extensions: ['.js'],
      preferBuiltins: true
    }),
    commonjs({
      exclude: 'node_modules/shopify-buy/**',
    })
  ],
  format: 'iife',
  moduleName: 'ShopifyBuy',
};

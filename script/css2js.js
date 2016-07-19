var sass = require('node-sass');
var css = require('css');
var fs = require('fs');

function csstojs(str, options) {
  var rules = css.parse(str).stylesheet;
  var obj = {};

  if (!rules.rules) return obj;

  return rules.rules.map(function (rule) {
    return {
      selectors: rule.selectors,
      declarations: rule.declarations.map(function (dec) {
        return {
          property: dec.property,
          value: dec.value
        }
      })
    }
  });
}

var cssString = 'const styles = {};';

cssString += fs.readdirSync('src/styles/embeds/sass/manifests').reduce(function (acc, file) {
  var fileRoot = file.split('.')[0];
  var result = sass.renderSync({file: './src/styles/embeds/sass/manifests/' + file});
  var js = csstojs(result.css.toString());
  return acc + '\n styles.' + fileRoot + ' = ' + JSON.stringify(js) + ';';
}, '');

cssString += '\n export default styles';

fs.writeFileSync('src/styles/embeds/all.js', cssString);

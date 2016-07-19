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

sass.render({
  file: './src/styles/embeds/sass/styles.scss'
}, function (err, css) {
  if (err) {
    console.log(err);
  } else {
    var js = csstojs(css.css.toString());
    fs.writeFileSync('src/styles/embeds/main.js', 'export default ' + JSON.stringify(js));
  }
})

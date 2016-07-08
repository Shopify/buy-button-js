var sass = require('node-sass');
var css = require('css');
var fs = require('fs');

function csstojs(str, options) {
  var rules = css.parse(str).stylesheet;
  var obj = {};

  if (!rules.rules) return obj;

  return rules.rules;
}

sass.render({
  file: './src/styles/sass/styles.scss'
}, function (err, css) {
  if (err) {
    console.log(err);
  } else {
    var js = csstojs(css.css.toString());
    fs.writeFileSync('src/styles/main.js', 'export default ' + JSON.stringify(js));
  }
})

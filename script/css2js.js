var css = require('css');
var fs = require('fs');

function csstojs(str, options) {
  var rules = css.parse(str).stylesheet;
  var obj = {};

  if (!rules.rules) return obj;

  return rules.rules;
}

var input = fs.readFileSync('src/styles/main.css', 'utf-8');
var js = csstojs(input);

fs.writeFileSync('./styles/main.js', 'export default ' + JSON.stringify(js));

var sass = require('node-sass');
var fs = require('fs');

var cssString = 'const styles = {};';

cssString += fs.readdirSync('src/styles/embeds/sass/manifests').reduce(function (acc, file) {
  var fileRoot = file.split('.')[0];
  var result = sass.renderSync({file: './src/styles/embeds/sass/manifests/' + file, outputStyle: 'compressed'});
  return acc + '\n styles.' + fileRoot + ' = \'' + result.css.toString().replace(/(\r\n|\n|\r)/gm," ") + '\'';
}, '');

cssString += '\n export default styles';

fs.writeFileSync('src/styles/embeds/all.js', cssString);

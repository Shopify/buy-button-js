var sass = require('node-sass');
var fs = require('fs');

var embedsCSS = 'const styles = {};';

embedsCSS += fs.readdirSync('src/styles/embeds/sass/manifests').reduce(function (acc, file) {
  var fileRoot = file.split('.')[0];
  var result = sass.renderSync({file: './src/styles/embeds/sass/manifests/' + file, outputStyle: 'compressed'});
  return acc + '\n styles.' + fileRoot + ' = \'' + result.css.toString().replace(/(\r\n|\n|\r)/gm," ") + '\'';
}, '');

embedsCSS += '\n export default styles';

fs.writeFileSync('src/styles/embeds/all.js', embedsCSS);

sass.render({
  file: './src/styles/embeds/sass/conditional.scss'
}, function (err, css) {
  if (err) {
    console.error(err);
  } else {
    var js = css.css.toString();
    fs.writeFileSync('src/styles/embeds/conditional.js', 'export default ' + JSON.stringify(js));
  }
});

sass.render({
  file: './src/styles/manifest.scss'
}, function (err, css) {
  if (err) {
    console.error(err);
  } else {
    fs.writeFileSync('./dist/buybutton.css', css.css);
  }
});

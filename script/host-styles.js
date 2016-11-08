var sass = require('node-sass');
var fs = require('fs');
var postcss = require('postcss');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');

fs.readdirSync('src/styles/host/sass').forEach(function(file) {
  postcss([precss, autoprefixer, cssnano])
    .process(fs.readFileSync('src/styles/host/sass/' + file), {from: 'src/styles/host/sass/' + file})
    .then(function(result) {
      var js = result.css.toString();
      var fileName = 'src/styles/host/' + file.replace('.css', '.js');
      fs.writeFileSync(fileName, 'export default ' + JSON.stringify(js));
    })
    .catch(function(err) {
      console.log(err);
    });
});

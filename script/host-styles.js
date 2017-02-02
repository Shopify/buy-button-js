var fs = require('fs');
var postcss = require('postcss');
var cssnext = require('postcss-cssnext');
var cssimports = require('postcss-import');

fs.readdirSync('src/styles/host/sass').forEach(function(file) {
  postcss([cssimports, cssnext])
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

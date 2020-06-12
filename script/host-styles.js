var fs = require('fs');
var postcss = require('postcss');
var presetenv = require('postcss-preset-env')({
  stage: 1,
  features: {
    'custom-properties': {
      preserve: false,
    },
    'color-mod-function': true,
  },
});
var cssimports = require('postcss-import');
var csscalc = require('postcss-calc');

fs.readdirSync('src/styles/host/sass').forEach(function(file) {
  postcss([cssimports, presetenv, csscalc])
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

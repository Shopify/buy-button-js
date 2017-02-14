var fs = require('fs');
var postcss = require('postcss')
var cssnext = require('postcss-cssnext')
var cssimports = require('postcss-import')

var embedsCSS = 'const styles = {};';

var promises = fs.readdirSync('src/styles/embeds/sass/manifests').map(function(file) {
  var fileRoot = file.split('.')[0];

  return postcss([cssimports, cssnext])
    .process(fs.readFileSync('./src/styles/embeds/sass/manifests/' + file), {from: './src/styles/embeds/sass/manifests/' + file})
    .then(function(result) {
      return {file: fileRoot, css: result.css};
    })
    .catch(function(err) {
      console.log(err);
    });
});

Promise.all(promises).then(function(values) {
  embedsCSS += values.reduce(function(acc, value) {
    return acc + '\n styles.' + value.file + ' = \'' + value.css.replace(/(\r\n|\n|\r)/gm, ' ') + '\'';
  }, '');

  embedsCSS += '\n export default styles';
  fs.writeFileSync('src/styles/embeds/all.js', embedsCSS);
})
.catch(function(err) {
  console.log(err);
});

postcss([cssnext])
  .process(fs.readFileSync('./src/styles/embeds/sass/conditional.css'))
  .then(function(result) {
    fs.writeFileSync('src/styles/embeds/conditional.js', 'export default ' + JSON.stringify(result.css));
  })
  .catch(function(err) {
    console.log(err);
  });

postcss([cssimports, cssnext])
  .process(fs.readFileSync('./src/styles/manifest.css'), {
    from: './src/styles/manifest.css'
  })
  .then(function(result) {
    fs.writeFileSync('./dist/buybutton.css', result.css);
  })
  .catch(function(err) {
    console.log(err);
  });

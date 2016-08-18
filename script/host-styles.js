var sass = require('node-sass');
var fs = require('fs');

fs.readdirSync('src/styles/host/sass').forEach(function (file) {
  sass.render({
    file: './src/styles/host/sass/' + file,
  }, function (err, css) {
    if (err) {
      console.log(err);
    } else {
      var js = css.css.toString();
      var fileName = 'src/styles/host/' + file.replace('.scss', '.js');
      fs.writeFileSync(fileName, 'export default ' + JSON.stringify(js));
    }
  })
});


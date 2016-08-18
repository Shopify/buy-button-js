var sass = require('node-sass');
var fs = require('fs');

sass.render({
  file: './src/legacy/styles/sass/overrides.scss'
}, function (err, css) {
  if (err) {
    console.log(err);
  } else {
    var js = css.css.toString();
    fs.writeFileSync('src/legacy/styles/overrides.js', 'export default ' + JSON.stringify(js));
  }
})

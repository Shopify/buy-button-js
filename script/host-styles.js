var sass = require('node-sass');
var fs = require('fs');

sass.render({
  file: './src/styles/host/sass/styles.scss'
}, function (err, css) {
  if (err) {
    console.log(err);
  } else {
    var js = css.css.toString();
    fs.writeFileSync('src/styles/host/main.js', 'export default ' + JSON.stringify(js));
  }
})

var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');

['unit-tests.js', 'integration-tests.js'].forEach(function (fileName)  {
  var b = browserify({
    entries: ['test/' + fileName],
    cache: {},
    verbose: true,
    packageCache: {},
    plugin: [watchify]
  }).transform('babelify');

  b.on('update', bundle.bind(null, fileName));
  b.on('log', function (msg) {console.log(msg)})

  bundle();

  function bundle() {
    b.bundle().pipe(fs.createWriteStream('tmp/' + fileName));
  }
});


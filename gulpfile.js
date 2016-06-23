var
  browserSync = require('browser-sync'),

  gulp = require('gulp'),
  rename = require('gulp-rename'),
  watch = require('gulp-watch'),
  gutil = require('gulp-util'),
  
  PrettyError = require('pretty-error'),
  plumber = require('gulp-plumber'),
  notify = require('gulp-notify'),

  include = require('gulp-include'),
  uglify = require('gulp-uglify'),

  pathSrc = './src',
  pathDst = './dist',

  _renderer = null,
  _notifier = null,

  _error = function(cb) {
    if (_renderer == null) {
      _notifier = notify.onError("Ошибка в Gulp! Смотри вывод терминала.");
      _renderer = new PrettyError();
      _renderer.skipNodeFiles();
    }
    return function(error) {
      var message = _renderer.render(error);
      _notifier(error);
      gutil.log(message);
      if (cb != null) cb();
    }
  },

  _src = function(glob, cb) {
    return gulp.src(pathSrc + '/' + glob)
      .pipe(plumber({errorHandler: _error(cb)}));
  },

  _dst = function(cb) {
    var result = gulp.dest(pathDst).on('end', cb);
    result.pipe(browserSync.reload({stream: true}));
    return result;
  },

  _watch = function(glob, task) {
    return watch(pathSrc + '/' + glob, function() { gulp.start(task); });
  }
;

process.on("uncaughtException", _error());

gulp.task('build:js', function(cb) {
  _src('./main.js', cb)
    .pipe(include())
    .pipe(gutil.env.compress != null ? uglify() : gutil.noop())
    .pipe(rename('zepto-promise.js'))
    .pipe(_dst(cb));
});

gulp.task('build:html', function(cb) {
  _src('./*.html', cb)
    .pipe(include())
    .pipe(_dst(cb));
});

gulp.task('build:vendor', function(cb) {
  _src('./vendor.js', cb)
    .pipe(include())
    .pipe(_dst(cb));
});

gulp.task('build', ['build:html', 'build:js', 'build:vendor']);

gulp.task('watch', function(cb) {
  _watch('./vendor.js', 'build:vendor');
  _watch('./**/*.html', 'build:html');
  _watch('./**/*.js', 'build:js');
  cb();
});

gulp.task('server', function(cb) {
  browserSync({
    server: {baseDir: pathDst},
    tunnel: false,
    port: 3010
  });
});

gulp.task('serve', ['build', 'watch', 'server']);
gulp.task('default', ['build']);
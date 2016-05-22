// Gulpfile

var gulp = require('gulp');
var watch = require('gulp-watch'); // Watch to have background tasks executing when some event is triggered
var karma = require('gulp-karma');  // Include Karma
var shell = require('gulp-shell');

gulp.task('default', [], function() {
    gulp.start('server');
});

gulp.task('test', function() {
  return gulp.src([])
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      throw err;
    });
});

gulp.task('ast', function () {
  return gulp.src('').pipe(shell([ 'pegjs lib/pl0.pegjs lib/pl0node.js' ]));
});

gulp.task('server', function () {
  return gulp.src('').pipe(shell([ 'node --harmony_destructuring server.js' ]));
});

var gulp = require('gulp')
,   livereload = require('gulp-livereload')
,   mocha = require('gulp-mocha')
,   serve = require('gulp-serve')
,   PORT = 5000

gulp.task('test', function () {
  gulp.src('test/*test.js', {read:false})
    .pipe(mocha())
})

gulp.task('refresh', function () {
  gulp.src('slides.md')
      .pipe(livereload())
})

gulp.task('serve', serve({ port: PORT, root: '.' }))

gulp.task('watch', function() {
  livereload.listen({ start: true });
  gulp.watch('slides.md', ['refresh'])
  gulp.watch('index.html', ['refresh'])
  gulp.watch('lib/*.js', ['refresh', 'test'])
  gulp.watch('test/*.js', ['test'])
});

gulp.task('default', ['test', 'serve', 'watch'])

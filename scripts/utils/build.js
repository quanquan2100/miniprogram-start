const gulp = require('gulp');
const requireDir = require('require-dir');
requireDir('./gulp-tasks');

gulp.task('build', ['compile-css', 'compile-js', 'compile-json', 'compile-img']);
gulp.task('dev', ['compile-css', 'compile-js']);

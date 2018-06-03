const gulp = require('gulp');
const postcss = require('gulp-postcss');
const cssmin = require('gulp-clean-css');
const rename = require('gulp-rename');
const gutil = require('gulp-util');
const gulpif = require('gulp-if');
const fs = require('fs');
const path = require('path');

const options = gutil.env;
const isProduction = process.env.NODE_ENV === 'production';

// 判断执行的是文件夹还是单文件
const isDirectory = fs.lstatSync(options.src).isDirectory()
let src, dist;
if (isDirectory) {
  src = options.src + '/**/*.pcss';
  dist = options.dist;
} else {
  src = options.src;
  dist = path.dirname(options.dist);
}

gulp.task('compile-css', () => {
  return gulp.src(src)
    .pipe(postcss())
    .pipe(gulpif(isProduction, cssmin()))
    .pipe(rename((path) => {
      path.extname = '.wxss';
    }))
    .pipe(gulp.dest(dist));
});

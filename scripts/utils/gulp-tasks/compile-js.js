const gulp = require('gulp');
const gutil = require('gulp-util');
const gulpif = require('gulp-if');
const babel = require('gulp-babel');
const strip = require('gulp-strip-comments');
const uglify = require('gulp-uglify');
const stripDebug = require('gulp-strip-debug');
const fs = require('fs');
const path = require('path');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

const options = gutil.env;
const isProduction = process.env.NODE_ENV === 'production';

// 判断执行的是文件夹还是单文件
const isDirectory = fs.lstatSync(options.src).isDirectory()
let src, dist;
if (isDirectory) {
  src = options.src + '/**/*.js';
  dist = options.dist;
} else {
  src = options.src;
  dist = path.dirname(options.dist);
}

gulp.task('compile-js', () => {
  return gulp.src(src)
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(babel({
      plugins: [
        ['transform-object-rest-spread', {
          useBuiltIns: true
        }]
      ],
      presets: [
        ['env', {
          loose: true,
          useBuiltIns: true,
          exclude: ['transform-es2015-typeof-symbol']
        }]
      ]
    }))
    .pipe(gulpif(isProduction,  stripDebug()))
    .pipe(gulpif(isProduction, strip()))
    .pipe(gulpif(isProduction, uglify()))
    .pipe(gulp.dest(dist));
});
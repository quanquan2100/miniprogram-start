const gulp = require('gulp');
const gutil = require('gulp-util');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');

const options = gutil.env;
const isProduction = process.env.NODE_ENV === 'production';

gulp.task('compile-img', () => {
  return gulp.src([options.src + '/**/*.{jpg,jpeg,png,gif,svg}'])
    .pipe(gulpif(isProduction, imagemin()))
    .pipe(gulp.dest(options.dist))
});


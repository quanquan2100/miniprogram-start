const gulp = require('gulp');
const gutil = require('gulp-util');
const gulpif = require('gulp-if');
const jsonminify = require('gulp-jsonminify');
const clip = require('gulp-clip-empty-files');

const options = gutil.env;
const isProduction = process.env.NODE_ENV === 'production';

gulp.task('compile-json', () => {
  return gulp.src([options.src + '/**/*.json', `!${options.src}/project.config.json`])
    .pipe(gulpif(isProduction, jsonminify()))
    .pipe(clip())
    .pipe(gulp.dest(options.dist));
});

const gulp = require('gulp');
const postcss = require('gulp-postcss');
const cssmin = require('gulp-clean-css');
const rename = require('gulp-rename');
const gutil = require('gulp-util');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const removeLogging = require('gulp-remove-logging');
const babel = require('gulp-babel');

const options = gutil.env;
const isProduction = process.env.NODE_ENV === 'production';

gulp.task('compile-css', () => {
  return gulp.src('../../src/**/*.pcss')
    .pipe(postcss())
    .pipe(cssmin())
    .pipe(rename((path) => {
      path.extname = '.wxss';
    }))
    .pipe(gulp.dest(options.dist));
});

gulp.task('compile-js', () => {
  return gulp.src(['../../src/**/*.js'])
    .pipe(removeLogging({
      methods: isProduction ? ['log', 'info'] : []
    }))
    .pipe(babel({
      plugins: [
        ['transform-object-rest-spread', { useBuiltIns: true }]
      ],
      presets: [
        ['env', {
          loose: true,
          useBuiltIns: true,
          exclude: ['transform-es2015-typeof-symbol']
        }]
      ]
    }))
    .pipe(gulp.dest(options.dist));
});

gulp.task('image', () =>
  gulp.src(['../../src/assets/**/*.{jpg,jpeg,png,gif,svg}'])
  .pipe(gulpif(isProduction, imagemin()))
  .pipe(gulp.dest('dist'))
);


gulp.task('build', ['compile-css', 'compile-js']);

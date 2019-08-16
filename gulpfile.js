'use strict'

const gulp = require('gulp'),
  del = require('del'),
  minify = require('gulp-minify')
 
gulp.task('clean', async () => del(['client/dist']));

gulp.task('compress', async () => {
  gulp.src(['client/src/*.js'])
    .pipe(minify())
    .pipe(gulp.dest('client/dist'))
})

gulp.task('default', gulp.series('clean', 'compress'))
'use strict';
import gulp from 'gulp';
// import babel from 'gulp-babel';
import mocha from 'gulp-mocha';
import through from 'through2';
import named from 'vinyl-named';
import eslint from 'gulp-eslint';
// import uglify from 'gulp-uglify';
import { exec } from 'child_process';
import istanbul from 'gulp-istanbul';
import webpack from 'webpack-stream';
import concat from 'gulp-concat';
import prettydiff from 'gulp-prettydiff';
import sourcemaps from 'gulp-sourcemaps';
import webpackEs5Config from './webpack-es5.config.babel.js';
import webpackEs6Config from './webpack-es6.config.babel.js';

const PATH = {
  allSrcJs: 'src/**/*.js',
  allTests: 'test/**/*.js',
  clientEntryPoint: 'src/extension.js',
  gulpFile: 'gulpfile.babel.js',
  webpackEs5File: 'webpack-es5.config.babel.js',
  webpackEs6File: 'webpack-es6.config.babel.js'
};

gulp.task('lint', () =>
  gulp.src([
    PATH.allSrcJs
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

gulp.task('test', ['lint'], () =>
  gulp.src(PATH.allTests)
    .pipe(mocha())
);

gulp.task('docs', ['test'], () => {
  exec('node ./node_modules/.bin/jsdoc -c jsdoc.json', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`${stdout}`);
    console.log(`${stderr}`);
  });
});

gulp.task('build-es5', ['docs'], () =>
  gulp.src(PATH.clientEntryPoint)
  .pipe(webpack(webpackEs5Config))
  .pipe(gulp.dest('dist'))
);

gulp.task('build', ['build-es5'], () =>
  gulp.src(PATH.clientEntryPoint)
  .pipe(named())
  .pipe(webpack(webpackEs6Config))
  .pipe(sourcemaps.init({ 'loadMaps': true }))
  .pipe(through.obj(function (file, enc, cb) {
    var isSourceMap = /\.map$/.test(file.path);
    if (!isSourceMap) {
      this.push(file);
    }
    cb();
  }))
  .pipe(sourcemaps.write())
  /*.pipe(prettydiff({
    'lang': 'javascript',
    'mode': 'minify'
  }))*/
  .pipe(gulp.dest('dist'))
);

gulp.task('watch', () =>
  gulp.watch(PATH.allSrcJs, ['build'])
);

gulp.task('watch-tests', () =>
  gulp.watch(PATH.allTests, ['test'])
);

gulp.task('default', ['watch-tests', 'watch', 'build']);
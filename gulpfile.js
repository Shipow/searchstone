const gulp = require('gulp');
const path = require('path');
const del = require('del');
const rename = require("gulp-rename");
const runSequence = require('run-sequence');

//dev
const webserver = require('gulp-webserver');
const livereload = require('gulp-livereload');

//deploy
const ghPages = require('gulp-gh-pages');

//css
const sass = require('gulp-sass');
const scsslint = require('gulp-scss-lint');
const scssLintStylish = require('gulp-scss-lint-stylish');
const autoprefixer = require('gulp-autoprefixer');

//html
const haml = require('gulp-haml');

//SVG
const inject = require('gulp-inject');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');

//js
const webpack = require('webpack-stream');
const webpackConfig = require("./webpack.config.js");
const jshint = require('gulp-jshint');

//prod
const rev = require('gulp-rev-mtime');
const minifyCss = require('gulp-minify-css');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant')
const favicons = require("gulp-favicons");

const algolia = require('algoliasearch');
const _ = require('lodash');
const chalk = require('chalk');
const through = require('through2');
const cloudinary = require("cloudinary");

//var requireDir = require('require-dir');


const gulpsync = require('gulp-sync')(gulp);

const config = require('./config.json');

const fs = require('fs');

const async = require('async');

// *************************************
//
// Available tasks:
//   `gulp dev`
//   `gulp build`
//   `gulp deploy`
//
// *************************************


// -------------------------------------
//   Task: Clean build directory
// -------------------------------------
gulp.task('clean', function() {
  return del("build");
});

// -------------------------------------
//   Task: Haml
// -------------------------------------
gulp.task('haml', function () {
  return gulp.src('src/*.haml')
  .pipe(haml())
  .pipe(gulp.dest('build'));
});

// -------------------------------------
//   Task: Inline Svg Icons
// -------------------------------------
gulp.task('icons', function () {
  var svgs = gulp.src('src/svg-icons/*.svg')
  .pipe(svgmin(function (file) {
    var prefix = path.basename(file.relative, path.extname(file.relative));
    return {
      plugins: [{
        cleanupIDs: {
          prefix: prefix + '-',
          minify: true
        }
      }]
    }
  }))
  .pipe(cheerio({
    run: function ($) {
      $('[fill]').removeAttr('fill');
      $('title').remove();
    },
    parserOptions: { xmlMode: true }
  }))
  .pipe(svgstore({ inlineSvg: true }));
  function fileContents (filePath, file) {
    return file.contents.toString();
  }
  return gulp
    .src('build/index.html')
    .pipe(inject(svgs, {transform: fileContents }))
    .pipe(gulp.dest('build'))
    .pipe(livereload());
});

// -------------------------------------
//   Task: SCSS
// -------------------------------------
gulp.task('scss', function () {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('build'))
    .pipe(livereload());
});

// -------------------------------------
//   Task: Lint SCSS
// -------------------------------------
gulp.task('lint:scss', function() {
  return gulp.src('src/scss/*.scss')
    .pipe(scsslint({
      customReport: scssLintStylish,
      config: '.scss-lint.yml'
    }));
});

// -------------------------------------
//   Task: Minify CSS
// -------------------------------------
gulp.task('css:min', ['scss'], function () {
  return gulp.src('build/*.css')
    .pipe(minifyCss())
    .pipe(gulp.dest('build'));
});

// -------------------------------------
//   Task: Javascript
// -------------------------------------
gulp.task('js', function () {
  gulp.src('src/js/sunwell.js')
   .pipe(gulp.dest('build/js'));
  return gulp.src('src/js/app.js')
    .pipe(webpack(webpackConfig))
    .on('error',  function(e){
      this.emit('end'); // Recover from errors
    })
    .pipe(gulp.dest('build/js'))
    .pipe(livereload());
});

// -------------------------------------
//   Task: Lint Javascript
// -------------------------------------
gulp.task('lint:js', function() {
  return gulp.src('src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

// -------------------------------------
//   Task: Minify JS
// -------------------------------------
gulp.task('js:min', ['js'], function () {
  return gulp.src('build/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

// -------------------------------------
//   Task: Images & Optmizations
// -------------------------------------
gulp.task('images', function () {
  return gulp.src('src/img/**/*')
    .pipe(gulp.dest('build/img'))
    .pipe(livereload());
});

gulp.task('images:optim', function () {
  return gulp.src('src/img/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('build/img'));
});

// -------------------------------------
//   Task: Favicons
// -------------------------------------
gulp.task("favicons", function () {
  return gulp.src("src/favicon.png")
    .pipe(favicons({
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        coast: false,
        favicons: true,
        firefox: false,
        opengraph: false,
        twitter: false,
        windows: false,
        yandex: false
      }
    }))
    .pipe(gulp.dest("build/"));
});

// -------------------------------------
//   Task: Watch
// -------------------------------------
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('src/*.haml', ['build:haml']);
  gulp.watch('src/scss/**/*.scss', ['scss','lint:scss']);
  gulp.watch('src/js/**/*.js', ['js', 'lint:js']);
  gulp.watch('src/img/**/*',['images']);
});

// -------------------------------------
//   Task: Web Server
// -------------------------------------
gulp.task('webserver', function() {
  gulp.src('build')
    .pipe(webserver({
      host: '0.0.0.0',
      port: 1337,
      livereload: true,
      directoryListing: false,
      open: true
    }));
});

// -------------------------------------
//   Task: Revision
// -------------------------------------
gulp.task('rev', function () {
	return gulp.src('build/*.html')
		.pipe(rev({
      cwd: 'build'
    }))
		.pipe(gulp.dest('build'));
});

// -------------------------------------
//   Task: CNAME
// -------------------------------------
gulp.task('cname', function () {
	return gulp.src('src/CNAME')
		.pipe(gulp.dest('build'));
});

// -------------------------------------
//   Task: Font
// -------------------------------------
gulp.task('font', function () {
	return gulp.src('src/font/*')
		.pipe(gulp.dest('build/font'));
});

// -------------------------------------
//   Task: Build DEV - PROD - HAML
// -------------------------------------
gulp.task('build:dev',['clean'], function(callback) {
  runSequence('scss', 'images', 'haml', 'icons', 'js', 'font', 'favicons', callback);
});

gulp.task('build:prod',['clean'], function(callback) {
  runSequence('scss', 'css:min', 'images:optim', 'haml', 'icons', 'js:min', 'favicons', 'font', 'rev', 'cname', callback);
});

gulp.task('build:haml', function(callback) {
  runSequence('haml', 'icons', callback);
});

// -------------------------------------
//   Task: Developement
// -------------------------------------
gulp.task('dev', function(callback) {
  runSequence('build:dev', 'watch', 'webserver', callback);
});

// -------------------------------------
//   Task: Deploy Github Page
// -------------------------------------
gulp.task('deploy',['build:prod'], function(callback) {
  return gulp.src('build/**/*')
    .pipe(ghPages());
});

// -------------------------------------
//   Task: Algolia
// -------------------------------------

gulp.task('export:algolia-index', function(){
  var client = algolia(config.algolia.appID, config.algolia.apiKey);
  var index = client.initIndex(config.algolia.index);
  fs.readFile('import/out/algolia-hearthstone.json', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    var data = _.chunk(JSON.parse(data), [size=100]);
    return index.clearIndex(function(err, content) {
      index.waitTask(content.taskID, function() {
        async.each(data, function(batch, callback) {
          index.addObjects(batch, function(err, result){
            index.waitTask(result.taskID, function() {
              console.log('Indexed '+ batch.length + ' cards');
              callback();
            });
          });
        }, function(err){
          console.log(err);
        });
      });
    });
  });
});


gulp.task('export:algolia-settings', function(){
  var client = algolia(config.algolia.appID, config.algolia.apiKey);
  var index = client.initIndex(config.algolia.index);
  index.setSettings(config.algolia.settings,function(err, content) {});
});

// -------------------------------------
//   Task: Cloudinary
// -------------------------------------
function gulpCloudinary(config, tags) {
  this.config = config;
  this.tags = tags;
  cloudinary.config(this.config);
}

gulpCloudinary.prototype.deleteOldByTag = function(){
  var self = this;
  //remove images with by tags
  cloudinary.api.delete_resources_by_tag(self.tags, function(data){
    console.log(data);
  });
}

gulpCloudinary.prototype.uploader = function(){
  var self = this,
  count = 0;
  return through.obj(function (file, enc, cb) {
    cloudinary.uploader.upload(file.path, function(data) {
      count++;
      cb();
    },{
      tags: "hs",
      use_filename: true,
      unique_filename: false,
      invalidate: true
    });
  }, function (cb) {
    console.log('Uploaded: ' + chalk.green(count + ' items'));
    cb();
  });
}

var tags = "hs";

gulp.task('export:cloudinary_upload', function(){
  var builderDefault = new gulpCloudinary(config.cloudinary, tags);
  return gulp.src(['./import/in/art/*'])
    .pipe(builderDefault.uploader());
});

gulp.task('export:cloudinary_clean', function(){
  var builderDefault = new gulpCloudinary(config.cloudinary, tags);
  builderDefault.deleteOldByTag();
});

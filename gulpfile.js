"use strict";

let gulp = require('gulp');
let browserSync = require('browser-sync');
let prefixer = require('gulp-autoprefixer');
let uglify = require('gulp-uglify');
let sass = require('gulp-sass');
let sourcemaps = require('gulp-sourcemaps');
let rigger = require('gulp-rigger');
let cssmin = require('gulp-minify-css');
let tinify = require('tinify');
let reload = browserSync.reload;

// объект в который пропишем все нужные нам пути
var path = {
  dist: { //Тут мы укажем куда складывать готовые после сборки файлы
    html: 'dist/',
    js: 'dist/js/',
    css: 'dist/css/',
    img: 'dist/img/',
    fonts: 'dist/fonts/'
  },
  src: { //Пути откуда брать исходники
    html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    js: 'src/js/main.js', //В стилях и скриптах нам понадобятся только main файлы
    css: 'src/style/main.scss',
    img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    fonts: 'src/fonts/**/*.*'
  },
  watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: 'src/**/*.html',
    js: 'src/js/**/*.js',
    css: 'src/css/**/*.scss',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  clean: './build'
};

// Создадим переменную с настройками нашего dev сервера
let config = {
  server: {
    baseDir: "./build"
  },
  tunnel: true,
  host: 'localhost',
  port: 9000,
  logPrefix: "Frontend_Devil"
};

// Build HTML
gulp.task('html:build', function () {
  gulp.src(path.src.html) //Выберем файлы по нужному пути
    .pipe(rigger()) //Прогоним через rigger
    .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});
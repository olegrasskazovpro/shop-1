"use strict";

const gulp = require('gulp');
const pump = require('pump');
const prefixer = require('gulp-autoprefixer');
// const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rigger = require('gulp-rigger');
const cssmin = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const rimraf = require('rimraf');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const ftp = require('vinyl-ftp');
const log = require('fancy-log');
const jasmine = require('gulp-jasmine');

// объект в который пропишем все нужные нам пути
let path = {
  dist: { //Тут мы укажем куда складывать готовые после сборки файлы
    html: 'dist/',
    js: 'dist/js/',
    css: 'dist/css/',
    img: 'dist/img/',
    fonts: 'dist/fonts/',
    db: 'dist/db/',
  },
  src: { //Пути откуда брать исходники
    html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    js: 'src/js/main.js', //В стилях и скриптах нам понадобятся только main файлы
    css: 'src/css/**/style.sass',
    img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    fonts: 'src/fonts/**/*.*',
    db: 'src/db/*.json',
  },
  deploy: {
    db: '*.json',
  },
  watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: 'src/**/*.html',
    js: 'src/js/**/*.js',
    css: 'src/css/**/*.sass',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*',
    db: 'src/db/*.json'
  },
  clean: './dist'
};

// Создадим переменную с настройками нашего dev сервера
let config = {
  server: {
    baseDir: "./dist"
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
    .pipe(gulp.dest(path.dist.html)) //Выплюнем их в папку build
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

// Build JS
gulp.task('js:build', function (cb) {
  pump([
      gulp.src(path.src.js), //Найдем наш main файл
      rigger(), //Прогоним через rigger
      sourcemaps.init(), //Инициализируем sourcemap
      // uglify(), //Сожмем наш js
      sourcemaps.write(), //Пропишем карты
      gulp.dest(path.dist.js), //Выплюнем готовый файл в build
      reload({stream: true}), //И перезагрузим сервер
    ],
    cb
  );
});

// Build CSS
gulp.task('css:build', function () {
  gulp.src(path.src.css) //Выберем наш main.scss
    .pipe(sourcemaps.init()) //То же самое что и с js
    .pipe(sass()) //Скомпилируем
    .pipe(prefixer()) //Добавим вендорные префиксы
    .pipe(cssmin()) //Сожмем
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.dist.css)) //И в build
    .pipe(reload({stream: true}));
});

// Build IMG
gulp.task('img:build', function () {
  gulp.src(path.src.img) //Выберем наши картинки
    .pipe(imagemin([ // сожмем их
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest(path.dist.img)) //И бросим в build
    .pipe(reload({stream: true}))
});

// Build fonts
gulp.task('fonts:build', function () {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.dist.fonts))
});

// Build json DB
gulp.task('db:build', function () {
  gulp.src(path.src.db)
    .pipe(gulp.dest(path.dist.db))
});

// Deploy json DB
gulp.task('db:deploy', function () {

  let conn = ftp.create({
    host: 'tina.timeweb.ru',
    user: 'olegras_proshop',
    password: '',
    parallel: 10,
    log: log.error('Json DB deploy failed')
  });

  // using base = '.' will transfer everything to /public_html correctly
  // turn off buffering in gulp.src for best performance

  return gulp.src(path.src.db, {base: '.', buffer: false})
    .pipe(conn.newer('.')) // only upload newer files
    .pipe(conn.dest('.'));

});

// Build ALL
gulp.task('build', [
  'db:build',
  // 'db:deploy',
  'html:build',
  'js:build',
  'css:build',
  'fonts:build',
  'img:build',
]);

// Auto-build changed files
gulp.task('watch', function () {
  gulp.watch(path.watch.html, ['html:build']);
  gulp.watch(path.watch.css, ['css:build']);
  gulp.watch(path.watch.js, ['js:build']);
  gulp.watch(path.watch.img, ['img:build']);
  gulp.watch(path.watch.fonts, ['fonts:build']);
  gulp.watch(path.watch.db, ['db:build']);
});

// Create web-server
gulp.task('webserver', function () {
  browserSync(config);
});

// Clean procedure (build folder delete)
gulp.task('clean', function (cb) {
  rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);
var gulp = require('gulp'), // Сообственно Gulp JS
    debug = require('gulp-debug'), // Отладка
    stylus = require('gulp-stylus'), // Плагин для Stylus
    nib = require('nib'), // stylus nib library
    ts = require('gulp-typescript'), // Typescript для Gulp
    tsc = require('gulp-tsc'), // TypescriptC для Gulp
    imagemin = require('gulp-imagemin'), // Минификация изображений
    filter = require('gulp-filter'), // Фильтр
    uglify = require('gulp-uglify'), // Минификация JS
    clean = require('gulp-clean'), // Очистка
    rename = require('gulp-rename'), // Переименование
    concat = require('gulp-concat'), // Склейка файлов
    mocha = require('gulp-mocha'); // Тесты

gulp.task('build.ui.js', function () {
    return gulp.src(['./src/ui/**/*.js', '!./src/ui/build.js'])
        .pipe(concat('ui.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('build.ui.stylus', function () {
    return gulp.src('./src/stylus/default.styl')
        .pipe(debug())
        .pipe(stylus({use: nib()}))
        .pipe(rename('styles.css'))
        .pipe(debug())
        .pipe(gulp.dest('./build'));
});

gulp.task('watch.ui.js', function() {
    return gulp.watch('./src/ui/**/*.js', {interval: 1000}, ['build.ui.js']);
});

gulp.task('watch.ui.stylus', function() {
    return gulp.watch('./src/stylus/**/*.styl', {interval: 1000}, ['build.ui.stylus']);
});

gulp.task('build.ui', ['build.ui.js', 'build.ui.stylus', 'watch.ui.stylus', 'watch.ui.js']);






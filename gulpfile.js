var
    fmvc = require('./src/compiler/xml2ts'),
    gulp = require('gulp'), // Сообственно Gulp JS
    debug = require('gulp-debug'),
    stylus = require('gulp-stylus'), // Плагин для Stylus
    ts = require('gulp-typescript'), // Typescript для Gulp
    tsc = require('gulp-tsc'), // TypescriptC для Gulp
    imagemin = require('gulp-imagemin'), // Минификация изображений
    filter = require('gulp-filter'), // Фильтр
    uglify = require('gulp-uglify'), // Минификация JS
    rename = require('gulp-rename'), // Переименование
    concat = require('gulp-concat'), // Склейка файлов
    mocha = require('gulp-mocha'); // Тесты

var argv = require('optimist').
    usage('Gulp tasks \nUsage: $0 -e [string]').
    demand(['e']).
    describe('e', 'String, environment "dev" or "prod"').argv;

var project = {
    name: 'fmvc',
    env: argv.e,
    version: '0.9.0',
    paths: {
        ts: ['./src/fmvc/*.ts'/*,'./src/ui-out/*.ts'*/],
        tsDev: ['./src/fmvc/*.ts'/*'./src/test-out/*.ts'*/]
    }
};

gulp.task('ts', function() {
    //var srcFilter = filter(['*', '!src/d.ts', '!src/compiler', '!src/test-out']);
    var sourceDirs = [].concat(project.paths.ts, (project.env === 'dev')?project.paths.tsDev:[] );
    var result = gulp
        .src(sourceDirs)
        .pipe(debug({title: 'unicorn:'}))
        .pipe(tsc({
            module: 'commonjs',
            target: 'es5',
            out: project.name + '.' + project.env + '.js',
            emitError: false,
            declaration: true,
            sourceMap: true
        }));
    return result.pipe(gulp.dest('build'));
});

gulp.task('ui', function() {
    new fmvc.Xml2Ts('./src/ui', './src/ui-out');
});

gulp.task('test', function() {
    new fmvc.Xml2Ts('./src/test', './src/test-out');
});

gulp.task('watch', function () {
    return gulp.watch('./src/fmvc/*.ts', { interval: 2000 }, ['ts']);
    /*
    gulp.watch('./src/ft/*.ts', { interval: 3000 }, ['ts']);
    gulp.watch('./src/ui/*.*', { interval: 3000 }, ['ui', 'ts']);
    gulp.watch('./src/test/*.*', { interval: 3000 }, ['test', 'ts']);
    */
});

gulp.task('default', ['ts', 'watch']);

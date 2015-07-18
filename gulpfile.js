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
    usage('Gulp task execution. \nUsage: $0 -e [string]').
    demand(['e']).
    describe('e', 'String, environment dev or prod').argv;

var project = {
    name: 'fmvc',
    env: argv.e,
    version: '0.8.4',
    paths: {
        /*ts: ['./src/fmvc/facade.ts','./src/fmvc/event.ts','./src/fmvc/notifier.ts', './src/fmvc/event.dispatcher.ts',
            './src/fmvc/mediator.ts','./src/fmvc/model.ts','./src/fmvc/logger.ts','./src/fmvc/model.list.ts','./src/fmvc/view.ts','./src/fmvc/view.i.ts', './src/fmvc/view.list.ts',
            './src/ui-out/*.ts'],*/
        ts: ['./src/fmvc/*.ts','./src/ui-out/*.ts'],
        tsDev: ['./src/test-out/*.ts']
    }
};


gulp.task('ts', function() {
    console.log('Start task TS, env ' , project.env);
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

    //console.log(result);
    return result.pipe(gulp.dest('build'));
});
var runTask = function(task){ return function() { console.log('Start task %s', task); gulp.run('ts'); }; };

gulp.task('ui', function() {
    console.log('Start task UI');
    new fmvc.Xml2Ts('./src/ui', './src/ui-out');
});

gulp.task('test', function() {
    console.log('Start task TEST');
    new fmvc.Xml2Ts('./src/test', './src/test-out');
});


gulp.task('watch', function () {
    console.log('Start task WATCH');
    gulp.watch('./src/fmvc/*.ts', { interval: 3000 }, ['ts']);
    gulp.watch('./src/ui/*.*', { interval: 3000 }, ['ui', 'ts']);
    gulp.watch('./src/test/*.*', { interval: 3000 }, ['test', 'ts']);
});

gulp.task('default', ['ui', 'test', 'ts', 'watch']);
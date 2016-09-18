var
    gulp = require('gulp'), // Сообственно Gulp JS
    debug = require('gulp-debug'),
    clean = require('gulp-clean'),
    stylus = require('gulp-stylus'), // Плагин для Stylus
    nib = require('nib'), // stylus nib library
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
    describe('e', 'String, environment "dev" or "prod"').argv;

var Env = {Prod: 'prod', Dev: 'dev'};

var project = {
    name: 'fmvc',
    env: argv.e || 'prod',
    version: '0.9.5',
    date: new Date().toISOString(),
    paths: {
        fmvcSrc: ['./test/fmvc/**/*.ts'],
        ftSrc: ['./test/ft/**/*.ts' ]
    }
};

function buildTsSources(name, src) {
    var result = gulp
        .src(src)
        .pipe(debug({title: 'unicorn:'}))
        .pipe(tsc({
            tscSearch: ['shell'],
            module: 'commonjs',
            target: 'es5',
            out: name + (project.env === Env.Prod ? '' : '.' + project.env) + '.js',
            //noLib: true,
            emitError: false,
            declaration: true,
            sourceMap: false
        }));

    return result.pipe(gulp.dest('build'));
}

gulp.task('build.ft', function () {
    return buildTsSources('ft', project.paths.ftSrc);
});

gulp.task('watch.ft', function () {
    return gulp.watch(['./test/fmvc/*.ts','./test/ft/*.ts'], {interval: 2000}, ['build.ft'])
});

gulp.task('contrib', function () {
    return gulp.src('./contrib/*.js')
        .pipe(concat('contrib.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});

gulp.task('all', function () {
    return gulp.src('./build/all.js')
        .pipe(concat('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});



gulp.task('clear', function () {
    return gulp.src([
        './test/app/**/*.js*',
        './test/ui/**/*.js*',
        './test/fmvc/**/*.js*',
        './test/ft/**/*.js*',
        './test/stylus/**/*.css',
        './test/test/**/*.js*'
    ], {read: false})
        .pipe(clean());
});

gulp.task('build', [ 'build.contrib', 'build.ft', 'build.ui', 'watch.ft'] );


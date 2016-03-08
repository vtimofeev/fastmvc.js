var
//fmvc = require('./src/compiler/xml2ts'),
    gulp = require('gulp'), // Сообственно Gulp JS
    debug = require('gulp-debug'),
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
    version: '0.9.3',
    paths: {
        fmvcSrc: ['./src/fmvc/*.ts'],
        ftSrc: ['./src/ft/**/*.ts' ] // fast templates
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

    if (project.env === Env.Prod) {
        //result.pipe(uglify());
    }

    return result.pipe(gulp.dest('build'));
}


gulp.task('build.fmvc', function () {
    //var srcFilter = filter(['*', '!src/d.ts', '!src/compiler', '!src/test-out']);
    return buildTsSources('fmvc', project.paths.fmvcSrc);
});


gulp.task('build.ft', function () {
    return buildTsSources('ft', project.paths.ftSrc);
});

gulp.task('build.ft.ui', function () {
    return null;
});

var buildTasks = [/*'build.fmvc',*/ 'build.ft'];
gulp.task('watch', function () {
    return gulp.watch(['./src/fmvc/*.ts','./src/ft/*.ts'], {interval: 2000}, buildTasks);
});

gulp.task('stylus', function() {
    var s = stylus({use: nib()});
    s.on('error',function(e){
        console.log(e);
        s.end();
    });

    return gulp.src('./src/ui/stylus/default.styl')
        .pipe(s)
        .pipe(gulp.dest('./src/ui/stylus'));
});

gulp.task('build.contrib', function () {
    return gulp.src('./src/contrib/*.js')
        .pipe(concat('contrib.build.js'))
        .pipe(gulp.dest('./build'));
});


gulp.task('swatch', function() {
    return gulp.watch('./src/ui/stylus/**/*.styl', ['stylus']);
});

gulp.task('default', [].concat(buildTasks, ['watch']));


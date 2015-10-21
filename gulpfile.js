// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var concat = require('gulp-concat');
var cssimport = require("gulp-cssimport");
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var ext_replace = require('gulp-ext-replace');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var less = require('gulp-less');
var path = require('path');
var handlebars = require('gulp-compile-handlebars');

gulp.task('minifyAllScss', function () {
    var options = {
        extensions: ["css, !less", "!sass"]
    };
    return gulp.src(['www/public/css/pages/**/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(cssimport(options))
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCss())
        .pipe(sourcemaps.write('.'))
        .pipe(ext_replace('.min.css'))
        .pipe(gulp.dest('www/public/cssmin'));
});

gulp.task('minifyAllImages', function () {
    return gulp.src('www/public/imgs/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('www/public/imgsmin'));
});

gulp.task('minifyUberAppJS', function () {
    return gulp.src(['www/public/angular/core/app.js', 'www/public/angular/core/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('www/public/angular_min/core'))
        .pipe(rename('app.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('www/public/angular_min/core'));
});

gulp.task('concatenateUberCoreDev', function () {
    return gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/jquery-ui/jquery-ui.js',
        'www/lib/ionic/js/ionic.js',
        'www/lib/ionic/js/angular/angular.js',
        'www/lib/ionic/js/angular/angular-animate.js',
        'www/lib/ionic/js/angular/angular-resource.js',
        'www/lib/ionic/js/angular/angular-sanitize.js',
        'www/lib/ionic/js/angular-ui/angular-ui-router.js',
        'www/lib/ionic/js/ionic-angular.js',
        'bower_components/angular-jwt/dist/angular-jwt.js',
        'bower_components/underscore/underscore.js',
        'bower_components/underscore.string/dist/underscore.string.js',
        'bower_components/bootstrap/dist/js/bootstrap.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
        'bower_components/angular-toastr/dist/angular-toastr.tpls.js',
        'bower_components/ngDialog/js/ngDialog.js',
        'bower_components/ng-table/dist/ng-table.js',
        'bower_components/restangular/dist/restangular.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.js',
        'bower_components/angular-loading-bar/src/loading-bar.js',
        'bower_components/matchheight/jquery.matchHeight.js',
        'bower_components/aaCustom-js-files/geocomplete/jquery.geocomplete.js',
        'bower_components/ngCordova/dist/ng-cordova.js',
        'bower_components/ng-cordova-oauth/dist/ng-cordova-oauth.js'

    ])
        .pipe(sourcemaps.init())
        .pipe(concat('core.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('www/public/js_final'));
});

gulp.task('minifyHelperJs', function () {
    return gulp.src(['www/public/js_helpers/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('js_helpers.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('www/public/js_final'));
});

gulp.task('concatenateVendorJs', function () {
    return gulp.src(['www/public/js_vendor/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('js_vendor.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('www/public/js_final'));
});

gulp.task('compile_handlebars', function () {
    var helpers = require('./rq.js').app().locals;
    var templateData = {},
        options = {
            ignorePartials: false,
            helpers: helpers,
            batch: [
                'views/'
            ]
        };

    return gulp.src('views/all/index.hbs')
        .pipe(handlebars(templateData, options))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('www'));
});

/*
 * ionic consistency tasks
 * */

gulp.task('sass', function (done) {
    gulp.src('www/public/css_ionic/**/*.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('www/css/'))
        .on('end', done);
});

/*
 * end ionic tasks
 * */


// Watch Files For Changes
gulp.task('watch', function () {
    gulp.watch('www/public/css_ionic/**/*.scss', ['sass']);
    gulp.watch('bower_components/bootstrap-sass/**/*.scss', ['minifyAllScss']);
    gulp.watch('www/public/css/**/*.scss', ['minifyAllScss']);
    gulp.watch('www/public/imgs/**/*', ['minifyAllImages']);
    gulp.watch('www/public/angular/core/**/*.js', ['minifyUberAppJS']);
    gulp.watch('www/public/js_helpers/**/*.js', ['minifyHelperJs']);
    gulp.watch('www/public/js_vendor/**/*.js', ['concatenateVendorJs']);
});

// Default Task
gulp.task('default', [
    'sass',
    'minifyAllScss',
    'minifyAllImages',
    'concatenateUberCoreDev',
    'minifyHelperJs',
    'concatenateVendorJs',
    'minifyUberAppJS',
    'watch'
]);

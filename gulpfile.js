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

gulp.task('minifyAllScss', function () {
    var options = {
        extensions: ["css, !less", "!sass"]
    };
    return gulp.src(['public/css/pages/**/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(cssimport(options))
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCss())
        .pipe(sourcemaps.write('.'))
        .pipe(ext_replace('.min.css'))
        .pipe(gulp.dest('public/cssmin'));
});

gulp.task('minifyAllImages', function () {
    return gulp.src('public/imgs/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('public/imgsmin'));
});

gulp.task('minifyUberAppJS', function () {
    return gulp.src(['public/angular/core/app.js', 'public/angular/core/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/angular_min/core'));
});

gulp.task('concatenateUberCoreDev', function () {
    return gulp.src([
        'lodash/lodash.js',
        'bower_components/jquery/dist/jquery.js',
        'bower_components/jquery-ui/jquery-ui.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/angular-simple-logger/dist/angular-simple-logger.js',
        'bower_components/angular-google-maps/dist/angular-google-maps.js',
        'bower_components/underscore/underscore.js',
        'bower_components/underscore.string/dist/underscore.string.js',
        'bower_components/bootstrap/dist/js/bootstrap.min.js',
        'bower_components/respond/dest/respond.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
        'bower_components/angular-toastr/dist/angular-toastr.tpls.js',
        'bower_components/ngDialog/js/ngDialog.js',
        'bower_components/ng-table/dist/ng-table.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.js',
        'bower_components/angular-loading-bar/src/loading-bar.js',
        'bower_components/matchheight/jquery.matchHeight.js',
        'bower_components/aaCustom-js-files/geocomplete/jquery.geocomplete.js',
        'public/jsmin/vendor/gmaps.js',
        'public/jsmin/vendor/bluebird.min.js'

    ])
        .pipe(sourcemaps.init())
        .pipe(concat('jsfiles.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/uberjs'));
});


// Watch Files For Changes
gulp.task('watch', function () {
    gulp.watch('bower_components/bootstrap-sass/**/*.scss', ['minifyAllScss']);
    gulp.watch('public/css/**/*.scss', ['minifyAllScss']);
    gulp.watch('public/imgs/**/*', ['minifyAllImages']);
    gulp.watch('public/angular/core/**/*.js', ['minifyUberAppJS']);
});

// Default Task
gulp.task('default', [
    'minifyAllScss',
    'minifyAllImages',
    'concatenateUberCoreDev',
    'minifyUberAppJS',
    'watch'
]);

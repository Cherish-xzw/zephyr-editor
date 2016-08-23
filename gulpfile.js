// var gulp = require('gulp');

// gulp.task('build', function () {

// });

// gulp.task('watch', ['build'], function () {
//     gulp.watch('./src/js/*.js', ['build']);
// });

// gulp.task('default', ['build', 'watch']);
var cssmin = require('gulp-minify-css'),
    jspm = require('gulp-jspm-build'),
    gulp = require('gulp'),
    clean = require('gulp-clean');

var paths = {
    app: 'src',
    css: {
        files: ['src/css/*.css']
    },
    external_css: [

    ],

    dest: './dist/'
};

// concat and minify CSS files
gulp.task('minify-css', function () {
    return gulp.src(paths.css.files)
        .pipe(cssmin({}))
        .pipe(gulp.dest(paths.dest + 'css'));
});

// copy external css
gulp.task('copy-external-css', function () {
    return gulp.src(paths.external_css)
        .pipe(gulp.dest(paths.dest + 'lib/css'));
});

// build JSPM modules
gulp.task('jspm', function () {
    jspm({
        bundleOptions: {
            minify: true,
            mangle: true
        },
        bundles: [
            { src: 'src/app/main', dst: 'main.js' }
        ]
    })
        .pipe(gulp.dest(paths.dest + "app"));
});

// clean dest
gulp.task('clean', function () {
    return gulp.src(paths.dest)
        .pipe(clean());
});

gulp.task('build', ['minify-css', 'copy-external-css', 'jspm'], function () { });
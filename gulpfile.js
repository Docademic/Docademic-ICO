const gulp = require('gulp');
const pump = require('pump');
const minhtml = require('gulp-htmlmin');
const uglifyes = require('gulp-uglifyes');
const mincss = require('gulp-clean-css');

const htmlreplace = require('gulp-html-replace');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('gulp-browserify');
const rename = require('gulp-rename');
const browserSync = require('browser-sync');
const runSequence = require('run-sequence');
const reload = browserSync.reload;
const del = require('del');

const DEST = 'dist/';
const paths = {
    css: './assets/css/*.css',
    js: './assets/js/*.js',
    assets: './assets/',
    assetImgs: './assets/img'
};

gulp.task('default', function () {

});

gulp.task('serve', function () {
    runSequence(['browserify', 'browserify-buy', 'browserify-shape'], function (error) {
            browserSync({
                server: {
                    baseDir: '.'
                }
            });
            gulp.watch(['./assets/js/app.js', './assets/js/mtc.js', './assets/js/buy.js', './assets/js/shape.js'], ['browserify', 'browserify-buy', 'browserify-shape', reload]);
            gulp.watch(['*.html', './confirm/*.html', './assets/js/main.js', paths.css], reload);
        }
    );
});

gulp.task('serve-b', function () {
    runSequence('build', function (error) {
            browserSync({
                server: {
                    baseDir: './dist'
                }
            });
        }
    );
});

gulp.task('minify-css', function () {
    return pump([
        gulp.src(paths.css),
        mincss(),
        concat('styles.min.css'),
        gulp.dest(DEST + '/assets/css')
    ]);
});

gulp.task('minify-js', function () {
    return pump([
        gulp.src([paths.js, '!./assets/js/app.js', '!./assets/js/buy.js', '!./assets/js/buy-bundle.js', '!./assets/js/shape.js', '!./assets/js/shape-bundle.js']),
        uglifyes(),
        concat('bundle.min.js'),
        gulp.dest(DEST + '/assets/js')
    ]);
});

gulp.task('minify-buy-js', function () {
    return pump([
        gulp.src('./assets/js/buy-bundle.js'),
        uglifyes(),
        concat('buy-bundle.min.js'),
        gulp.dest(DEST + '/assets/js')
    ]);
});

gulp.task('minify-shape-js', function () {
    return pump([
        gulp.src('./assets/js/shape-bundle.js'),
        uglifyes(),
        concat('shape-bundle.min.js'),
        gulp.dest(DEST + '/assets/js')
    ]);
});

gulp.task('minify-html', function () {
    return pump([
        gulp.src('./*.html'),
        minhtml({collapseWhitespace: true}),
        htmlreplace({
            'css': 'assets/css/styles.min.css',
            'js': 'assets/js/bundle.min.js',
            'jsbuy': '/assets/js/buy-bundle.min.js',
            'jsshape': '/assets/js/shape-bundle.min.js'
        }),
        gulp.dest(DEST)
    ]);
});

gulp.task('minify-html-c', function () {
    return pump([
        gulp.src('./confirm/*.html'),
        minhtml({collapseWhitespace: true}),
        htmlreplace({
            'css': '/assets/css/styles.min.css',
            'js': '/assets/js/bundle.min.js'
        }),
        gulp.dest(DEST + 'confirm')
    ]);
});

gulp.task('shifty-copy', function () {
    return gulp.src(['shifty/**/*']).pipe(gulp.dest(DEST+'shifty'));
});

gulp.task('img-copy', function () {
    return pump([
        gulp.src(paths.assetImgs + '/*.png'),
        gulp.dest(DEST + '/assets/img')
    ]);
});

gulp.task('img-team-copy', function () {
    return pump([
        gulp.src(paths.assetImgs + '/team/*.png'),
        gulp.dest(DEST + '/assets/img/team')
    ]);
});

gulp.task('img-advisors-copy', function () {
    return pump([
        gulp.src(paths.assetImgs + '/advisors/*.png'),
        gulp.dest(DEST + '/assets/img/advisors')
    ]);
});

gulp.task('img-partners-copy', function () {
    return pump([
        gulp.src(paths.assetImgs + '/partners/*.png'),
        gulp.dest(DEST + '/assets/img/partners')
    ]);
});

gulp.task('img-fav-copy', function () {
    return pump([
        gulp.src([paths.assets + 'fav/*.png', paths.assets + 'fav/*.ico']),
        gulp.dest(DEST + '/assets/fav')
    ]);
});

gulp.task('other-files-copy', function () {
    return pump([
        gulp.src(['./browserconfig.xml', './manifest.json']),
        gulp.dest(DEST)
    ]);
});

gulp.task('config-copy', function () {
    return gulp.src('./config.json.example')
        .pipe(rename('config.json'))
        .pipe(gulp.dest(DEST));
});

gulp.task('browserify', function () {
    return gulp.src('./assets/js/app.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: false
        }))
        .pipe(rename('main.js'))
        .pipe(gulp.dest('./assets/js'));
});

gulp.task('browserify-buy', function () {
    return gulp.src('./assets/js/buy.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: false
        }))
        .pipe(rename('buy-bundle.js'))
        .pipe(gulp.dest('./assets/js'));
});

gulp.task('browserify-shape', function () {
    return gulp.src('./assets/js/shape.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: false
        }))
        .pipe(rename('shape-bundle.js'))
        .pipe(gulp.dest('./assets/js'));
});

gulp.task('copy-imgs', ['img-copy', 'img-team-copy', 'img-advisors-copy', 'img-fav-copy', 'img-partners-copy']);

gulp.task('clean', function () {
    return del([
        'dist'
    ]);
});

gulp.task('build', function (callback) {
    runSequence('clean', 'browserify', 'browserify-buy', 'browserify-shape', 'minify-css', 'minify-js', 'minify-buy-js', 'minify-shape-js', 'minify-html', 'minify-html-c', 'other-files-copy', 'shifty-copy', 'config-copy', 'copy-imgs', function (error) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('RELEASE FINISHED SUCCESSFULLY');
            }
            callback(error);
        }
    );
});
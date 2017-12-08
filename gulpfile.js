const gulp = require('gulp');
const pump = require('pump');
const minhtml = require('gulp-htmlmin');
const minjs = require('gulp-uglify');
const mincss = require('gulp-clean-css');
const minimage = require('gulp-imagemin');
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
    browserSync({
        server: {
            baseDir: '.'
        }
    });
    gulp.watch('./assets/js/app.js', ['browserify']);
    gulp.watch(['*.html', './confirm/*.html', './assets/js/main.js', paths.css, paths.js], reload);

});

gulp.task('serve-b', function () {
    browserSync({
        server: {
            baseDir: './dist'
        }
    });
});

gulp.task('minify-css', function () {
    return pump([
        gulp.src(paths.css),
        sourcemaps.init(),
        mincss(),
        concat('styles.min.css'),
        sourcemaps.write(),
        gulp.dest(DEST + '/assets/css')
    ]);
});

gulp.task('minify-js', function () {
    return pump([
        gulp.src([paths.js, '!./assets/js/app.js', '!./assets/js/main.js']),
        sourcemaps.init(),
        minjs(),
        concat('bundle.min.js'),
        sourcemaps.write(),
        gulp.dest(DEST + '/assets/js')
    ]);
});

gulp.task('copy-app-js', function () {
    return pump([
        gulp.src('./assets/js/main.js'),
        gulp.dest(DEST + '/assets/js')
    ]);
});

gulp.task('minify-html', function () {
    return pump([
        gulp.src('./*.html'),
        minhtml({collapseWhitespace: true}),
        htmlreplace({
            'css': 'assets/css/styles.min.css',
            'js': 'assets/js/bundle.min.js'
        }),
        gulp.dest(DEST)
    ]);
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

gulp.task('browserify', function () {
    return pump([
        gulp.src('./assets/js/app.js'),
        browserify({
            insertGlobals: true,
            debug: false
        }),
        rename('main.js'),
        gulp.dest('./assets/js')
    ]);
});

gulp.task('copy-imgs', ['img-copy', 'img-team-copy', 'img-fav-copy']);

/*gulp.task('replace-html-index', function () {
    return pump([
        gulp.src('dist/index.html'),
        htmlreplace({
            'css': 'css/styles.min.css',
            'js': 'js/bundle.min.js'
        }),
        gulp.dest(DEST)
    ]);
});*/

gulp.task('clean', function () {
    return del([
        'dist',
        './assets/js/main.js'
    ]);
});

gulp.task('test-build', function (callback) {
    runSequence('clean', 'browserify', 'serve', function (error) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('TEST BUILD FINISHED SUCCESSFULLY');
            }
            callback(error);
        }
    );
});

gulp.task('build', function (callback) {
    runSequence('clean', 'browserify', 'minify-css', 'minify-js', 'minify-html', 'other-files-copy', 'copy-imgs', 'copy-app-js', function (error) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('RELEASE FINISHED SUCCESSFULLY');
            }
            callback(error);
        }
    );
});
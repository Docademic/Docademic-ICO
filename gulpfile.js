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
    runSequence('browserify', function (error) {
            browserSync({
                server: {
                    baseDir: '.'
                }
            });
            gulp.watch('./assets/js/app.js', ['browserify', reload]);
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
        sourcemaps.init(),
        mincss({
            level: {
                1: {
                  cleanupCharsets: true, // controls `@charset` moving to the front of a stylesheet; defaults to `true`
                  normalizeUrls: true, // controls URL normalization; defaults to `true`
                  optimizeBackground: true, // controls `background` property optimizations; defaults to `true`
                  optimizeBorderRadius: true, // controls `border-radius` property optimizations; defaults to `true`
                  optimizeFilter: true, // controls `filter` property optimizations; defaults to `true`
                  optimizeFont: true, // controls `font` property optimizations; defaults to `true`
                  optimizeFontWeight: true, // controls `font-weight` property optimizations; defaults to `true`
                  optimizeOutline: true, // controls `outline` property optimizations; defaults to `true`
                  removeEmpty: true, // controls removing empty rules and nested blocks; defaults to `true`
                  removeNegativePaddings: true, // controls removing negative paddings; defaults to `true`
                  removeQuotes: true, // controls removing quotes when unnecessary; defaults to `true`
                  removeWhitespace: true, // controls removing unused whitespace; defaults to `true`
                  replaceMultipleZeros: true, // contols removing redundant zeros; defaults to `true`
                  replaceTimeUnits: true, // controls replacing time units with shorter values; defaults to `true`
                  replaceZeroUnits: true, // controls replacing zero values with units; defaults to `true`
                  roundingPrecision: false, // rounds pixel values to `N` decimal places; `false` disables rounding; defaults to `false`
                  selectorsSortingMethod: 'standard', // denotes selector sorting method; can be `'natural'` or `'standard'`, `'none'`, or false (the last two since 4.1.0); defaults to `'standard'`
                  specialComments: 'all', // denotes a number of /*! ... */ comments preserved; defaults to `all`
                  tidyAtRules: true, // controls at-rules (e.g. `@charset`, `@import`) optimizing; defaults to `true`
                  tidyBlockScopes: true, // controls block scopes (e.g. `@media`) optimizing; defaults to `true`
                  tidySelectors: true, // controls selectors optimizing; defaults to `true`,
                  transform: function () {} // defines a callback for fine-grained property optimization; defaults to no-op
                }
              }
        }),
        concat('styles.min.css'),
        sourcemaps.write(),
        gulp.dest(DEST + '/assets/css')
    ]);
});

gulp.task('minify-js', function () {
    return pump([
        gulp.src([paths.js, '!./assets/js/app.js']),
        sourcemaps.init(),
        uglifyes(),
        concat('bundle.min.js'),
        sourcemaps.write(),
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
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(browserify({
            insertGlobals: true,
            debug: false
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(rename('main.js'))
        .pipe(gulp.dest('./assets/js'));
});

gulp.task('copy-imgs', ['img-copy', 'img-team-copy', 'img-advisors-copy', 'img-fav-copy']);

gulp.task('clean', function () {
    return del([
        'dist'
    ]);
});

gulp.task('build', function (callback) {
    runSequence('clean', 'browserify', 'minify-css', 'minify-js', 'minify-html', 'minify-html-c', 'other-files-copy', 'config-copy', 'copy-imgs', function (error) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('RELEASE FINISHED SUCCESSFULLY');
            }
            callback(error);
        }
    );
});
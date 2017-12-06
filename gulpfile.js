const gulp = require('gulp');
const minjs = require('gulp-uglify');
const mincss = require('gulp-clean-css');
const pump = require('pump');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const del = require('del');


const paths = {
	css: './assets/css/',
	js: './assets/js/',
	assets: './assets/'
};

gulp.task('default', () => {

});

gulp.task('serve', () => {
	browserSync({
		server: {
			baseDir: '.'
		}
	});
	
	gulp.watch(['*.html', paths.css, paths.js], reload);
});

gulp.task('build', () => {
	del('dist');
	gulp.src()
});
// Імпортуємо необхідні модулі
const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const del = require('del');

// 🧹 Очищення папки dist
const clean = () => {
    return del(['dist']);
};

// 📄 HTML task з file-include
const html_task = () => {
    return src('app/index.html')
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
};

// 🎨 SCSS → CSS task
const scss_task = () => {
    return src('app/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
};

// 💻 JS task: об'єднання + мінімізація
const js_task = () => {
    return src('app/js/*.js')
        .pipe(concat('main.min.js'))
        .pipe(uglify().on('error', function(e){ console.log(e.toString()); this.emit('end'); }))
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream());
};

// 🖼️ Оптимізація зображень
const img_task = () => {
    return src('app/img/*')
        .pipe(imagemin())
        .pipe(dest('dist/imgs'));
};

// 🔁 Watch + live server
const serve = () => {
    browserSync.init({ server: { baseDir: 'dist' }});
    watch('app/**/*.html', html_task);
    watch('app/scss/**/*.scss', scss_task);
    watch('app/js/**/*.js', js_task);
    watch('app/img/**/*', img_task);
};

// 🏁 Експорт тасок
exports.clean = clean;
exports.html_task = html_task;
exports.scss_task = scss_task;
exports.js_task = js_task;
exports.img_task = img_task;
exports.serve = serve;

// 📦 Основна таска
exports.default = series(
    clean,
    parallel(html_task, scss_task, js_task, img_task),
    serve
);

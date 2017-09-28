/**
 gulp 配置文件
 created by rx.tang
 */

var gulp = require('gulp'),
    os = require('os'),
    gutil = require('gulp-util'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    gulpOpen = require('gulp-open'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-cssmin'),
    md5 = require('gulp-md5-plus'),
    fileinclude = require('gulp-file-include'),
    clean = require('gulp-clean'),
    spriter = require('gulp-css-spriter'),
    base64 = require('gulp-css-base64');
//webpack = require('webpack'),
//webpackConfig = require('./webpack.config.js'),
var connect = require('gulp-connect');
var debug = require('gulp-debug');
var changed = require('gulp-changed');
var proxy = require('http-proxy-middleware');
var rewrite = require('express-urlrewrite')
// 开发
var src = {
    path: 'src'
}
var host = {
    path: 'build',
    port: 3000,
    html: 'index.html'
};

var dist = {
    path: 'dist'
};

//mac chrome: "Google chrome",
/*var browser = os.platform() === 'linux' ? 'Google chrome' : (
 os.platform() === 'darwin' ? 'Google chrome' : (
 os.platform() === 'win32' ? 'chrome' : 'firefox'));
 */
// 清理开发和发布文件夹
gulp.task('clean', function (done) {
    gulp.src([host.path, dist.path])
        .pipe(clean())
        .on('end', done);
});
//var pkg = require('./package.json');
//将图片拷贝到目标目录
gulp.task('copy:images', function (done) {
    gulp.src([src.path + '/images/**/*'])
        .pipe(changed(host.path + '/images'))
        //.pipe(debug({title: '编译:'}))
        .pipe(gulp.dest(host.path + '/images'))
        .on('end', done);
});

gulp.task('copy:dist', function (done) {
    gulp.src([src.path + '/dist/**/*'])
        .pipe(changed(host.path + '/dist'))
        //.pipe(debug({title: '编译:'}))
        .pipe(gulp.dest(host.path + '/dist'))
        .on('end', done);
});
// 合并Common
gulp.task('commonjs', function (done) {
    gulp.src([src.path + '/js/common/*.js'])
        .pipe(concat('common.js'))
        .pipe(changed(host.path + '/js'))
        .pipe(debug({title: '编译:'}))

     // .pipe(uglify().on('error', gutil.log))
        //.pipe(gulp.dest(host.path+'/js/'))
        // .pipe(gulp.dest('build/js/'))
        .pipe(gulp.dest(host.path + '/js'))
        .on('end', done);
});

// 复制js类库
gulp.task('copyjs', ['commonjs'], function (done) {
    gulp.src([src.path + '/js/*.js', src.path + '/js/**/*.js', "!" + src.path + '/js/common/*.js'])
        .pipe(changed(host.path + '/js'))
        .pipe(debug({title: '编译:'}))
        // .pipe(uglify().on('error', gutil.log))
        .pipe(gulp.dest(host.path + '/js'))
        .on('end', done);
});
// 复制sound库
gulp.task('copysoundlib', function (done) {
    gulp.src([src.path + '/fonts/**/**/*.*'])
        .pipe(changed(host.path + '/fonts'))
        .pipe(debug({title: '编译:'}))
        .pipe(gulp.dest(host.path + '/fonts'))
        .on('end', done);
});

// 复制css库
gulp.task('copycsslib', function (done) {
    gulp.src([src.path + '/css/**/*'])
        .pipe(changed(host.path + '/css'))
        .pipe(debug({title: '编译:'}))
        // .pipe(cssmin())
        .pipe(gulp.dest(host.path + '/css'))
        .on('end', done);
});

//用于在html文件中直接include文件
gulp.task('fileinclude', function (done) {
    gulp.src([src.path + '/*.html', src.path + '/**/*.html', "!" + src.path + '/common/*.html'])
        .pipe(changed(host.path))
        .pipe(debug({title: '编译:'}))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(host.path))
        .on('end', done);
});
 // // 压缩css
 // gulp.task('lessmin',['copycsslib'], function (done) {
 // gulp.src( ['src/css/*.css'])
 // //.pipe(less())
 // //这里可以加css sprite 让每一个css合并为一个雪碧图
 // //.pipe(spriter({}))
 // //.pipe(concat('style.min.css'))
 // .pipe(cssmin())
 // .pipe(gulp.dest('dist/css/'))
 // .on('end', done);
 // });


//雪碧图操作，应该先拷贝图片并压缩合并css
gulp.task('sprite', ['copy:images', 'lessmin'], function (done) {
    var timestamp = +new Date();
    gulp.src('dist/css/style.min.css')
        .pipe(spriter({
            spriteSheet: 'dist/images/spritesheet' + timestamp + '.png',
            pathToSpriteSheetFromCSS: '../images/spritesheet' + timestamp + '.png',
            spritesmithOptions: {
                padding: 10
            }
        }))
        .pipe(base64())
        .pipe(cssmin())
        .pipe(gulp.dest('dist/css'))
        .on('end', done);
});


gulp.task('watch', function (done) {
    gulp.watch('src/**/**/*', ['copyjs', 'copycsslib', 'fileinclude'])
        .on('end', done);
});

gulp.task('connect', function () {
    console.log('connect------------');
    connect.server({
        root: host.path,
        port: host.port,
        livereload: true,
        /*middleware: function (connect, opt) {
            return [
                proxy('/api', {
                    target: 'http://myxb.5173.com/',
                    changeOrigin: true,
                }),
                rewrite('/vue/*', '/vue/index.html')
            ]
        }*/
    });
});


//var myDevConfig = Object.create(webpackConfig);

//var devCompiler = webpack(myDevConfig);

//引用webpack对js进行操作
/*gulp.task("build-js", ['fileinclude'], function(callback) {
 devCompiler.run(function(err, stats) {
 if(err) throw new gutil.PluginError("webpack:build-js", err);
 gutil.log("[webpack:build-js]", stats.toString({
 colors: true
 }));
 callback();
 });
 });
 */


// 发布Front
gulp.task('deploy:fonts' ,  function (done) {
    gulp.src([host.path + '/fonts/**/*'])
        .pipe(gulp.dest(dist.path + '/fonts'))
        .on('end', done);
});
// 发布图片
gulp.task('deploy:images', ['deploy:fonts'] ,  function (done) {
    gulp.src([host.path + '/images/**/*'])
        .pipe(gulp.dest(dist.path + '/images'))
        .on('end', done);
});
// 发布html
gulp.task('deploy:html', ['deploy:images'] ,function (done) {
    gulp.src([host.path + '/**/*.html'])
        .pipe(gulp.dest(dist.path + '/'))
        .on('end', done);
});
// 发布css
gulp.task('deploy:css', ['deploy:html'], function (done) {
    gulp.src([host.path + '/css/**/*'])
	    .pipe(cssmin())
        .pipe(md5(10, [dist.path + '/*.html', dist.path + '/**/*.html']))
        .pipe(gulp.dest(dist.path + '/css'))
        .on('end', done);
});
// 发布js
gulp.task('deploy:js', ['deploy:css'], function (done) {
    gulp.src([host.path + '/js/**/*'])
	    .pipe(uglify().on('error', gutil.log))
        .pipe(md5(10, [dist.path + '/*.html', dist.path + '/**/*.html']))
        .pipe(gulp.dest(dist.path + '/js'))
        .on('end', done);
});
//
////将js加上10位md5,并修改html中的引用路径，该动作依赖build-js
//gulp.task('md5:js', ['build-js'], function (done) {
//    gulp.src('dist/js/*.js')
//        .pipe(md5(10, 'dist/*.html'))
//        .pipe(md5(10, 'dist/*/*.html'))
//        .pipe(gulp.dest('dist/js'))
//        .on('end', done);
//});
//
////将css加上10位md5，并修改html中的引用路径，该动作依赖sprite
//gulp.task('md5:css', ['sprite'], function (done) {
//    gulp.src('dist/css/*.css')
//        .pipe(md5(10, 'dist/*.html'))
//        .pipe(gulp.dest('dist/css'))
//        .on('end', done);
//});


//发布
gulp.task('default', ['deploy:js']);

//开发
gulp.task('dev', ['copy:images','copy:dist', 'copyjs', 'copysoundlib', 'copycsslib', 'fileinclude', 'connect', 'watch']);
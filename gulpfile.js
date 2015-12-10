const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const config = {
    server_src: './src/server/**/*.js',
    server_dst: './build',
    client_src: './src/client/**/*',
    client_dst: './build/public',
    app_entry: './build/app.js',
    app_port: 5000,    
};

const browserSync = require('browser-sync').create();
gulp.task('serve', ()=>{
    $.nodemon({
        script: config.app_entry,
        exp: 'js',
        ignore: [],
        env: {
            port: config.app_port
        }
    })
    .on('readable', ()=>{
        this.stdout.on('data', (chunk)=>{
            if (/^start /.test(chunk)){
                console.log('reloading...');
                browserSync.reload();
            }
            process.stdout.write(chunk)
        });
    });
});

gulp.task('browser-sync', ['serve'], ()=>{
    browserSync.init({
        proxy: 'localhost:' + config.app_port,
        port: 3000,
        ws: true
    })
});

gulp.task('server', () => {
    gulp.src(config.server_src)
        .pipe(gulp.dest(config.server_dst))
        .pipe(browserSync.stream())
        ;
});

gulp.task('client', () => {
    gulp.src(config.client_src)
        .pipe(gulp.dest(config.client_dst))
        .pipe(browserSync.stream())
        ;
});

gulp.task('build', ['server', 'client']);

gulp.task('watch', ['build', 'browser-sync'], ()=>{
    gulp.watch(config.server_src, ['server']);
    gulp.watch(config.client_src, ['client']);
});

gulp.task('default', ['watch']);

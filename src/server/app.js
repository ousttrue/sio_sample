const http = require('http');
const express = require('express');
var port = process.env.port || 3000;
var app = express();
var server = http.createServer(app);
var bodyparser = require('body-parser');
var methodoverride = require('method-override');
var logger = require('connect-logger');
var errorhandler = require('errorhandler');
var servestatic = require('serve-static');
var serve_dir = __dirname + '/public';
console.log('serve %s', serve_dir);
app
    .use(bodyparser())
    .use(methodoverride())
    .use(logger())
    .use(errorhandler({
        dumpExceptioons: true,
        showStack: true
    }))
    .use(servestatic(serve_dir))
;
// socket.io
const socketio = require('socket.io');
var io = socketio(server);
io.on('connection', (socket) => {
    console.log('a client connected %s', socket);
    socket.on('disconnect', () => {
        console.log('a client disconnected');
    });
});
// start
server.listen(port);
console.log('start port: %d...', port);

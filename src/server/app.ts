/// <reference path="../typings/tsd.d.ts" />
"use strict";

import http = require('http');
import express = require('express');
const port = process.env.port || 3000;
const app = express();
const server = http.createServer(app);
const servestatic = require('serve-static');
const serve_dir = __dirname + '/public';
console.log('serve %s', serve_dir);
app
    .use(servestatic(serve_dir))
;

// socket.io
import socketio = require('socket.io');
const io = socketio(server);
io.on('connection', (socket) => {
    var clientAddress = socket.client.conn.remoteAddress;
    console.log('connected: %s', clientAddress);
    console.log("online id: " + socket.id);
    socket.broadcast.emit("online", { id: socket.id });

    socket.on('disconnect', () => {
        //console.log('disconnected: %s', clientAddress);
        console.log("offline id: " + socket.id);
        socket.broadcast.emit("offline", { id: socket.id });
    });

    socket.on('client-message', (data: any) => {
        socket.emit('server-message', 'server clicked message');
    });

    socket.on("message", (obj:any) => {
        var id = socket.id;
        var message = obj.message;

        console.log("message id: " + id + " message: " + message);
        io.emit("message", { id: id, message: message });
    });
    
    socket.on('chat message', (msg: string)=>{
        console.log('chat message: %s', msg);
        io.emit('chat message', msg);
        //socket.broadcast.emit('chat message', msg);
    });
});

// start
server.listen(port);
console.log('start port: %d...', port);

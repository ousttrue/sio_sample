/// <reference path="../typings.d.ts" />

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

interface Transform {
    px: number;
    py: number;
    pz: number;
    rx: number;
    ry: number;
    rz: number;
    rw: number;
};

// socket.io
import socketio = require('socket.io');
const io = socketio(server);
var client_map: { [id: string]: SocketIOHub.ClientInfo } = {};
io.on('connection', (socket) => {
    var clientAddress = socket.client.conn.remoteAddress;
    console.log('connected: %s', clientAddress);
    console.log("online id: " + socket.id);

    socket.on('disconnect', () => {
        //console.log('disconnected: %s', clientAddress);
        console.log("offline id: " + socket.id);
        socket.broadcast.emit("offline", socket.id);
        delete client_map[socket.id];
    });

    socket.on("message", (obj: any) => {
        var id = socket.id;
        var message = obj.message;

        console.log("message id: " + id + " message: " + message);
        socket.broadcast.emit("message", { id: id, message: message });
    });

    socket.on('client-info', (info: SocketIOHub.ClientInfo) => {
        console.log('client-info: %s', JSON.stringify(info, null, 2));
        info.socketid = socket.id;
        
        // send list
        for (var key in client_map) {
            socket.emit('online', client_map[key]);
        }
        
        // send added
        let ip: string = socket.client.request.headers['x-forwarded-for']
            || socket.client.conn.remoteAddress
            || socket.conn.remoteAddress
            || socket.request.connection.remoteAddress;
        if (ip === '::1') {
            ip = '127.0.0.1';
        }
        else if (ip.match(/^::ffff:/)) {
            ip = ip.substr('::ffff:'.length);
        }
        else {
        }
        console.log('ipaddr: %s', ip);
        info.ipaddr = ip;
        
        client_map[socket.id] = info;
        socket.broadcast.emit('online', info);

        //console.log('clients', JSON.stringify(client_map, null, 2));
    });

    socket.on('client-transform', (t: Transform) => {
        client_map[socket.id].transform = t;
        console.log(JSON.stringify(t));
        
        socket.broadcast.emit('client-update', {
            socketid: socket.id,
            transform: t
        });
    });
});

// start
server.listen(port);
console.log('start port: %d...', port);

/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../typings.d.ts" />
"use strict";

declare module io {
    export function connect(): SocketIO.Socket;
}

class Client {
    socket: SocketIO.Socket;
    target: HTMLElement;
    clients: HTMLElement;
    client_map: { [id: string]: HTMLElement } = {};

    constructor() {
    }

    setup(target: HTMLElement, clients: HTMLElement) {
        this.target = target;
        this.clients = clients;

        this.socket = io.connect();

        this.socket.on("connect", () => {

            var clientInfo: SocketIOHub.ClientInfo = {
                socketid: this.socket.id,
                useragent: window.navigator.userAgent,
            };

            this.println('self: ' + JSON.stringify(clientInfo, null, 2));
            this.socket.emit('client-info', clientInfo);
        });

        this.socket.on("message", (obj: any) => {
            this.println("message id: " + obj.id + " message: " + obj.message);
        });

        this.socket.on("online", (info: SocketIOHub.ClientInfo) => {
            this.println('online: ' + JSON.stringify(info, null, 2));
            this.addClient(info);
        });

        this.socket.on("offline", (socketid: string) => {
            this.println('offline: ' + socketid);
            this.removeClient(socketid);
        });
    }

    println(message: any) {
        this.target.innerHTML += message + "<br>";
    }

    addClient(info: SocketIOHub.ClientInfo) {

        const client = document.createElement('div');
        client.innerHTML = JSON.stringify(info);
        this.client_map[info.socketid] = client;
        this.clients.appendChild(client);

    }

    removeClient(socketid: string) {

        this.clients.removeChild(this.client_map[socketid]);

    }

    send() {
        var message = document.getElementById("message").nodeValue;
        this.socket.emit("message", { message: message });

        document.getElementById("message").nodeValue = "";
    }
}
var client = new Client();

window.onload = () => {

    client.setup(
        document.getElementById('messages')
        , document.getElementById('clients')
    );

};

/// <reference path="../typings/tsd.d.ts" />
"use strict";

declare module io {
    export function connect(): SocketIO.Socket;
}

class Client {
    socket: SocketIO.Socket;

    constructor() {
        this.socket = io.connect();

        this.socket.on("connect", () => {
            /*
            let id = this.socket.conn.id;
            this.println("Connected ID: " + id);
            */
        });

        this.socket.on("message", (obj: any) => {
            this.println("message id: " + obj.id + " message: " + obj.message);
        });

        this.socket.on("online", (obj: any) => {
            this.println("online id: " + obj.id);
        });

        this.socket.on("offline", (obj: any) => {
            this.println("offline id: " + obj.id);
        });
    }

    setup(target: Element) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode('hello socket.io'));
        target.appendChild(div);

        this.socket.on('server-message', (data: any) => {
            const div = document.createElement('div');
            div.appendChild(document.createTextNode(data.toString()));
            target.appendChild(div);
        });

        const button = document.createElement('button');
        button.appendChild(document.createTextNode('send'));
        button.onclick = (ev: MouseEvent) => {
            this.socket.emit('client-message', 'clicked');
        };
        target.appendChild(button);
    }

    send() {
        var message = document.getElementById("message").nodeValue;
        this.socket.emit("message", { message: message });

        document.getElementById("message").nodeValue = "";
    }

    println(message: any) {
        document.getElementById("messages").innerHTML += message + "<br>";
    }
}
var client = new Client();

window.onload = () => {

    client.setup(document.getElementById('target'));

};

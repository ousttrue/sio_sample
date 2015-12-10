/// <reference path="../typings/tsd.d.ts" />
"use strict";

declare module io {
    export function connect(): SocketIO.Socket;
}

class Client {
    socket: SocketIO.Socket;

    constructor() {
        this.socket = io.connect();
    }

    setup(target: Element) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode('hello socket.io'));
        target.appendChild(div);
        
        this.socket.on('server-message', (data: any)=>{
            const div = document.createElement('div');
            div.appendChild(document.createTextNode(data.toString()));
            target.appendChild(div);
        });
        
        const button=document.createElement('button');
        button.appendChild(document.createTextNode('send'));
        button.onclick=(ev: MouseEvent)=>{
            this.socket.emit('client-message', 'clicked');
        };
        target.appendChild(button);
    }
}
var client=new Client();

window.onload = () => {

    client.setup(document.getElementById('target'));

};

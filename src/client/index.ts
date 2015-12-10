/// <reference path="../typings/tsd.d.ts" />
"use strict";

declare module io {
    export function connect(): SocketIO.Socket;
}

function setup(target: Element) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode('hello socket.io'));
    target.appendChild(div);
    
    this.socket = io.connect();
}

window.onload = () => {

    setup(document.getElementById('target'));

};

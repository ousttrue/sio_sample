"use strict";

function setup(target) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode('hello'));
    target.appendChild(div);
    
    this.socket = io.connect();
}

window.onload = () => {

    setup(document.getElementById('target'));

};

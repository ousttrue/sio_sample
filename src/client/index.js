"use strict";

function create(target) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode('onLoad'));
    target.appendChild(div);
}

window.onload = () => {

    create(document.getElementById('target'));

};
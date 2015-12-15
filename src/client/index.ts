/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../typings.d.ts" />
"use strict";

declare module io {
    export function connect(): SocketIO.Socket;
}

/**
 * 日付をフォーマットする
 * @param  {Date}   date     日付
 * @param  {String} [format] フォーマット
 * @return {String}          フォーマット済み日付
 */
var formatDate = function(date: Date, format: string) {
    if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
    format = format.replace(/YYYY/g, date.getFullYear().toString());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    if (format.match(/S/g)) {
        var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
        var length = format.match(/S/g).length;
        for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
    }
    return format;
};

class Client {
    socket: SocketIO.Socket;
    $messages: JQuery;
    $items: JQuery;
    $clients: JQuery;
    $selected: JQuery;

    constructor() {
    }

    setup($messages: JQuery, $clients: JQuery) {
        this.$messages = $messages;
        this.$items = $messages.find('.items');
        this.$clients = $clients;

        const self = this;
    }

    connect() {
        this.socket = io.connect();

        this.socket.on("connect", () => {

            var clientInfo: SocketIOHub.ClientInfo = {
                socketid: this.socket.id,
                useragent: window.navigator.userAgent,
            };

            this.log('self: ' + JSON.stringify(clientInfo, null, 2));
            this.socket.emit('client-info', clientInfo);
        });

        this.socket.on("message", (obj: any) => {
            this.log("message id: " + obj.id + " message: " + obj.message);
        });

        this.socket.on("online", (info: SocketIOHub.ClientInfo) => {
            this.log('online: ' + JSON.stringify(info, null, 2));
            this.addClient(info);
        });

        this.socket.on("offline", (socketid: string) => {
            this.log('offline: ' + socketid);
            this.removeClient(socketid);
        });
    }

    log(message: any) {
        this.$items.append('<div class="log log-info">'
            + '<span class="date">' + formatDate(new Date(), "YYYY-MM-DD hh:mm:ss") + '</span>'
            + '<span class="msg">' + message + '</span>'
            + '</div>');
        this.$messages.animate({ scrollTop: this.$items.height() - this.$messages.height() }, 'fast');
    }

    addClient(info: SocketIOHub.ClientInfo) {

        var $client = $('<div class="client" id="' + info.socketid + '">'
            + '<span class="ipaddr">' + info.ipaddr + '</span>'
            + '<span class="ua">' + info.useragent + '</span>'
            + '</div>');

        const self = this;
        const selectedClass = "selected";
        $client.on('click', function(e) {
            if (self.$selected) {
                self.$selected.removeClass(selectedClass);
            }
            self.$selected = $(this);
            self.$selected.addClass(selectedClass);
        });

        this.$clients.append($client);
    }

    removeClient(socketid: string) {
        var $client = $('#' + socketid);
        $client.remove();
        //this.$clients.remove($client);
    }

    send() {
        var $message = $("#message");
        this.socket.emit("message", { message: $message.text() });
        $message.empty();
    }

    startSensor() {
        var $rotation = $("#rotation");
        window.addEventListener("deviceorientation", (e) => {
            $rotation.text(String() + e.alpha);
        });

        var $motion = $("#motion");
        window.addEventListener("devicemotion", (e) => {
            $motion.text(String() + e.acceleration.x
                + ", " + e.acceleration.y
                + ", " + e.acceleration.z
            );
        });
    }
}
var client = new Client();

$(() => {

    client.setup($('#messages'), $('#clients'));
    client.connect();
    client.startSensor();

});

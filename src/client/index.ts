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
const formatDate = function(date: Date, format: string) {
    if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
    format = format.replace(/YYYY/g, date.getFullYear().toString());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    if (format.match(/S/g)) {
        const milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
        const length = format.match(/S/g).length;
        for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
    }
    return format;
};

class Client {
    socket: SocketIO.Socket;

    $clients: JQuery;
    selectedSocketid: string;
    client_map: { [socketid: string]: SocketIOHub.ClientInfo } = {};

    $detail: JQuery;
    $detailPre: JQuery;

    $messages: JQuery;
    $messageItems: JQuery;

    constructor() {
    }

    setup($clients: JQuery, $detail: JQuery, $messages: JQuery) {
        this.$clients = $clients;

        this.$detail = $detail;
        this.$detailPre = $('<pre></pre>');
        this.$detail.append(this.$detailPre);

        this.$messages = $messages;
        this.$messageItems = $('<div class="items"></div>');
        this.$messages.append(this.$messageItems);
    }

    clear() {
        this.client_map = {};
        this.$clients.empty();
        this.$messageItems.empty();
    }

    connect() {
        this.socket = io.connect();

        this.socket.on("connect", () => {

            const clientInfo: SocketIOHub.ClientInfo = {
                socketid: this.socket.id,
                useragent: window.navigator.userAgent,
            };

            //this.log('self: ' + JSON.stringify(clientInfo, null, 2));
            this.addClient(clientInfo, true);
            this.socket.emit('client-info', clientInfo);
        });

        this.socket.on("disconnect", () => this.clear());

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

        this.socket.on("client-update", (update: SocketIOHub.ClientUpdate) => {
            var client = this.client_map[update.socketid];
            for (var key in update) {
                if (key === 'socketid') continue;
                (<any>client)[key] = (<any>update)[key];
            }

            if (update.socketid === this.selectedSocketid) {
                this.updateDetail();
            }
        });
    }

    log(message: any) {
        this.$messageItems.append('<div class="log log-info">'
            + '<span class="date">' + formatDate(new Date(), "YYYY-MM-DD hh:mm:ss") + '</span>'
            + '<span class="msg">' + message + '</span>'
            + '</div>');
        this.$messages.animate({ scrollTop: this.$messageItems.height() - this.$messages.height() }, 'fast');
    }

    addClient(info: SocketIOHub.ClientInfo, isSelf?: boolean) {

        let clientClass = "client";
        if (isSelf) {
            clientClass = "client self";
        }

        const $client = $('<div class="' + clientClass + '" id="' + info.socketid + '">'
            + '<span class="socketid">' + info.socketid + '</span>'
            + '<span class="ipaddr">' + info.ipaddr + '</span>'
            + '<span class="ua">' + info.useragent + '</span>'
            + '</div>');

        const self = this;
        $client.on('click', function(e) {
            self.setSelected($(this));
        });

        this.client_map[info.socketid] = info;
        this.$clients.append($client);
    }

    setSelected(clientElement: JQuery) {
        const selectedClass = "selected";
        if (this.selectedSocketid) {
            $('#' + this.selectedSocketid).removeClass(selectedClass);
        }
        clientElement.addClass(selectedClass);

        this.selectedSocketid = clientElement[0].id;
        this.updateDetail();
    }

    updateDetail() {
        var info = this.client_map[this.selectedSocketid];
        if (info) {
            this.$detailPre.html(JSON.stringify(info, null, 2));
        }
        else {
            this.$detailPre.empty();
        }
    }

    removeClient(socketid: string) {
        const $client = $('#' + socketid);
        $client.remove();
        delete this.client_map[socketid];
    }

    send() {
        const $message = $("#message");
        this.socket.emit("message", { message: $message.text() });
        $message.empty();
    }

    startSensor() {

        window.addEventListener("deviceorientation", (e) => {

            var update: SocketIOHub.ClientUpdate = {
                socketid: this.socket.id,
                deviceorientation: {
                    x: e.alpha,
                    y: e.beta,
                    z: e.gamma
                }
            };
            this.socket.emit('client-update', update);
        });

        const $motion = $("#motion");
        window.addEventListener("devicemotion", (e) => {
            $motion.text(String() + e.acceleration.x
                + ", " + e.acceleration.y
                + ", " + e.acceleration.z
            );
        });
    }
}
const client = new Client();

$(() => {
    client.setup($('#clients'), $('#detail'), $('#messages'));
    client.connect();
    client.startSensor();
});

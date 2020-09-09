"use strict";
exports.__esModule = true;
var socket_io_1 = require("socket.io");
var http_1 = require("http");
console.log(http_1["default"]);
var server = http_1["default"].createServer();
var io = socket_io_1["default"](server, {
    path: '/test',
    serveClient: false,
    // below are engine.IO options
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});
server.listen(3000);

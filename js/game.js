
var mainConnection;
function bindEvents(connection, isMainConnection, initialDataToSend) {
    if (!isMainConnection) {
        window.rootVM.connectedPeers.push(connection);
    }

    connection.on('open', function (id) {
        if (isMainConnection) { // setup server
            //gameFN = setInterval(gameEngine.runGame, 50);
        }
        else { // Send handshake from client to server
            connection.send(initialDataToSend);
        }
    });
    connection.on('close', function (peer) {
        if (connection.metadata) {
            GlobalFunctions.onDisconnect({ nickName: connection.metadata.nickName });
        }
        if (window.rootVM.connectedPeers().length > 0) {
            window.game.emit("playerLeft", undefined, {
                peer: connection.peer
            });

            window.rootVM.connectedPeers.remove(function (p) {
                return p.peer === connection.peer;
            });
        }
    });
    connection.on('data', function (data) {
        // Add data.peer to every response so we know who it came from
        data.peer = connection.peer;
        gameEngine.dataReceived(data);
    });
    connection.on('error', function (err) {
        console.log(err);
    });



    connection.on('connection', function (conn) {
        GlobalFunctions.onConnect({ nickName: "users name" });

        window.rootVM.connectedPeers.push(conn);

        // When opening a connection to a new client
        conn.on('open', function () {
            // send a response handshake to the client
            // send all the connections so the client can connect with them
            conn.send({
                metadata: {
                    type: 'peerTransfer',
                    nickName: window.rootVM.me.nickName(),
                    skin: window.rootVM.me.skin(),
                    connectedPeers: window.rootVM.connectedPeers().map(function (x) {
                        return x.peer;
                    })
                }
            });
        });
        conn.on('close', function (peer) {
            if (connection.metadata) {
                GlobalFunctions.onDisconnect({ nickName: connection.metadata.nickName });
            }
            if (window.rootVM.connectedPeers().length > 0) {
                window.game.emit("playerLeft", undefined, {
                    peer: connection.peer
                });

                window.rootVM.connectedPeers.remove(function (p) {
                    return p.peer === connection.peer;
                });
            }
        });

        // Data received from client. Yes we need both
        conn.on('data', function (data) {
            // Add data.peer to every response so we know who it came from
            data.peer = conn.peer;
            gameEngine.dataReceived(data);
        });

        conn.on('error', function (err) {
            console.log(err);
        });
    });
}

var gameEngine = {
    listenForConnections: function (gameRoomName) {
        // list for connections on gameRoomName
        mainConnection = new Peer(gameRoomName, { key: window.peerJSApiKey });

        bindEvents(mainConnection, true, {
            metadata: {
                type: 'handshake',
                nickName: window.rootVM.me.nickName(),
                skin: window.rootVM.me.skin()
            }
        });

        // Make sure things clean up properly
        window.onunload = window.onbeforeunload = function (e) {
            // disconnect from other players
            mainConnection.disconnect();

            if (!!mainConnection && !mainConnection.destroyed) {
                mainConnection.destroy();
            }
        };
    },
    connectToPlayer: function (peerID) {
        // verify we haven't already connected to this client
        var checkForAlreadyConnected = window.rootVM.connectedPeers().find(function (x) {
            return x.peer === peerID;
        })

        if (checkForAlreadyConnected || mainConnection.id === peerID) { // or its ourselves
            console.log("Attempted to establish a connection to a player who is already connected.");
            return;
        }

        // Start a connection, send the players name
        var newPeer = mainConnection.connect(peerID, {
            metadata: {
                nickName: window.rootVM.me.nickName(),
                skin: window.rootVM.me.skin()
            }
        });

        bindEvents(newPeer, false, {
            metadata: {
                type: 'handshake',
                nickName: window.rootVM.me.nickName(),
                skin: window.rootVM.me.skin()
            }
        });

    },
    broadcast: function (object) {
        // Goes through each active peer and calls FN on its connections.
        if (window.rootVM.connectedPeers().length > 0) {
            window.rootVM.connectedPeers().forEach(function (c) {
                c.send({
                    metadata: object
                });
            });
        }
    },

    broadcastMessage: function (nickName, message) {
        gameEngine.broadcast({
            type: 'chat',
            nickName: nickName,
            message: message
        });
    },

    dataReceived: function (data) {
        if (data.metadata && data.metadata.type) {
            // add peer to metadata
            data.metadata.peer = data.peer;

            switch (data.metadata.type) {
                case "handshake": // share data with the client
                    if (window.enableGame) {
                        window.game.emit("playerJoin", undefined, data.metadata);
                    }
                    break;

                case "peerTransfer": // the server has sent over a list of peers, we need to connect to all of them
                    if (window.enableGame) {
                        window.game.emit("playerJoin", undefined, data.metadata);
                    }

                    // connect to each peer in the game
                    data.metadata.connectedPeers.forEach(function (p) {
                        gameEngine.connectToPlayer(p);
                    });
                    break

                case "updatePlayer": // run changes in-game
                    if (window.enableGame) {
                        window.game.emit("updatePlayer", "playerID", data.metadata);
                    }
                    break;

                case "updateBlock":
                    if (window.enableGame) {
                        window.game.emit("updateBlock", "playerID", data.metadata);
                    }
                    break;

                case "chat": // display message in chatroom
                    GlobalFunctions.onMessageReceived(data.metadata);
                    break;
            }
        }
    }
};

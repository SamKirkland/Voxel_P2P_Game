/*
    Use the API defined in this file to create a chat & game
*/


/**
 * Game Engine Interface
 */
var GlobalFunctions = {
    /**
     * Call this when you're ready to start the game
     */
    startGame: function () {
        window.game.appendTo(document.body);
        var $crossHair = $("<div class='crosshair'>+</div>");
        $crossHair.appendTo(document.body);
    },

    /**
     * Returns a randomly generated room name. Safe to call multiple times. The room name is re-generated on page load.
     */
    getRoomName: function () {
        var randomNames = ["potato", "cheese", "pizza", "hotdog", "chainsaw", "bear", "paper", "turtle", "bunny", "panda"];

        if (window.cachedRoomName) {
            return window.cachedRoomName;
        }

        window.cachedRoomName = randomNames[Math.floor(Math.random() * randomNames.length)]
            + (Math.round(Math.random() * 100) + 1);

        return window.cachedRoomName;
    },

    /**
     * Call to start listening for other connections from other players.
     * @param {string} gameRoomName The other players gameRoomName
     */
    listenForConnections: function (gameRoomName) {
        gameEngine.listenForConnections(gameRoomName);
    },

    /**
     * Call this method to connect to another player
     * @param {string} peerName The other players game room name
     */
    connectToPlayer: function (peerName) {
        gameEngine.connectToPlayer(peerName);
    },

    /**
     * Call this method when you want to send a chat message. listenForConnections needs to be called before this.
     * @param {string} type the type of message to send 
     */
    sendMessage: function (nickName, message) {
        gameEngine.broadcastMessage(nickName, message);
    },

    /**
     * OverRide this function with your own. It will be run when you receive a chat message
     */
    onMessageReceived: function (data) {
        console.log("message received: " + data);
    },

    /**
     * OverRide this function with your own. It will be run when you connect to another player
     */
    onConnect: function (data) {
        console.log("user connected: " + data);
    },

    /**
     * OverRide this function with your own. It will be run when you disconnect from another player
     */
    onDisconnect: function (data) {
        console.log("user disconnected: " + data);
    }
};
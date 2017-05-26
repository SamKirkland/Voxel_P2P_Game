ko.bindingHandlers.enterkey = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var callback = valueAccessor();
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                callback.call(viewModel);
                return false;
            }
            return true;
        });
    }
};

$(document).ready(function(){
	
	var page = function() {
		var root = this;
		
		root.me = {
			id: ko.observable(),
			nickName: ko.observable()
		};
		root.gameStarted = ko.observable(false);
		root.connectedPeers = ko.observableArray();
		
		root.messages = ko.observableArray();
		root.messages.subscribe(function(newArray){
			// only keep the first 10 messages
			if (newArray.length > 10) {
				root.messages().shift();
			}
		});
		root.scollMessages = function(){
			// scroll the messages to the bottom
			var $Messages = $(".bt-chat--messages")[0];
			$Messages.scrollTop = $Messages.scrollHeight;
		}
		
		root.messageDraft = ko.observable("");
		root.sendMessage = function() {
			// StrechGoal: Throttle how many messages the user can send per minute
			// send the message when the user hits the return key
			var msg = new message({
				nickName: root.me.nickName(),
				message: root.messageDraft()
			});
			broadcastMessage(msg)
			root.messages.push(msg);
			
			
			// clear out message draft for the next message
			root.messageDraft("");
		}
		
		// Goes through each active peer and calls FN on its connections.
		function broadcast(object) {
			root.connectedPeers().forEach(function(c){
				c.send(object);
			});
		}
		
		function peerError(err) {
			console.log(err);
		}
		
		
		function broadcastMessage(msg) {
			if (!(msg instanceof message)) {
				throw "You must pass a message type";
			}
			
			broadcast({
				metadata: {
					type: 'chat',
					nickName: msg.nickName,
					message: msg.message
				}
			});
		}
		
		
		var mainConnection = new Peer({key: window.peerJSApiKey});
		
		mainConnection.on('open', function(id){
			// connection opened
			root.me.id(id);
			
			root.gameStarted(true);
			var game = setInterval(runGame, 1000);
			
			// Receive messages
			mainConnection.on('data', function(data) {
				console.log('Received', data);
			});
		});
		
		mainConnection.on('connection', function(conn){
			// connection from other peer
			console.log("Incoming connection received");
			root.connectedPeers.push(conn);
			
			conn.on('data', function(data){
				if (data.metadata && data.metadata.type) {
					switch (data.metadata.type) {
						case "handshake": // share data with the client
							console.log("HANDSHAKE data received: ", data.metadata);
							break;
							
						case "change": // run changes in-game
							console.log("CHANGE data received: ", data.metadata.changes);
							break;
						
						case "chat": // display message in chatroom
							console.log("CHAT data received: ", data.metadata.message);
							root.messages.push(new message(data.metadata));
							
							break;
						
						default:
							console.log("unknown data received", data);
					}
					
				}
				else {
					console.log("OTHER data received: ", data);
				}
			});
			
			// Errors connecting
			conn.on('error', function(err){
				console.log(err);
			});
		});
		
		
		// runs every second
		function runGame() {
			if (root.connectedPeers().length > 0) {
				broadcast({
					metadata: {
						type: 'position',
						stamp: new Date().getTime(),
						position: {
							x: Math.floor(Math.random() * 1000),
							y: Math.floor(Math.random() * 1000),
							z: Math.floor(Math.random() * 1000)
						},
						rotation: {
							pitch: Math.floor(Math.random() * 114),
							yaw: Math.floor(Math.random() * 114)
						}
					}
				});
			}
		}
		
		
		$("#joinGame").on('click', function(){
			var gameRoomID = $("#roomID").val().trim();
			
			// verify we haven't already connected to this client
			var checkForAlreadyConnected = root.connectedPeers().find(function(x){
				return x.peer === gameRoomID;
			})
			
			if (checkForAlreadyConnected) {
				alert("You're already connected");
				return;
			}
			
			// Start a connection, send the players name
			var conn = mainConnection.connect(gameRoomID, {
					metadata: {
						type: 'handshake',
						nickName: root.me.nickName()
					}
				});
			
			conn.on('open', function(id){
				root.connectedPeers.push(conn);
				conn.send({
					metadata: {
						type: 'handshake',
						nickName: root.me.nickName()
					}
				});
			});
			conn.on('data', function(data) {
				console.log("Data Received!", data);
			});
			
			conn.on('close', function(data) {
				debugger;
				root.messages.push(new message({
					type: "bt-chat--loggedOut",
					nickName: conn.metadata.nickName,
					message: "Logged out"
				}));
				delete root.connectedPeers.remove(conn);
			});
			
			conn.on('error', function(err) {
				peerError(err);
			});
		});
		
		// Make sure things clean up properly
		window.onunload = window.onbeforeunload = function(e) {
			if (!!mainConnection && !mainConnection.destroyed) {
				mainConnection.destroy();
			}
		};
		
		
		return root;
	};
	
	var message = function(msg) {
		var self = this;
		
		self.type = msg.type || "";
		self.nickName = msg.nickName;
		self.message = msg.message;
		
		return self;
	};
	
	ko.applyBindings(new page());
});
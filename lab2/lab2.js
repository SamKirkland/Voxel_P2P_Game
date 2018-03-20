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

var messageVM = function(nickName, message, type) {
	this.nickName = nickName;
	this.message = message;
	this.type = type || "normal";
	
	return this;
}

ko.components.register('game-chat', {
	viewModel: function(params) {
		var self = this;
		
		self.nickName = params.nickName;
		
		self.messageDraft = ko.observable("");
		
		self.messages = ko.observableArray();
		self.messages.subscribe(function(newArray){
			// only keep the first 10 messages
			if (newArray.length > 10) {
				self.messages().shift();
			}
		});
		self.scrollMessages = function() {
			var $Messages = $(".game-chat--messages")[0];
			$Messages.scrollTop = $Messages.scrollHeight;
		}
		
		GlobalFunctions.onMessageReceived = function(data){
			self.messages.push(new messageVM(data.nickName, data.message));
		};
		GlobalFunctions.onConnect = function(data){
			self.messages.push(new messageVM(data.nickName, "logged in", "game-chat--loggedIn"));
		};
		GlobalFunctions.onDisconnect = function(data){
			self.messages.push(new messageVM(data.nickName, "logged out", "game-chat--loggedOut"));
		};
		
		self.sendMessage = function(){
			var msg = new messageVM(params.nickName, self.messageDraft());
			
			// add to messages
			self.messages.push(msg);
			
			// send
			GlobalFunctions.sendMessage(ko.unwrap(msg.nickName), msg.message);
			
			// clear out draft
			self.messageDraft("");
		}
	},
	template: `
		<div class="game-chat--messages" data-bind="foreach: { data: messages, afterAdd: scrollMessages }">
			<div class="game-chat--message" data-bind="css: type">
				<span class="game-chat--message-nickName" data-bind="text: nickName"></span>: 
				<span data-bind="text: message"></span>
			</div>
		</div>
		<input class="form-control game-chat--message-box" type="text" placeholder="Type to chat" data-bind="textinput: messageDraft, enterkey: sendMessage" />
	`
});


var css = `
	game-chat {
		display: block;
		
		position: fixed;
		padding: 5px;
		bottom: 5px;
		left: 25px;
		width: 500px;
		
		z-index: 10;
	}
	.game-chat--messages {
		min-height: 25px;
		max-height: 150px;
		overflow: hidden;
	}
		.game-chat--message {
			background: #3B3D46;
			line-height: 25px;
			margin-bottom: 1px;
			padding: 5px 10px;
			word-break: break-all;
		}
			.game-chat--message-nickName {
				font-weight: bold;
			}
		.game-chat--loggedIn {
			color: #0f83c9;
		}
		.game-chat--loggedOut {
			color: #db524b;
		}
		
	.game-chat--message-box {
		border-radius: 0;
		margin-top: 2px;
	}
`;
$(`<style>${css}</style>`).appendTo("head"); // add css to page

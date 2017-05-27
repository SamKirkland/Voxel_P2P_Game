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
	
	var messageVM = function(nickName, message, type) {
		this.nickName = nickName;
		this.message = message;
		this.type = type || "normal";
		
		return this;
	}
	
	ko.components.register('game-chat', {
		viewModel: function(params) {
			this.chatOverflow = params.chatOverflow || "";
			this.bannedWords = params.bannedWords || [];
			
			this.messageDraft = ko.observable("");
			
			this.messages = ko.observableArray();
			this.scrollMessages = function() {
				
			}
			
			this.sendMessage = function(){
				// add to messages
				this.messages.push(new messageVM(params.nickName, this.messageDraft()));
				
				// clear out draft
				this.messageDraft("");
			}
		},
		template: `
			<div class="bt-chat">
				<div class="bt-chat--messages" data-bind="foreach: { data: messages, afterAdd: scrollMessages }">
					<div class="bt-chat--message" data-bind="css: type">
						<span class="bt-chat--message-nickName" data-bind="text: nickName"></span>: 
						<span data-bind="text: message"></span>
					</div>
				</div>
				<input class="form-control bt-chat--message-box" type="text" data-bind="textinput: messageDraft, enterkey: sendMessage" />
			</div>
			`
	});
	
	
	ko.applyBindings({});

	
	
	var css = `
		.bt-chat {
			background: #222;
			position: fixed;
			padding: 5px;
			bottom: 5px;
			left: 25px;
			width: 500px;
			border: 1px solid #555;
			
			z-index: 10;
		}
		.bt-chat--messages {
			min-height: 25px;
			max-height: 150px;
			overflow: hidden;
		}
			.bt-chat--message {
				height: 25px;
				line-height: 25px;
				border-bottom: 1px solid #555;
			}
			.bt-chat--message:last-of-type {
				border-bottom: 0;
			}
				.bt-chat--message-nickName {
					font-weight: bold;
				}
			.bt-chat--loggedOut {
				color: #c62323;
			}
			
		.bt-chat--message-box {
			background: #5d5d5d;
			color: #ccc;
			border-radius: 0;
			border-color: #000;
		}
		.bt-chat--message-box:focus {
			background: #6e6e6e;
			
			border-color: inherit;
			-webkit-box-shadow: none;
			box-shadow: none;
		}
	`;
	$(`<style>{css}</style>`).appendTo("head"); // add css to page
	
});
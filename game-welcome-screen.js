var skinVM = function(name, src, preview, selected) {
	this.name = name;
	this.src = src;
	this.preview = "skins/" + preview;
	this.isSelected = ko.observable(false || selected);
	
	return this;
}

ko.components.register('game-welcome-screen', {
	viewModel: function(params) {
        var self = this;

		self.nickName = params.nickName;
        self.gameRoomName = params.gameRoomName;
        self.skin = params.skin;

        self.gameHasBeenStarted = ko.observable(false);
		self.screen = ko.observable("mainScreen");
		self.roomToJoin = ko.observable("");
        self.skin("./skins/steve.png");
		
		self.changeToScreen = function(newScreen) {
			self.screen(newScreen);
		}
		
		self.skins = ko.observableArray([
            new skinVM("Steve", "./skins/steve.png", "steve-preview.png", true),
            new skinVM("Alex", "./skins/alex.png", "alex-preview.png"),
            new skinVM("Turtle", "./skins/turtle.png", "turtle-preview.png"),
            new skinVM("Dad", "./skins/dad.png", "dad-preview.png"),
            new skinVM("Construction", "./skins/construction.png", "construction-preview.png")
        ]);
		self.selectSkin = function(a){
			self.skins().forEach(function(s){
				if (s.isSelected()) { // unselect already selected items
					s.isSelected(false);
				}
				
				if (s.name === a.name) { // select already selected items
                    s.isSelected(true);
                    self.skin(s.src);
				}
			});
		}
		self.joinGame = function(){
            GlobalFunctions.connectToPlayer(self.roomToJoin());
            self.startGame();
		}

        self.startGame = function () {
            GlobalFunctions.startGame();
            self.gameHasBeenStarted(true);
        }
		
		GlobalFunctions.listenForConnections(self.gameRoomName);
		
		return self;
	},
    template: `
        <div class="game-started-screen panel" data-bind="visible: gameHasBeenStarted()">
            Game Room Name: <b data-bind="text: gameRoomName"></b>
        </div>
        <div class="game-welcome-screen" data-bind="visible: !gameHasBeenStarted()">
		    <div class="panel" data-bind="visible: screen() === 'mainScreen'">
			    <h1>Welcome</h1>
			
			    <div class="form-group">
				    <label for="nickName">Your Nickname</label>
				    <input class="form-control" data-bind="textInput: nickName" type="text" placeholder="Name" />
			    </div>
			
			
			    <div class="form-group">
				    <label>Pick Skin</label>
				    <div class="btn-group btn-group-justified btn-group-lg" data-bind="foreach: skins">
					    <div class="btn btn-default" data-bind="css: { active: isSelected }, click: $component.selectSkin">
						    <img data-bind="attr: { src: preview }"
							    style="width: 50px;height: 50px;" />
					    </div>
				    </div>
			    </div>
			
			    <br>
			    <div class="clearfix"></div>
			
			    <button class="btn btn-default pull-left" data-bind="click: function(){changeToScreen('joinScreen')}">
				    Join Game
			    </button>
			    <button class="btn btn-default pull-right" data-bind="click: function(){changeToScreen('hostScreen')}">
				    Host Game
			    </button>
			
			    <div class="clearfix"></div>
		    </div>
		    <div class="panel" data-bind="visible: screen() === 'hostScreen'">
			    <h1>Host Game</h1>
			
			    <div class="form-group">
				    <label for="roomID">Game Room Name</label>
				    <br>
				    <h1 class="text-center" style="border:0;margin:15px;" data-bind="text: gameRoomName"></h1>
			    </div>
			
			    <br>
			    Give your room name to other players so they can join you.
			    <br><br><br>
			
			    <button class="btn btn-default pull-left" data-bind="click: function(){changeToScreen('mainScreen')}">
				    Back
			    </button>
			    <button class="btn btn-default pull-right" data-bind="click: startGame">
				    Start Game
			    </button>
			    <div class="clearfix"></div>
			    <span class="pull-right">(people can still join mid-game)</span>
			
			    <div class="clearfix"></div>
		    </div>
		    <div class="panel" data-bind="visible: screen() === 'joinScreen'">
			    <h1>Join Game</h1>
			
			    <div class="form-group">
				    <label for="roomID">Game Room Name</label>
				    <input class="form-control" data-bind="textInput: roomToJoin" type="text" placeholder="Ask your friend for their room name" />
			    </div>
			
			    <br>
			
			    <button class="btn btn-default pull-left" data-bind="click: function(){changeToScreen('mainScreen')}">
				    Back
			    </button>
			    <button class="btn btn-default pull-right" data-bind="click: joinGame">
				    Join Game
			    </button>
			    <div class="clearfix"></div>
		    </div>
        </div>
	`
});


var css = `
	.game-welcome-screen {
		position: fixed;
		
		top: 15%;
		right: 25%;
		bottom: 15%;
		left: 25%;
		
		z-index: 50;
	}
    .game-started-screen {
        position: fixed;
        
        top: 0;
        left: 0;
        
        border-radius: 0 0 4px 0;
        padding: 5px 10px;

        z-index: 50;
    }
`;
$(`<style>${css}</style>`).appendTo("head"); // add css to page
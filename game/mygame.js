

$(document).ready(function(){
	var createGame = require('voxel-hello-world');
	var game = createGame();

	var createDummy = require('voxel-dummy-player')(game);
	var dummy1 = createDummy('skin1.png');
	dummy1.yaw.position.set(0,2,-2);
	setInterval(function(){
		dummy1.jump(1.3);
	}, 2500);

	
	
	var createPlayer = require('voxel-player')(game);
	var player = createPlayer('skin1.png');
	player.position.set(0,2,0);
	player.possess();
});
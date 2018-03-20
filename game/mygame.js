var createGame = require('voxel-engine');
var highlight = require('voxel-highlight');
var player = require('voxel-player');
var dummyPlayer = require('voxel-dummy-player');
var voxel = require('voxel');
var extend = require('extend');
var fly = require('voxel-fly');
var walk = require('voxel-walk');

var extend = require('extend');


function startGame(opts) {
    var defaultSettings = {
        generate: voxel.generator['Valley'],

        texturePath: './textures/',
        materials: ['grass', 'brick', 'dirt'],
        materialFlatColor: false,

        fogDisabled: true,

        chunkDistance: 2,
        worldOrigin: [0, 0, 0],
        controls: {
            discreteFire: true,
            jumpMaxSpeed: 0.008,
            speed: 0.0004,
            walkMaxSpeed: 0.0008,
            runMaxSpeed: 0.0016
        }
    };
    // opts = extend({}, defaults, opts || {})

    var game = createGame(defaultSettings);
    if (game.notCapable()) {
        return game;
    }

    var createPlayer = player(game);
    var createDummyPlayer = dummyPlayer(game);

    var players = [];


    // create the player from a minecraft skin fille and use as the main character
    var mainPlayer = createPlayer('./skins/steve.png');
    mainPlayer.position.set(0, 2, 0);
    mainPlayer.possess();

    game.on('playerJoin', function (target, state) {
        var playerSkin = './skins/steve.png'; // default skin
        if (typeof state.skin !== "undefined") {
            playerSkin = state.skin;
        }
        
        var newPlayer = createDummyPlayer(playerSkin);
        newPlayer.position.set(0, 2, 0);

        // set player info
        newPlayer.peer = state.peer;
        newPlayer.nickName = state.nickName;

        players.push(newPlayer);

        // for some reason updating a dummy player changes the keybindings to affect that player
        game.control(mainPlayer);
    });

    function getPlayer(peer) {
        return players.find(function (p) {
            return p.peer === peer;
        });
    }

    function deletePlayer(peer) {
        // ToDo: fix - not sure how to delete the player so lets move them off screen
        getPlayer(peer).moveTo(-100, -100, -200);

        players.splice(players.findIndex(function (x) {
            return x.peer === peer;
        }), 1);
    }

    game.on('playerLeft', function (target, state) {
        deletePlayer(state.peer);
    });

    game.on('updatePlayer', function (target, state) {
        var newPosition = state.position;
        var newRotation = state.rotation;

        var playerToUpdate = getPlayer(state.peer);

        playerToUpdate.moveTo(parseFloat(newPosition.x), parseFloat(newPosition.y), parseFloat(newPosition.z));
        playerToUpdate.rotateHeadTo(parseFloat(state.pitch), 0, 0);
        playerToUpdate.rotateTo(parseFloat(newRotation.x), parseFloat(newRotation.y), parseFloat(newRotation.z));

        // for some reason updating a dummy player changes the keybindings to affect that player
        game.control(mainPlayer);
    });

    game.on('updateBlock', function (target, state) {
        var targetBlock = game.getBlock(state.position);

        if (targetBlock === 0) { // the block doesn't exist, create it
            game.createBlock(state.position, state.material);
        }
        else { // delete the block
            game.setBlock(state.position, state.material);
        }
    });

    var target = game.controls.target();

    // highlight blocks when you look at them, hold <Ctrl> for block placement
    var blockPosPlace, blockPosErase;
    var shouldAddBlock = true;
    var hl = game.highlighter = highlight(game, {
        // color: 0xff0000,
        adjacentActive: function () {
            return shouldAddBlock;
        },
        selectActive: function () {
            return !shouldAddBlock;
        }
    })
    hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos })
    hl.on('remove', function (voxelPos) { blockPosErase = null })
    hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
    hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })
    
    $('body').mousedown(function (event) {
        switch (event.which) {
            case 1: // Left mouse pressed
                shouldAddBlock = true;
                break;

            case 2: // middle mouse pressed
                break;

            case 3: // right mouse pressed
                shouldAddBlock = false;
                break;
        }
    });

    // block interaction stuff, uses highlight data
    var currentMaterial = 1;

    game.on('fire', function (target, state) {
        if (shouldAddBlock) {
            var position = blockPosPlace;
            var blockMaterial = game.getBlock(position);

            if (blockMaterial === 0) {
                game.createBlock(position, currentMaterial);
                gameEngine.broadcast({
                    type: "updateBlock",
                    position: position,
                    material: currentMaterial
                });
            }

        }
        else {
            var position = blockPosErase;
            var blockMaterial = game.getBlock(position);
            if (position) {

                if (blockMaterial !== 0) {
                    game.setBlock(position, 0);
                    gameEngine.broadcast({
                        type: "updateBlock",
                        position: position,
                        material: 0
                    });
                }

            }
        }
    })

    game.on('tick', function () {
        if (target.playerSkin) { // its a normal player
            walk.render(target.playerSkin);
        }
        else if (target.dummySkin) { // its a dummy player
            walk.render(target.dummySkin);
        }

        var vx = Math.abs(target.velocity.x);
        var vz = Math.abs(target.velocity.z);
        if (vx > 0.001 || vz > 0.001) {
            walk.stopWalking()
        }
        else {
            walk.startWalking();
        }
    })

    // ToDo: Throttle this
    game.controls.on('data', function (state) {
        var interacting = false;
        Object.keys(state).map(function (control) {
            if (state[control] > 0) {
                interacting = true;
            }
        })
        if (interacting) {
            gameEngine.broadcast({
                type: "updatePlayer",
                position: {
                    x: mainPlayer.position.x.toFixed(4),
                    y: mainPlayer.position.y.toFixed(4),
                    z: mainPlayer.position.z.toFixed(4)
                },
                rotation: {
                    x: mainPlayer.rotation.x.toFixed(4),
                    y: mainPlayer.rotation.y.toFixed(4),
                    z: mainPlayer.rotation.z.toFixed(4),
                },
                pitch: mainPlayer.pitch.rotation.x.toFixed(4)
            });
        }
    });

    return game;
}

$(document).ready(function(){
	window.game = startGame();
});
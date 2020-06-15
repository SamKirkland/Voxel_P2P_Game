import React from 'react';
//var voxel = require('voxel');

import { generator, meshers } from "voxel";
import Game, { GameOptions } from "voxel-engine";
import * as dat from 'dat.gui';
import { PlayerSkin } from "./skin.type";

import voxelPlayer from "voxel-player";
import voxelDummyPlayer, { Dummy } from "voxel-dummy-player";
import { INetworkHandler, IPlayerSettings } from "./handlers/Network";
import { convertCoordinateObject, convertCoordinate } from "./utils";
import { Peer2PeerHandler } from "./handlers/Peer2PeerHandler";

//var createGame = require('voxel-engine');
var highlight = require('voxel-highlight');
//var player = require('voxel-player');
//var extend = require('extend');
//var fly = require('voxel-fly');
var walk = require('voxel-walk');
var createReach = require('voxel-reach');
//var createMine = require('voxel-mine');

interface IPeer {

}

interface IGameScreenProps {
    networkHandler: INetworkHandler;

    /** The room name to connect to. undefined to host a game */
    gameRoom: string | undefined;
}

export const availableSkins = {
    steve: new PlayerSkin("Steve", "/skins/steve.png", "/skins/steve-preview.png"),
    alex: new PlayerSkin("Alex", "/skins/alex.png", "/skins/alex-preview.png"),
    turtle: new PlayerSkin("Turtle", "/skins/turtle.png", "/skins/turtle-preview.png"),
    dad: new PlayerSkin("Dad", "/skins/dad.png", "/skins/dad-preview.png"),
    construction: new PlayerSkin("Construction", "/skins/construction.png", "/skins/construction-preview.png")
};

/**
 * keyType generic defaults to string, this should be the data type that is used to determine users apart
 */
export interface IConnectedPlayer<keyType = string> {
    key: keyType;
    name: string;
    avatar: Dummy;
}

export default class GameScreen extends React.PureComponent<IGameScreenProps> {
    static defaultProps = {
        networkHandler: new Peer2PeerHandler() //new LoggingNetworkHandler()
    };

    gameInstance: any | undefined;

    private gameElement = React.createRef<HTMLDivElement>();

    componentDidMount = () => {
        setTimeout(() => {
            // todo fix: hack, we need ref but that doesn't exist until after first render
            this.gameInstance = startGame({
                skin: "/skins/steve.png",
                name: this.props.gameRoom!,
                key: this.props.gameRoom!
            }, this.props.gameRoom, this.props.networkHandler);
            this.gameInstance.appendTo(this.gameElement.current);
        });
    }

    render() {
        return <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0 }} ref={this.gameElement} />;
    }
}


function startGame(player: IPlayerSettings, gameRoom: string | undefined, networkHandler: INetworkHandler) {
    const defaultSettings: GameOptions = {
        generate: generator['Hilly Terrain'],

        mesher: meshers.greedy,
        meshType: "surfaceMesh",

        texturePath: './textures/',
        materials: ['grass', 'brick', 'dirt'],
        materialFlatColor: false,

        fogDisabled: false,

        chunkSize: 16,
        chunkDistance: 3,
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

    var game = Game(defaultSettings);
    if (game.notCapable()) {
        return game;
    }

    const Player = voxelPlayer(game);
    const Dummy = voxelDummyPlayer(game);

    const allPlayers: { [key: string]: IConnectedPlayer } = {};

    networkHandler.initialize(player.name, {
        onPlayerJoin(player) {
            // verify we haven't already connected to this client
            if (allPlayers[player.key]) {
                console.warn("Already connected to client", allPlayers[player.key]);
            }
    
            networkHandler.playerConnect({
                skin: player.skin,
                name: player.name,
                key: player.key
            });
    
            // add player to connection list, create a avatar for the player
            const newPlayer: IConnectedPlayer = {
                name: player.name,
                key: player.key,
                avatar: new Dummy(player.skin ?? availableSkins.steve.src)
            };
    
            // set that avatar to the spawn point
            newPlayer.avatar.position.set(0, 2, 0);
    
            allPlayers[newPlayer.key] = newPlayer;
    
            // for some reason updating a dummy player changes the keybindings to affect that player
            game.control(mainPlayer);
        },
        onPlayerLeft(player) {
            networkHandler.playerDisconnect({
                skin: player.skin,
                name: player.name,
                key: player.key
            });
    
            deletePlayer(player.key);
        },
        onUpdatePlayer(player, newPosition, newRotation, newVelocity, pitch) {
            const playerToUpdate = allPlayers[player.key].avatar;
    
            // todo animate and tween this movement using newVelocity
            playerToUpdate.moveTo(convertCoordinate(newPosition));
            playerToUpdate.rotateHeadTo(pitch, 0, 0);
            playerToUpdate.rotateTo(convertCoordinate(newRotation));
    
            // for some reason updating a dummy player changes the keybindings to affect that player
            game.control(mainPlayer);
        },
        onUpdatePlayerSettings(player) {
            // const playerToUpdate = allPlayers[player.key].avatar;
            // todo set skin
        },
        onUpdateBlock(position, material) {
            const targetBlock = game.getBlock(position);
    
            // todo, can we just always call setBlock here?
    
            if (targetBlock === 0) { // the block doesn't exist, create it
                game.createBlock(position, material);
            }
            else { // delete the block
                game.setBlock(position, material);
            }
        }
    });


    if (gameRoom) {
        debugger;
        networkHandler.connectToServer(gameRoom, {
            name: "Test name",
            skin: "/skins/steve.png"
        });
    }


    var reach = createReach(game, { reachDistance: 8 });
    /*
    var mine = createMine(game, opts);

    mine.on('break', function (target: any) {
        // do something to this voxel (remove it, etc.)
    });

    reach.on('use', function (target: any) {
        if (target) {
            game.createBlock(target.adjacent, 1);
        }
    });

    reach.on('mining', function (target: any) {
        if (target) {
            game.setBlock(target.voxel, 0);
        }
    });
    */





    // create the player from a minecraft skin fille and use as the main character
    const mainPlayer = new Player(availableSkins.steve.src);
    mainPlayer.position.set(0, 32, 0);
    mainPlayer.possess();


    function deletePlayer(peer: any) {
        // ToDo: fix - not sure how to delete the player so lets move them off screen
        allPlayers[peer].avatar.moveTo(-1000, -1000, -2000);

        delete allPlayers[peer];
    }

    // enable/disable debug mode
    const debuggerAdded = false;
    window.addEventListener('keydown', function (event) {
        if (event.key === "`") { // https://keycode.info/
            if (debuggerAdded) {
                return
            }

            const gui = new dat.GUI();
            
            const avatar = game.controls.target().avatar;
            const position = gui.addFolder("controls.target().avatar");
            position.add(avatar.position, "x");
            position.add(avatar.position, "y");
            position.add(avatar.position, "z");


            class Camera {
                constructor(cameraType: "cameraVector" | "cameraPosition") {
                    this.type = cameraType;
                    this.update();
                }

                type: "cameraVector" | "cameraPosition";
                x!: number;
                y!: number;
                z!: number;

                update() {
                    const newCameraPosition = game[this.type]();

                    this.x = newCameraPosition[0];
                    this.y = newCameraPosition[1];
                    this.z = newCameraPosition[2];
                }
            }

            const cameraPosition = new Camera("cameraPosition");
            const cameraVector = new Camera("cameraVector");

            const cameraPositionFolder = gui.addFolder("game.cameraPosition()");
            cameraPositionFolder.add(cameraPosition, "x");
            cameraPositionFolder.add(cameraPosition, "y");
            cameraPositionFolder.add(cameraPosition, "z");
            
            const cameraVectorFolder = gui.addFolder("game.cameraVector()");
            cameraVectorFolder.add(cameraVector, "x");
            cameraVectorFolder.add(cameraVector, "y");
            cameraVectorFolder.add(cameraVector, "z");

            const chunkInfo = {
                chunksLoaded: Object.keys(game.voxels.chunks).length,
                pendingChunks: game.pendingChunks.length,
                /** not accurate */
                voxels: Object.keys(game.voxels.chunks).length * (game.chunkSize! * game.chunkSize! * game.chunkSize!)
            }

            const chunks = gui.addFolder("chunks");
            chunks.add(chunkInfo, "chunksLoaded");
            chunks.add(chunkInfo, "pendingChunks");
            chunks.add(chunkInfo, "voxels");

            const rendering = gui.addFolder("rendering");
            rendering.add((game as any), 'meshType', ['surfaceMesh', 'wireMesh']).onChange(function(value) {
                (game as any).showAllChunks();
            });

            game.on('tick', function() {
                gui.updateDisplay();
                cameraPosition.update();
                cameraVector.update();
            });
        }
    })

    // highlight blocks when you look at them, hold <Ctrl> for block placement
    
    var blockPosPlace: any, blockPosErase: any;
    var shouldAddBlock = true;
    var hl = game.highlighter = highlight(game, {
        // color: 0xff0000,
        adjacentActive: function () {
            return shouldAddBlock;
        },
        selectActive: function () {
            return !shouldAddBlock;
        }
    });
    
    hl.on('highlight', function (voxelPos: any) { blockPosErase = voxelPos })
    hl.on('remove', function (voxelPos: any) { blockPosErase = null })
    hl.on('highlight-adjacent', function (voxelPos: any) { blockPosPlace = voxelPos })
    hl.on('remove-adjacent', function (voxelPos: any) { blockPosPlace = null })
    

    document.body.onmousedown = function (event: any) {
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
    };

    // block interaction stuff, uses highlight data
    var currentMaterial = 1;

    game.on('fire', function (target: any, state: any) {
        if (shouldAddBlock) {
            let position = blockPosPlace;
            let blockMaterial = game.getBlock(position);

            if (blockMaterial === 0) {
                game.createBlock(position, currentMaterial);
                networkHandler.updateBlock(position, currentMaterial);
                /*
                gameEngine.broadcast({
                    type: "updateBlock",
                    position: position,
                    material: currentMaterial
                });
                */
            }

        }
        else {
            let position: any = blockPosErase;
            let blockMaterial: any = game.getBlock(position);

            if (position) {
                if (blockMaterial !== 0) {
                    game.setBlock(position, 0);
                    networkHandler.updateBlock(position, 0);
                    /*
                    gameEngine.broadcast({
                        type: "updateBlock",
                        position: position,
                        material: 0
                    });
                    */
                }

            }
        }
    })

    game.on('tick', function () {
        var mainPlayerAvatar = game.controls.target();

        walk.render(mainPlayerAvatar.playerSkin);

        var vx = Math.abs(mainPlayerAvatar.velocity.x);
        var vz = Math.abs(mainPlayerAvatar.velocity.z);
        if (vx > 0.001 || vz > 0.001) {
            walk.stopWalking()
        }
        else {
            walk.startWalking();
        }
    });

    // ToDo: Throttle this
    game.controls.on('data', function (state) {
        const isInteracting = Object.keys(state).find((control) => state[control] > 0);

        if (isInteracting) {
            networkHandler.move(convertCoordinateObject(mainPlayer.position), convertCoordinateObject(game.controls.target().velocity), mainPlayer.pitch.rotation.x);
            /*
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
            */
        }
    });

    return game;
}
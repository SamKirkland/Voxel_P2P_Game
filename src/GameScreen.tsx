import React from "react";
//var voxel = require("voxel");

import { PlayerSkin } from "./skin.type";

import { INetworkHandler, IPlayerSettings } from "./handlers/Network";
//var createMine = require("voxel-mine");


import { Mesh } from "@babylonjs/core/Meshes/mesh";
import Engine from "noa-engine";
import { ChunkSize } from "./constants";
import ndarray from "ndarray";
import { decode } from "voxel-crunch";
// import { Material } from "@babylonjs/core/Materials/material";
import { Coordinates } from "voxel-engine";
// import { Player } from "voxel-player";
// import { Vector3 } from "@babylonjs/core/Maths/math.vector";
// import vec3 from "gl-vec3";

/*
import { convertCoordinateObject, convertCoordinate } from "./utils";
import { SocketIOHandler } from "./handlers/SocketIOHandler";
import { generator, meshers } from "voxel";
import Game, { GameOptions } from "voxel-engine";
import * as dat from "dat.gui";
import voxelPlayer from "voxel-player";
import voxelDummyPlayer, { Dummy } from "voxel-dummy-player";
//var createGame = require("voxel-engine");
var highlight = require("voxel-highlight");
//var player = require("voxel-player");
//var extend = require("extend");
//var fly = require("voxel-fly");
var walk = require("voxel-walk");
var createReach = require("voxel-reach");
*/

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
	avatar: any; // Dummy
}

export default class GameScreen extends React.PureComponent<IGameScreenProps> {
	gameInstance: any | undefined;

	private gameElement = React.createRef<HTMLDivElement>();

	componentDidMount = () => {
		setTimeout(() => {
			// todo fix: hack, we need ref but that doesn"t exist until after first render
			this.gameInstance = startGame(this.gameElement.current!, {
				skin: "/skins/steve.png",
				name: this.props.gameRoom!,
				key: this.props.gameRoom!
			}, this.props.gameRoom, this.props.networkHandler);
			//this.gameInstance.appendTo(this.gameElement.current);
		});
	}

	render() {
		return <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0 }} ref={this.gameElement} />;
	}
}


function startGame(element: HTMLDivElement, playerInfo: IPlayerSettings, gameRoom: string | undefined, networkHandler: INetworkHandler) {
	// Engine options object, and engine instantiation:
	var opts = {
		debug: true,
		showFPS: true,
		chunkSize: ChunkSize,
		chunkAddDistance: 5,
		chunkRemoveDistance: 30,

		ambientColor: [1, 1, 1],
		lightDiffuse: [1, 1, 1],
		lightSpecular: [1, 1, 1],
		groundLightColor: [0.5, 0.5, 0.5],
		useAO: true,
		AOmultipliers: [0.93, 0.8, 0.5],
		reverseAOmultiplier: 1.0,
		preserveDrawingBuffer: true,
		gravity: [0, -14, 0],
		bindings: {
			"forward": ["W"],
			"left": ["A"],
			"backward": ["S"],
			"right": ["D"],
			"fire": "<mouse 1>",
			"mid-fire": ["<mouse 2>"],
			"alt-fire": ["<mouse 3>"],
			"jump": "<space>",
			"inventory": ["E", "I"],
			"pause": ["P"],
			"muteMusic": ["O"],
			"thirdprsn": ["M"],
			"cmd": ["<enter>"],
			"chat": ["T"]
		},
		domElement: element
	}
	var noa = new Engine(opts);


	/*
	 *
	 *  Registering voxel types
	 * 
	 *  Two step process. First you register a material, specifying the 
	 *  color/texture/etc. of a given block face, then you register a 
	 *  block, which specifies the materials for a given block type.
	 * 
	*/

	// block materials (just colors for this demo)
	var textureURL = null; // replace that with a filename to specify textures
	var brownish = [0.45, 0.36, 0.22];
	var greenish = [0.1, 0.8, 0.2];
	noa.registry.registerMaterial("dirt", brownish, textureURL);
	noa.registry.registerMaterial("grass", greenish, textureURL);

	// block types and their material names
	noa.registry.registerBlock(1, { material: "dirt" });
	var grassID = noa.registry.registerBlock(2, { material: "grass" });



	// register for world events
	noa.world.on("worldDataNeeded", async function (id: any, data: any, x: any, y: any, z: any) {
		//const chunkData = await networkHandler.loadChunk(id, data, x, y, z);
		networkHandler.loadChunk(id, data, x, y, z);

		// tell noa the chunk"s terrain data is now set
		//noa.world.setChunkData(id, chunkData);
	});

	networkHandler.on("updateBlock", (material, position) => {
		noa.setBlock(material, ...position);
	});

	networkHandler.on("setChunk", (id, x, y, z, data) => {
		const decodedChunk = new Uint16Array(ChunkSize * ChunkSize * ChunkSize);
		const dataAsArray = Object.values(data as any) as number[];
		decode(dataAsArray, decodedChunk);

		const newData = ndarray<Uint32Array>(decodedChunk, [ChunkSize, ChunkSize, ChunkSize]);

		noa.world.setChunkData(id, newData);
	});

	networkHandler.on("userConnected", (userID, position) => {
		console.log("user connected", userID, position);
		const playerID = addPlayer(userID, [0, 0, 0]);
		console.info("playerID", playerID);
	});

	networkHandler.on("userDisconnected", (userID, position) => {
		console.log("user disconnected", userID, position);
		//addPlayer(userID, [0, 0, 0]);
		if (entityList[userID] !== undefined) {
			noa.ents.deleteEntity(entityList[userID]);
			delete entityList[userID];
		}
	});

	networkHandler.on("move", (userID, newPosition, newRotation) => {
		//console.log("move", name, newPosition, newVelocity, pitch);
		if (entityList[userID]) {
			// todo add lerp to new position
			//console.log(userID, entityList[userID], newPosition, newRotation);
			//noa.ents.setPosition(entityList[userID], newPosition);

			const playerState = noa.ents.getState(entityList[userID], "position"); //.newPosition = data.data.pos

			playerState.newPosition = newPosition;
			playerState.newRotation = newRotation;
		}
		//addPlayer(name, [0, 0, 0]);
	});


	const entityList: { [key: string]: any } = {};


	// Gamemode settings
	/*
	if (game.mode == 0) {
		move.airJumps = 0;
	}
	*/

	function setupPlayer() {
		var dat = noa.entities.getPositionData(noa.playerEntity);
		entityList[noa.playerEntity] = noa.ents.add(dat, 1, 2, null, null, false, true);

		const scene = noa.rendering.getScene();
		const mesh = Mesh.CreateBox("player-mesh", 1, scene);
		mesh.scaling.x = 2;
		mesh.scaling.z = 1;
		mesh.scaling.y = 1;

		// add "mesh" component to the player entity
		// this causes the mesh to move around in sync with the player entity
		return noa.entities.addComponent(noa.playerEntity, noa.entities.names.mesh, {
			mesh: mesh,
			// offset vector is needed because noa positions are always the 
			// bottom-center of the entity, and Babylon"s CreateBox gives a 
			// mesh registered at the center of the box
			offset: [0, 2 / 2, 0],
		});
	}

	function addPlayer(entityID: string, position: Coordinates) {
		/*
		var dat = noa.entities.getPositionData(player);
		var w = dat.width;
		var h = dat.height;
		*/

		entityList[entityID] = noa.ents.add(position, 1, 2, null, null, false, true);

		const scene = noa.rendering.getScene();
		const mesh = Mesh.CreateBox("player-mesh", 1, scene);
		mesh.scaling.x = 2;
		mesh.scaling.z = 1;
		mesh.scaling.y = 1;

		// add "mesh" component to the player entity
		// this causes the mesh to move around in sync with the player entity
		return noa.entities.addComponent(entityList[entityID], noa.entities.names.mesh, {
			mesh: mesh,
			// offset vector is needed because noa positions are always the 
			// bottom-center of the entity, and Babylon"s CreateBox gives a 
			// mesh registered at the center of the box
			offset: [0, 2 / 2, 0],
		});
	}

	//entityList["mainPlayer"] = new PlayerModel("other player", "other_123", [0, 0, 0], "skin"); // noa.ents.add(position, 1, 2, null, null, false, true);

	//noa.ents.add(entityList["test"].position, 1, 2, null, null, false, true);

	// get the player entity"s ID and other info (position, size, ..)
	const playerID = networkHandler.userID;

	const id = setupPlayer();
	console.info(id);

	console.log(noa.playerEntity, networkHandler.userID);

	//addPlayer(noa.playerEntity, noa.entities.getPositionData(noa.playerEntity));

	// clear targeted block on on left click
	noa.inputs.down.on("alt-fire", function () {
		if (noa.targetedBlock) {
			//noa.setBlock(0, noa.targetedBlock.position);
			networkHandler.updateBlock(0, noa.targetedBlock.position);
		}
	})

	// place some grass on right click
	noa.inputs.down.on("fire", function () {
		if (noa.targetedBlock) {
			//noa.addBlock(grassID, noa.targetedBlock.adjacent);
			networkHandler.updateBlock(grassID, noa.targetedBlock.adjacent);
		}
	})

	// add a key binding for "E" to do the same as alt-fire
	noa.inputs.bind("alt-fire", "E");

	function positionIsSame(oldPostition: Coordinates, newPostition: Coordinates) {
		if (oldPostition === undefined || newPostition === undefined) {
			return false;
		}

		return oldPostition[0] === newPostition[0] && oldPostition[1] === newPostition[1] && oldPostition[2] === newPostition[2];
	}

	// each tick, consume any scroll events and use them to zoom camera
	noa.on("tick", function (dt: any) {
		var scroll = noa.inputs.state.scrolly;

		const playerInfo = noa.entities.getPositionData(noa.playerEntity);
		const playerState = noa.ents.getState(noa.playerEntity, "position");

		if (!positionIsSame(playerInfo.position, playerState.newPosition)) {
			networkHandler.move(playerInfo.position, noa.camera.heading);
		}

		Object.values(entityList).forEach(item => { // todo change to async            
			//console.log(item, playerState);
			const newPlayerInfo = noa.ents.getState(item, "position");

			//const move = vec3.create();
			//vec3.lerp(move, newPlayerInfo.position, newPlayerInfo.newPosition, 0.2);

			if (newPlayerInfo.newPosition) {
				console.info("updating position");
				noa.ents.setPosition(item, newPlayerInfo.newPosition);
				newPlayerInfo.newPosition = null;
			}

			if (newPlayerInfo.newRotation) {
				console.info("updating rotation");
				noa.ents.getState(item, noa.entities.names.mesh).mesh.rotation.y = newPlayerInfo.newRotation;
				newPlayerInfo.newRotation = null;
			}

			//var move = vec3.create();
			//vec3.lerp(move, playerInfo.position, newPos, 0.2);
			//noa.ents.setPosition(id, move);
			//noa.ents.getState(id, noa.entities.names.mesh).mesh.rotation.y = 2; // (2 * rot + newRot) / 4;
		});

		if (scroll !== 0) {
			noa.camera.zoomDistance += (scroll > 0) ? 1 : -1;
			if (noa.camera.zoomDistance < 0) noa.camera.zoomDistance = 0;
			if (noa.camera.zoomDistance > 10) noa.camera.zoomDistance = 10;
		}
	})
}
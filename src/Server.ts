import socketIO from "socket.io";
import http from "http";
import { ChunkSize } from "./constants";
import ndarray from "ndarray";
import { encode } from "voxel-crunch";
import { IServerState, IChatMessage } from "./handlers/Network";
import { Coordinates } from "voxel-engine";
import { EventType } from "./handlers/SocketIOHandler";

const server = http.createServer();

const io = socketIO(server, {
	serveClient: false,
	// below are engine.IO options
	pingInterval: 10000,
	pingTimeout: 5000,
	cookie: false
});



const serverState: IServerState = {
	players: {},
	chat: [],
	chunks: {}
};


io.on("connection", (socket) => {
	io.emit("userConnected" as EventType, socket.id, [0, 0, 0]);
	console.log("a user connected", socket.id);
	socket.emit("chat" as EventType, { user: "server", content: "Welcome!" });


	serverState.players[socket.id] = {
		name: "no idea",
		socketId: socket.id,
		location: {
			x: 0,
			y: 0,
			z: 0,
			pitch: 0,
			yaw: 0
		}
	};
	stateUpdated();

	socket.on("chat" as EventType, (...message: string[]) => {
		console.info("chat message received, broadcasting", message.join(""));
		const newMessage: IChatMessage = { user: "no idea", content: message.join("") };
		socket.emit("chat" as EventType, { user: "no idea", content: message.join("") });

		serverState.chat.push(newMessage);

		stateUpdated();
	});

	socket.on("chatHistory" as EventType, () => {
		// send down chat history before login
		socket.emit("chatHistory" as EventType, serverState.chat);
	});

	socket.on("updateBlock" as EventType, (material: number, position: Coordinates) => {
		const chunkPosition = {
			x: Math.floor(position[0] / ChunkSize),
			y: Math.floor(position[1] / ChunkSize),
			z: Math.floor(position[2] / ChunkSize)
		};
		const chunkID = getChunkID(chunkPosition.x, chunkPosition.x, chunkPosition.x);

		const data = serverState.chunks[chunkID]!;
		data.set(position[0], position[1], position[2], material);

		io.emit("updateBlock" as EventType, material, position);
	});

	socket.on("move" as EventType, (newPosition: Coordinates, newRotation: number) => {
		io.emit("move" as EventType, socket.id, newPosition, newRotation);

		const player = serverState.players[socket.id];
		if (player) {
			player.location = {
				x: newPosition[0],
				y: newPosition[1],
				z: newPosition[2]!,
				pitch: 0,
				yaw: newRotation
			};
		}

		stateUpdated();
	});

	socket.on("getChunk" as EventType, (id: string, x: number, y: number, z: number) => {
		const chunkData = getChunk(x, y, z);
		const encodedData = encode(chunkData.data as Uint16Array);

		socket.emit("setChunk" as EventType, id, x, y, z, encodedData);
	});

	/** return full current server state */
	function stateUpdated() {
		socket.emit("serverStateUpdate" as EventType, {
			players: serverState.players,
			chat: serverState.chat
		});
	}

	socket.on("disconnect" as EventType, () => {
		console.log("user disconnected", socket.id);
		io.emit("userDisconnected" as EventType, socket.id, [0, 0, 0]);

		delete serverState.players[socket.id];

		stateUpdated();
	});
});

function getChunk(x: number, y: number, z: number): ndarray<Uint16Array> {
	const chunkID = getChunkID(x, y, z);

	// check if its in state first
	let chunkData = serverState.chunks[chunkID];

	if (chunkData === undefined) {
		// generate chunk
		chunkData = generateChunk(x, y, z);
	}

	return chunkData;
}

function generateChunk(x: number, y: number, z: number) {
	const chunkData = ndarray<Uint16Array>(new Uint16Array(ChunkSize * ChunkSize * ChunkSize), [ChunkSize, ChunkSize, ChunkSize]);

	for (var i = 0; i < chunkData.shape[0]; i++) {
		for (var j = 0; j < chunkData.shape[1]; j++) {
			for (var k = 0; k < chunkData.shape[2]; k++) {
				var voxelID = getVoxelID(x + i, y + j, z + k);
				chunkData.set(i, j, k, voxelID);
			}
		}
	}

	// save it to server state!
	const chunkID = getChunkID(x, y, z);
	serverState.chunks[chunkID] = chunkData;

	return chunkData;
}

// simple height map worldgen function
function getVoxelID(x: number, y: number, z: number) {
	if (y < -3) {
		return 1;
	}
	var height = 2 * Math.sin(x / 10) + 3 * Math.cos(z / 20);
	if (y < height) {
		return 2;
	}
	return 0; // signifying empty space
}

function getChunkID(x: number, y: number, z: number): string {
	return `${x}-${y}-${z}`;
}


console.log("Waiting for connections...");

server.listen(9900);
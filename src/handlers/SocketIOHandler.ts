import { INetworkHandler, IEventHandlers } from "./Network";
import io from "socket.io-client";
import { Coordinates } from "voxel-engine";
import { msPerTick } from "../constants";

interface IConnectionMetadata {
	name: string;
	skin: string;
};

export type EventType = "chat" | "chatHistory" | "updateBlock" | "move" | "getChunk";

export class SocketIOHandler implements INetworkHandler {
	constructor(url: string) {
		this.socket = io.connect(url);

		setInterval(this.sendBuffer, msPerTick);
	}

	private buffer: { event: EventType, payload: any }[] = [];

	private socket!: SocketIOClient.Socket;

	sendBuffer = () => {
		// todo, could speed this up by converting to object instead of array O(n) -> O(1)

		// we only want to send one of each unique command (ex: move) to do this we remove all duplicates
		let dedupedBuffer = this.buffer.reverse();

		// throw away all but the first move event
		let moveCount = 0;
		dedupedBuffer = dedupedBuffer.filter((item) => {
			if (item.event === "move") {
				moveCount++;
				if (moveCount > 1) {
					// remove the event (we don't need to send outdated move commands)
					return false;
				}
			}

			// keep the event
			return true;
		});

		dedupedBuffer.forEach(value => {
			// todo probably shouldn't be spreading this...
			this.socket.emit(value.event, ...value.payload);
		});
		console.log("buffer sent", dedupedBuffer.length);

		this.buffer = [];
	}

	get userID() {
		return this.socket.id;
	}

	on<EventKey extends keyof IEventHandlers>(event: EventKey, callback: IEventHandlers[EventKey]) {
		this.socket.on(event, callback);
	}

	chat(message: string): void {
		this.buffer.push({
			event: "chat",
			payload: message
		});
	}

	updateBlock(material: number, position: Coordinates) {
		this.buffer.push({
			event: "updateBlock",
			payload: [material, position]
		});
	}

	move(newPosition: Coordinates, newRotation: number) {
		this.buffer.push({
			event: "move",
			payload: [newPosition, newRotation]
		});
	}

	chatHistory() {
		console.log("chatHistory");

		this.buffer.push({
			event: "chatHistory",
			payload: []
		});
	}

	/**
	 * 
	 * @param id unique string id for the chunk
	 * @param x world coords of the corner of the chunk
	 * @param y world coords of the corner of the chunk
	 * @param z world coords of the corner of the chunk
	 * 
	 * @returns an `ndarray` of voxel ID data (see: https://github.com/scijs/ndarray) 
	 */
	loadChunk(id: string, data: any, x: number, y: number, z: number) {
		this.buffer.push({
			event: "getChunk",
			payload: [id, x, y, z]
		});
		/*
		const newData = ndarray(new Uint16Array(ChunkSize * ChunkSize * ChunkSize), [ChunkSize, ChunkSize, ChunkSize]);

		for (var i = 0; i < data.shape[0]; i++) {
			for (var j = 0; j < data.shape[1]; j++) {
				for (var k = 0; k < data.shape[2]; k++) {
					var voxelID = getVoxelID(x + i, y + j, z + k);
					newData.set(i, j, k, voxelID);
				}
			}
		}
		*/
	}
}

/*
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
*/
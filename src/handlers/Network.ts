import { Coordinates } from "voxel-engine";

export interface IPlayerSettings<keyType = string> {
	skin: string;
	name: string;
	key: keyType;
}

export interface IChatMessage {
	user: string;
	content: string;
}

export interface INetworkCommand {

}

interface IPlayers {
	[key: string]: IPlayerServerState;
}

export interface IServerState {
	players: IPlayers;
	chat: IChatMessage[],
}

export interface IPlayerServerState {
	name: string;
	socketId: string;
	location: {
		x: number;
		y: number;
		z: number;
		pitch: number;
		yaw: number;
	}
}

export class Chunk {
	constructor(chunkSize: number) {
		this.data = new Uint16Array(chunkSize * chunkSize * chunkSize)
		this.offset = 0;
		this.shape = [chunkSize, chunkSize, chunkSize];
		this.stride = [1024, 32, 1];
	}

	data!: Uint16Array;
	offset!: number;
	shape!: number[];
	stride!: number[];

	get(x: number, y: number, z: number) {
		return this.data[this.index(x, y, z)];
	}

	set(x: number, y: number, z: number, value: number) {
		this.data[this.index(x, y, z)] = value;
	}

	index(x: number, y: number, z: number) {
		return this.offset + this.stride[0] * x + this.stride[1] * y + this.stride[2] * z;
	}

	get order() {
		return [2, 1, 0];
	}

	get size() {
		return this.data.length;
	}
}

export interface IEventHandlers {
	//playerJoin: (player: IPlayerSettings<string>) => void;
	//playerLeft: (player: IPlayerSettings<string>) => void;
	//updatePlayer: (player: IConnectedPlayer<string>, newPosition: Coordinates, newRotation: Coordinates, newVelocity: Coordinates, pitch: number) => void;
	//updatePlayerSettings: (player: IPlayerSettings<string>) => void;
	updateBlock: (material: number, position: Coordinates) => void;

	//blockBreakProgress(block: Coordinates): void;

	//chunk(location: Coordinates): void;
	userConnected: (userID: string, position: Coordinates) => void;
	userDisconnected: (userID: string, position: Coordinates) => void;

	move: (userID: string, newPosition: Coordinates, newVelocity: Coordinates, pitch: number) => void;
	chat: (message: IChatMessage) => void;
	setChunk: (id: string, x: number, y: number, z: number, data: Uint16Array) => void;



	/**
	 * Fires whenever ANY server state changes
	 */
	serverStateUpdate: (newState: IServerState) => void;
}

export interface INetworkHandler {
	//buffer: INetworkCommand[];

	on<EventKey extends keyof IEventHandlers>(event: EventKey, callback: IEventHandlers[EventKey]): void;

	chat: (message: string) => void;

	readonly userID: string;

	/** mutates data which ends up being the next chunk */
	loadChunk: (id: string, data: any, x: number, y: number, z: number) => void;

	updateBlock: (material: number, position: Coordinates) => void;

	move: (newPosition: Coordinates, newRotation: number) => void;

	//initialize(url: string): void;

	/** Clears the entire buffer */
	//clearBuffer(): void;
}
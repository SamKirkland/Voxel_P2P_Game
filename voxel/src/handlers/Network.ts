import { Coordinates } from "voxel-engine";
import { IConnectedPlayer } from "../GameScreen";

export interface IPlayerSettings<keyType = string> {
    skin: string;
    name: string;
    key: keyType;
}

export interface INetworkCommand {

}

export interface IEventHandlers<keyType = string> {
    onPlayerJoin(player: IPlayerSettings<keyType>): void;
    onPlayerLeft(player: IPlayerSettings<keyType>): void;
    onUpdatePlayer(player: IConnectedPlayer<keyType>, newPosition: Coordinates, newRotation: Coordinates, newVelocity: Coordinates, pitch: number): void;
    onUpdatePlayerSettings(player: IPlayerSettings<keyType>): void;
    onUpdateBlock(position: Coordinates, material: number): void;
}

export interface INetworkHandler<keyType = string> {
    buffer: INetworkCommand[];

    initialize(gameRoom: string | undefined, eventHandlers: IEventHandlers<keyType>): void;

    /** Clears the entire buffer */
    clearBuffer(): void;

    connectToServer(gameRoom: string, currentPlayer: Omit<IPlayerSettings, "key">): void;

    playerConnect(playerSettings: IPlayerSettings): void;
    playerDisconnect(playerSettings: IPlayerSettings): void;

    // packet will have a sent tick so players know to only take newer packets
    move(newPosition: Coordinates, newVelocity: Coordinates, pitch: number): void;
    look(direction: Coordinates): void;
    
    // weapon, skin, 
    model(): void;

    settings(playerSettings: IPlayerSettings): void;

    blockBreakProgress(block: Coordinates): void;

    chunk(location: Coordinates): void;

    updateBlock(block: Coordinates, newValue: number): void;
}
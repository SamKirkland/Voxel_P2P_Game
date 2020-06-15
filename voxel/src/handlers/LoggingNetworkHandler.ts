import { Coordinates } from "voxel-engine";
import { INetworkHandler, IPlayerSettings } from "./Network";

export class LoggingNetworkHandler implements INetworkHandler {
    buffer = [];

    initialize() {
        console.info("Initialize server");
    }

    /** Clears the entire buffer */
    clearBuffer() {
        if (this.buffer.length === 0) {
            return;
        }

        // send buffer
        console.table(this.buffer);

        // clear buffer
        this.buffer = [];
    };
    
    connectToServer(gameRoom: string, currentPlayer: Omit<IPlayerSettings, "key">) {
        console.info("Connect to server", gameRoom, currentPlayer);
    };
    
    playerConnect(playerSettings: IPlayerSettings) {
        // player has connected
        console.info("player has connected", playerSettings.name, playerSettings.key);
    };

    playerDisconnect(playerSettings: IPlayerSettings) {
        // player has disconnected
        console.info("Player has disconnected", playerSettings.name, playerSettings.key);
    };

    // packet will have a sent tick so players know to only take newer packets
    move(newPosition: Coordinates, newVelocity: Coordinates, pitch: number) {
        //console.info("Player has Moved", newPosition, newVelocity, pitch);
    };

    look(direction: Coordinates) {
        console.info("Player is looking", direction)
    };
    
    // weapon, skin, 
    model() {
        console.info("Player has changed their equipment")
    };

    settings(playerSettings: IPlayerSettings) {
        console.info("Player has change their settings (ex: name)")
    };

    blockBreakProgress(block: Coordinates) {
        console.info("Player is mining", block);
    };

    chunk(location: Coordinates) {
        console.info("Requesting a chunk", location);
    };

    updateBlock(block: Coordinates, newValue: number) {
        console.info("Block at location was change", block, newValue);
    };
}
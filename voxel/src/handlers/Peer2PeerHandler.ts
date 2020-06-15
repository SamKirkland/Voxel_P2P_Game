import { Coordinates } from "voxel-engine";
import { INetworkHandler, IPlayerSettings, IEventHandlers } from "./Network";
import Peer from "peerjs";

interface IConnectionMetadata {
    name: string;
    skin: string;
};

export class Peer2PeerHandler implements INetworkHandler {
    peer!: Peer;
    buffer = [];

    eventHandlers!: IEventHandlers;

    initialize(gameRoom: string | undefined, eventHandlers: IEventHandlers) {
        this.eventHandlers = eventHandlers;

        this.peer = new Peer(gameRoom);
        console.info("Initialize server");

        this.peer.on("error", (err) => {
            console.error("Disconnected from server!", err);
        });

        this.peer.on("disconnected", () => {
            console.error("Disconnected from singal server!");
        });

        this.peer.on("connection", (connection) => {
            // key, position, skin, name, etc
            const newPlayerInfo = {
                ...connection.metadata as IConnectionMetadata,
                key: connection.peer
            };

            connection.on("data", (data) => {
                console.info("Data from client", data);
                // todo need a switch case and pick which eventHandler to run
                //eventHandlers.onUpdateBlock(data);
                //eventHandlers.onUpdatePlayer(data);
                //eventHandlers.onUpdatePlayerSettings(data);
            });

            connection.on("open", () => {
                console.info("Connection closed");
                eventHandlers.onPlayerJoin(newPlayerInfo);
            });

            connection.on("close", () => {
                console.info("Connection closed");
                eventHandlers.onPlayerLeft(newPlayerInfo);
            });

            connection.on("error", (err) => {
                console.warn("Error with data connection!", err);
            });
        });
    };

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
        const connection = this.peer.connect(gameRoom, {
            label: "gameState",
            metadata: {
                name: currentPlayer.name,
                skin: currentPlayer.skin
            } as IConnectionMetadata,
            reliable: false
        });
        connection.on("open", () => {
            console.info("player has connected!!!");
            connection.send("hi!");
        });

        connection.on("data", (data) => {
            console.info("data from client", data);
            connection.send("hi!");
        });
    };

    playerConnect(playerSettings: IPlayerSettings) {
        console.info("player has connected", playerSettings.name, playerSettings.key);

        const connection = this.peer.connect(playerSettings.key, {
            label: "gameState",
            metadata: {
                name: playerSettings.name,
                skin: playerSettings.skin
            } as IConnectionMetadata,
            reliable: false
        });

        connection.on("open", () => {
            console.info("player has connected!!!");
            connection.send("hi!");
        });

        connection.on("data", (data) => {
            console.info("data from client", data);
            connection.send("hi!");
        });
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
import socketIO from "socket.io";
import http from "http";
import { ChunkSize } from "./constants";
import ndarray from "ndarray";
import { encode } from "voxel-crunch";

const server = http.createServer();

const io = socketIO(server, {
    serveClient: false,
    // below are engine.IO options
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

io.on('connection', (socket) => {
    io.emit("userConnected", socket.id, [0, 0, 0]);
    console.log('a user connected', socket.id);
    socket.emit("chat", { user: "server", content: "Welcome!" });

    socket.on("chat", (...message: string[]) => {
        console.info("chat message received, broadcasting", message.join(""));
        io.emit("chat", { user: "no idea", content: message.join("") });
    });

    socket.on("updateBlock", (material: number, position: Coordinates) => {
        console.info("block updated", JSON.stringify(position));
        io.emit("updateBlock", material, position);
    });

    socket.on("move", (newPosition: Coordinates, newRotation: number) => {
        io.emit("move", socket.id, newPosition, newRotation);
    });

    socket.on("getChunk", (id: string, x: number, y: number, z: number) => {
        const newData = ndarray<Uint16Array>(new Uint16Array(ChunkSize * ChunkSize * ChunkSize), [ChunkSize, ChunkSize, ChunkSize]);

        for (var i = 0; i < newData.shape[0]; i++) {
            for (var j = 0; j < newData.shape[1]; j++) {
                for (var k = 0; k < newData.shape[2]; k++) {
                    var voxelID = getVoxelID(x + i, y + j, z + k);
                    newData.set(i, j, k, voxelID);
                }
            }
        }
        const encodedData = encode(newData.data as Uint16Array);

        socket.emit("setChunk", id, x, y, z, encodedData);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        io.emit("userDisconnected", socket.id, [0, 0, 0]);
    });
});

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


console.log("Waiting for connections...");

server.listen(9900);
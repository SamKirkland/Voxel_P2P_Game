declare module "voxel-crunch" {
    export type Chunk = number[] | Uint16Array | Uint32Array;


    /** A number representing the minimal number of bytes necessary to compress chunk */
    export function size(chunk: Chunk): number;

    /**
     * 
     * @param chunk uncompressed chunk
     * @param result optional array argument which stores the result of the encoding. If not specified, a Uint8Array is allocated
     * @throws An error if the result buffer is too small
     */
    export function encode(chunk: Chunk, result: Chunk): undefined;
    export function encode(chunk: Chunk): Chunk;

    /**
     * 
     * @param chunk the compress chunk
     * @param result is an array which gets the result of unpacking the voxels
     * @throws If the runs are not valid or if the bounds on the chunk are exceeded, an error will be thrown.
     */
    export function decode(chunk: Chunk, result: Chunk): undefined;
    export function decode(chunk: Chunk): Chunk;
}
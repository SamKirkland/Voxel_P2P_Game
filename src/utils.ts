import { Coordinates } from "voxel-engine";


const randomNames = ["potato", "cheese", "pizza", "hotdog", "chainsaw", "bear", "paper", "turtle", "bunny", "panda"];

/**
 * Returns a randomly generated room name
 * @example potato6
*/
export function getRoomName(): string {
    const randomName = getRandomName();
    const randomNumber = getRandomInt(10, 99);

    return randomName + randomNumber;
}

/**
 * Gets a random name
 * @example "potato"
 */
export function getRandomName(): string {
    return randomNames[Math.floor(Math.random() * randomNames.length)];
}

/**
 * Get a random int between min and max (inclusive)
 * @param min lowest possible random value (inclusive)
 * @param max highest possible random value (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function convertCoordinateObject(coordinate: CoordinatesObject): Coordinates {
    return [coordinate.x, coordinate.y, coordinate.z];
}

export function convertCoordinate(coordinate: Coordinates): CoordinatesObject {
    return { x: coordinate[0], y: coordinate[1], z: coordinate[2] };
}
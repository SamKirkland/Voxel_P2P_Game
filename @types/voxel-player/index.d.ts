declare module "voxel-player" {
    export type SkinOptions = {
        scale: { x: number, y: number, z: number };
    };

    export class Player {
        constructor(playerSkin: string, skinOptions?: SkinOptions);

        public position: CoordinatesObject & {
            set(x: number, y: number, z: number);
        };

        subjectTo(forceVector: any);
        move(x: number, y: number, z: number);
        move(vector: { x: number, y: number, z: number });
        moveTo(x: number, y: number, z: number);
        moveTo(position: { x: number, y: number, z: number });
        pov(view: "first" | "third");
        /** Toggle the player pov between 1st and 3rd */
        toggle();

        /** Set the player as the active camera view */
        possess();

        pitch: {
            rotation: CoordinatesObject;
        };
    }

    export default function voxelPlayer(game: import("voxel-engine").GameOptions): typeof Player;
}
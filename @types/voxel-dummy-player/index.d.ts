type CoordinatesObject = { x: number, y: number, z: number };

declare module "voxel-dummy-player" {
    export class Dummy {
        constructor(playerSkin: string, skinOptions?: import("voxel-player").SkinOptions);

        public position: {
            set(x: number, y: number, z: number);
        };

        subjectTo(forceVector: any);
        move(x: number, y: number, z: number);
        move(vector: { x: number, y: number, z: number });
        moveTo(x: number, y: number, z: number);
        moveTo(position: { x: number, y: number, z: number });

        /** Rotate dummy to face towards object position */
        faceTowards(obj);
        
        /** Rotate head a relative amount */
        rotateHead(x: number, y: number, z: number);
        rotateHead(x: CoordinatesObject);

        rotate(x: number, y: number, z: number);
        rotate(vec: CoordinatesObject);
        
        /** Rotate head to an position */
        rotateHeadTo(x: number, y: number, z: number);
        rotateHeadTo(pos: CoordinatesObject);

        rotateTo(x: number, y: number, z: number);
        rotateTo(pos: CoordinatesObject);

        /** Rotate dummy head to look at object position */
        lookAt(obj: CoordinatesObject);
        
        /** Make dummy jump by height of y */
        jump(y: number);
    }

    export default function voxelDummyPlayer(game: import("voxel-engine").GameOptions): typeof Dummy;
}
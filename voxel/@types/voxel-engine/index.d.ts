declare module "voxel-engine" {
    export type GameOptions = {
        /**
         * Is this a client or a headless server
         * @default true
        */
        isClient?: boolean = true,

        generate?: any,

        /** @default true */
        generateChunks?: boolean = true,

        /** @default Uint8Array */
        arrayType?: Uint8Array = Uint8Array,

        /** @default 32 */
        chunkSize?: number = 32,

        worldOrigin: Coordinates = [0, 0, 0],

        /** @default 2 */
        chunkDistance?: number = 2,

        /** @default chunkDistance + 1 */
        removeDistance?: number,

        /** @default 0xBFD1E5 */
        skyColor?: number = 0xBFD1E5,

        antialias?: boolean,
        playerHeight?: number = 1.62,
        meshType?: "surfaceMesh" | "wireMesh",

        /** @default culled */
        mesher?: any,

        materialType?: THREE.MeshLambertMaterial,
        materialParams?: any,
        materialFlatColor?: any,

        /** @default pulls */
        view?: voxelView,

        lightsDisabled?: boolean = false,

        fogDisabled?: boolean = false,
        fogScale?: number = 32,

        tickFPS?: number = 16,

        texturePath?: any,

        materials?: string[] = [['grass', 'dirt', 'grass_dirt'], 'brick', 'dirt'],

        asyncChunkGeneration?: boolean = false,

        controls: {
            target?: (target?: any) => any;
            tick?: (dt) => void;

            /** starting speed */
            speed?: number,
            /** max walking speed */
            walkMaxSpeed?: number,
            /** max running speed */
            runMaxSpeed?: number,
            /** max jump speed */
            jumpMaxSpeed?: number,
            /** maximum amount of time jump will be applied in MS */
            jumpMaxTimer?: number,
            /** starting jump speed */
            jumpSpeed?: number,
            /** velocity modifier to use when moving laterally while in the middle of a jump */
            jumpSpeedMove?: number,
            /** time to reach full speed on X/Y */
            accelTimer?: number,
            /** defaults to a sin curve */
            accelerationCurve?: (current, max) => any,
            /** can player control direction without being on the ground? */
            airControl?: boolean,
            /** MS between firing */
            fireRate?: number,
            /** does firing require mousedown -> mouseup or can it be held? */
            discreteFire?: boolean,
            onfire?: (state) => undefined,
            /** maximum x rotation in a tick */
            rotationXMax?: number,
            /** maximum y rotation in a tick */
            rotationYMax?: number,
            /** maximum x rotation in a tick */
            rotationZMax?: number,
            /** maximum rotation in a tick -- other rotation maximums fallback to this value */
            rotationMax?: number,
            /** clamp x rotation to +/- this value */
            rotationXClamp?: number,
            /** clamp y rotation to this value */
            rotationYClamp?: number,
            /** clamp z rotation to this value */
            rotationZClamp?: number,
            /** constant scale of rotation events, applied during tick */
            rotationScale?: number,
        },
    };

    /** [x: number, y: number, z: number] */
    export type Coordinates = [number, number, number];

    export type CoordinatesObject = { x: number, y: number, z: number };

    /** [x: number, y: number, z: number, pitch: number, yaw] */
    export type Vector = [number, number, number, number, number];

    export type ControlObject = {
        on(listener: "data", callback: (state: any) => void);

        target(): {
            acceleration: CoordinatesObject;
            attractors: any[];
            avatar: {
                head: any;
                id: number;
                position: CoordinatesObject;
                rotation: CoordinatesObject;
            };

            blocksCreation: boolean;
            collidables: any[];
            dimensions: Coordinates;
            forces: any;
            friction: any;
            move(x: number, y: number, z: number);
            moveTo(x: number, y: number, z: number);
            pitch: any;
            playerSkin: any;
            position: CoordinatesObject;
            possess();
            pov(type: any);
            resting: CoordinatesObject;
            roll: any;
            rotation: CoordinatesObject;
            terminal: CoordinatesObject;
            toggle();
            velocity: CoordinatesObject;
            yaw: any;
            _aabb: any;
        };

        state: any;
        _pitch_target: any;
        _yaw_target: any;
        _roll_target: any;
        _target: null | any;
        speed: number;
        max_speed: number;
        jump_max_speed: number;
        jump_max_timer: number;
        jump_speed: number;
        jump_timer: number;
        jumping: number;
        acceleration: number;
      
        fire_rate: number;
        needs_discrete_fire: boolean;
        onfire: () => any;
        firing: 0 | 1;
      
        x_rotation_per_ms: number;
        y_rotation_per_ms: number;
        z_rotation_per_ms: number;
      
        x_rotation_clamp: number;
        y_rotation_clamp: number;
        z_rotation_clamp: number;
      
        rotation_scale: number;
      
        air_control: boolean;
      
        state: {
            x_rotation_accum: number;
            y_rotation_accum: number;
            z_rotation_accum: number;
        };
      
        accel_max_timer: number;
        x_accel_timer: number;
        z_accel_timer: number;
      
        readable: boolean;
        writable: boolean;
      
        buffer: any[];
        paused: boolean;
    };

    export type Chunker = {
        chunkBits: number,
        chunkSize: number,
        chunks: {
            /** key is in the format "x|y|z" */
            [key: string]: {
                dims: [number, number, number],
                position: Coordinates,
                voxels: Int8Array[]
            }
        },
        cubeSize: number,
        distance: number,
        generateVoxelChunk: (low: number, high: number) => any,
        meshes: any,
    };

    export type GameObject = {
        on(listener: "playerJoin" | "playerLeft" | "updatePlayer" | "updateBlock" | "fire" | "tick", callback: (target: any, state: any) => void);

        highlighter: any;

        voxelPosition(gamePosition: any): Coordinates;
        cameraPosition(): Coordinates;
        cameraVector(): Vector;
        makePhysical(target: any, envelope: any, blocksCreation: any): any;
        /** is the current browser client capable of rendering webgl? */
        notCapable(): boolean;
        /** appends a error message to the page */
        notCapableMessage(): string;
        /** sets cnavas size to window size whenever the browser window is resized */
        onWindowResize();
        setDimensions(options?: { container: any });
        /**
         * 
         * @param options defaults to { startingPosition: [35, 1024, 35], worldOrigin: [0, 0, 0] }
         */
        setConfigurablePositions(options: { startingPosition?: Coordinates, worldOrigin?: Coordinates });


        /** returns true if the space is empty */
        canCreateBlock(position: Coordinates): boolean;
        
        /**
         * 
         * @param position 
         * @param materialIndex 
         * @example setBlock([0, 0, 0], 0) // off
         * @example setBlock([0, 0, 0], 1) // on
         * @example setBlock([0, 0, 0], 2) // on, with material 2
         */
        setBlock(position: Coordinates, materialIndex: number);
        getBlock(position: Coordinates): number;
        /**
         * returns true if the block was successfully created. false if the position is already being used by another block
         */
        createBlock(position: Coordinates, val: number): boolean;

        /** @deprecated use createBlock instead */
        createAdjacent(hit: any, val: any);

        /** appends the game to the passed element */
        appendTo(element: HTMLElement);

        gravity: Coordinates = [0, -0.0000036, 0];
        friction: number = 0.3;
        epilson: number = 1e-8;
        terminalVelocity: Coordinates = [0.9, 0.1, 0.9];

        defaultButtons: {
            "W": "forward";
            "A": "left";
            "S": "backward";
            "D": "right";
            "<up>": "forward";
            "<left>": "left";
            "<down>": "backward";
            "<right>": "right";
            "<mouse 1>": "fire";
            "<mouse 3>": "firealt";
            "<space>": "jump";
            "<shift>": "crouch";
            "<control>": "alt";
        };

        control(target: any): ControlObject;
        controls: ControlObject;

        timer: number;
        spatial: any;
        scene: any;
        
        pendingChunks: number[];

        voxels: Chunker;

        /**
         * Get the position of the player under control.
         * If there is no player under control, return
         * current position of the game's camera.
         */
        playerPosition(): Coordinates;
    }

    export default function Game(options?: GameOptions): GameObject & GameOptions;
}
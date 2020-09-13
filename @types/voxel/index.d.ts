declare module "voxel" {
	export type Mesh = { vertices: number[number[]], faces: number[number[]] };

	/**
	 * @see http://mikolalysenko.github.io/MinecraftMeshes2/
	 */
	export const meshers = {
		/** Naive meshing (with face culling) */
		culled: Mesh,
		greedy: Mesh,
		/** contains all forward faces (in terms of scan direction) */
		transgreedy: Mesh,
		monotone: Mesh,
		/** The stupidest possible way to generate a Minecraft mesh (I think) - renders triangles you can't see */
		stupid: Mesh,
	};


	interface IChunkerOptions {
		/** @default 2 */
		distance: number = 2;

		/** @default 32 */
		chunkSize: number = 32;

		/** @default 0 */
		chunkPad: number = 0;

		/** @default 25 */
		cubeSize: number = 25;

		/** callback function, should generate map
		 * @default valley generator
		 */
		generateVoxelChunk: (low, high) => any;
	}

	export function Chunker(IChunkerOptions): any;

	type IGeneratorType = any;

	/**
	 * 
	 * @param low 
	 * @param high 
	 * @param callback 
	 * @param game
	 * @example generate([0,0,0], [32,32,32], module.exports.generator["Valley"])
	 * @example generate([-16,-16,-16], [16,16,16], module.exports.generator["Sphere"])
	 * @example generate([0,0,0], [8,8,8], module.exports.generator["Checker"])
	 */
	export function generate(low: number, high: number, callback: (i: number, j: number, k: number) => any, game: any): IGeneratorType;

	export const generator = {
		"Sphere": (i: number, j: number, k: number) => number,
		"Noise": (i: number, j: number, k: number) => number,
		"Dense Noise": (i: number, j: number, k: number) => number,
		"Checker": (i: number, j: number, k: number) => number,
		"Hill": (i: number, j: number, k: number) => number,
		"Valley": (i: number, j: number, k: number) => number,
		"Hilly Terrain": (i: number, j: number, k: number) => number,
	};

	export function scale(x: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number;

	export function generateExamples(): {
		"Sphere": IGeneratorType
		"Noise": IGeneratorType
		"Dense Noise": IGeneratorType
		"Checker": IGeneratorType
		"Hill": IGeneratorType
		"Valley": IGeneratorType
		"Hilly Terrain": IGeneratorType
	}

	export default function Chunker(IChunkerOptions): any;
}
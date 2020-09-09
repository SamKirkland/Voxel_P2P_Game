
/** stores a player skin */
export class PlayerSkin {
    constructor (name: string, src: string, preview: string) {
        this.name = name;
        this.src = src;
        this.preview = preview;
    }

    name: string;

    /** should be a path to the skins image asset */
    src: string;

    /** preview thumbnail to show in the UI - should be a path to the image asset */
    preview: string;
}
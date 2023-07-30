import fs from "fs";
import { glob } from "glob";

export default class database {
    databaseDir : string;
    playlists : Array<playlist>


    constructor(baseDir : string) {
        this.databaseDir = baseDir;
        this.playlists = [];

        if(!this.databaseDir) throw new Error("Missing database directory.");
        if(typeof this.databaseDir != "string") throw new Error("Database directory must be a string.");

        if(!fs.existsSync(this.databaseDir)) {
            fs.mkdirSync(this.databaseDir, {
                recursive : true
            });
        }

        this.reloadPlaylists();
    }

    createPlaylist(playlistName : string, user : string, givenInformation : {
        songs? : Array<song>,
        description?: String,
        public? : boolean
    }) : playlist | undefined {
        if(!playlistName) {
            console.log("Missing name!");
            return;
        }

        if(!user) {
            console.log("Missing user");
            return;
        }

        if(typeof playlistName != "string") {
            console.log("Playlist Name must be a string");
            return;
        }

        if(typeof user != "string") {
            console.log("User name must be a string");
            return;
        }


        let information : any = {};

        information.name = playlistName;
        information.description = givenInformation.description ? givenInformation.description : "";
        information.songs = givenInformation.songs ? givenInformation.songs : [];
        information.ownerName ? user : "";
        information.public = givenInformation.public ? givenInformation.public : false;

        const newPlaylist : playlist = {
            name : information.name,
            songs : information.songs,
            description : information.description,
            user : information.ownerName,
            public : information.public
        }

        fs.writeFileSync(`${this.databaseDir}/playlists/${playlistName}.json`, JSON.stringify(newPlaylist));

        this.playlists.push(newPlaylist);

        return newPlaylist;
    }

    reloadPlaylists() {
        glob(`${this.databaseDir}/playlists/*.json`).then((files) => {
            for(let i = 0; i < files.length; i++) {
                let rawPlaylistData = JSON.parse(fs.readFileSync(files[i]).toString());

                let playlist : playlist = {
                    name: rawPlaylistData.name,
                    description: rawPlaylistData.description,
                    user: rawPlaylistData.user,
                    public : rawPlaylistData.public,
                    songs : rawPlaylistData.songs
                }

                this.playlists.push(playlist);
            }
        });


        return true;
    }

    getPlaylist(playlistName : string, username : string) { 
        for(let i = 0; i < this.playlists.length; i++) {
            if(this.playlists[i].name == playlistName && (this.playlists[i].user == username || this.playlists[i].public)) {
                return this.playlists[i];
            }
        }

        return "Failed to find playlist!";
    }

    addToPlaylist(playlistName : string, username : string, songs : Array<song>) {
        let playlist = this.getPlaylist(playlistName, username);

        if(!playlist || typeof playlist == "string") {
            return "Failed to find playlist, or the user is not the owner";
        }

        if(username !== playlist.user) return "Failed to find playlist, or the user is not the owner.";
    }
}

export interface playlist {
    name : string;
    description : string;
    songs : Array<song>;
    user : string;
    public : boolean;
}

export interface song {
    name : string;
    description : string;
    shortDescription : string;
    author : string,
    mediaLocation : string;
    thumbnailLocation : string;
}
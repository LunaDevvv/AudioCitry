import fs from "fs";
import { glob } from "glob";
import ytdl from "ytdl-core";
import client from "https";

export default class database {
    databaseDir : string;
    playlists : Array<playlist>
    songs : Array<song>

    constructor(baseDir : string) {
        this.databaseDir = baseDir;
        this.playlists = [];
        this.songs = [];

        if(!this.databaseDir) throw new Error("Missing database directory.");
        if(typeof this.databaseDir != "string") throw new Error("Database directory must be a string.");

        if(!fs.existsSync(this.databaseDir)) {
            fs.mkdirSync(this.databaseDir, {
                recursive : true
            });
        }

        this.reloadPlaylists();
        this.reloadSongs();
    }

    createPlaylist(playlistName : string, user : string, givenInformation : {
        songs? : Array<song>,
        description?: String,
        public? : boolean
    }) : playlist | undefined {
        if(!playlistName) {
            console.error("Missing name!");
            return;
        }

        if(!user) {
            console.error("Missing user");
            return;
        }

        if(typeof playlistName != "string") {
            console.error("Playlist Name must be a string");
            return;
        }

        if(typeof user != "string") {
            console.error("User name must be a string");
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

    getPlaylist(playlistName : string, username : string) : [playlist | undefined, number | undefined, boolean] { 
        for(let i = 0; i < this.playlists.length; i++) {
            if(this.playlists[i].name == playlistName && (this.playlists[i].user == username || this.playlists[i].public)) {
                return [this.playlists[i], i, true];
            }
        }

        return [undefined, undefined, false];
    }

    addToPlaylist(playlistName : string, username : string, songs : Array<song>) {
        let [playlist, spot, success] = this.getPlaylist(playlistName, username);

        if(!success || !spot || !playlist) return false;


        if(!playlist || typeof playlist == "string") {
            return "Failed to find playlist, or the user is not the owner";
        }

        if(username !== playlist.user) return "Failed to find playlist, or the user is not the owner.";

        for(let i = 0; i < songs.length; i++) {
            this.playlists[spot].songs.push(songs[i]);
        }

        fs.writeFileSync(`${this.databaseDir}/playlists/${this.playlists[spot].name}.json`, JSON.stringify(this.playlists[spot]));

        return true;
    }

    reloadSongs() {
        if(!fs.existsSync(`${this.databaseDir}/songData.json`)) {
            fs.writeFileSync(`${this.databaseDir}/songData.json`, JSON.stringify({
                songs : []
            }));

            return true;
        }

        this.songs = JSON.parse(fs.readFileSync(`${this.databaseDir}/songData.json`).toString()).songs;
    }

    async saveSong(songLink : string) {
        let isYTLink = ytdl.validateURL(songLink);
    
        this.reloadSongs();
        
        if(isYTLink == false) {
            console.log("Link is not a youtube link");
            return false;
        }
        
        let videoInfo = await ytdl.getInfo(ytdl.getURLVideoID(songLink));
        
        if(fs.existsSync(`${this.databaseDir}/songs/${videoInfo.videoDetails.title}/${videoInfo.videoDetails.author}.mp3`)) return false;

        if(!fs.existsSync(`${this.databaseDir}/songs/${videoInfo.videoDetails.title}/`)) fs.mkdirSync(`${this.databaseDir}/songs/${videoInfo.videoDetails.title}/`, { recursive : true });
        if(!fs.existsSync(`${this.databaseDir}/thumbnails/${videoInfo.videoDetails.title}/`)) fs.mkdirSync(`${this.databaseDir}/thumbnails/${videoInfo.videoDetails.title}/`, { recursive : true });


        let song : song = {
            name : videoInfo.videoDetails.title,
            description : videoInfo.videoDetails.description ? videoInfo.videoDetails.description : "",
            author : videoInfo.videoDetails.ownerChannelName,
            mediaLocation : `${this.databaseDir}/songs/${videoInfo.videoDetails.title}/${videoInfo.videoDetails.ownerChannelName}.mp3`,
            thumbnailLocation : `${this.databaseDir}/thumbnails/${videoInfo.videoDetails.title}/${videoInfo.videoDetails.ownerChannelName}.png`
        }

        ytdl(songLink, {filter : 'audioonly'}).pipe(fs.createWriteStream(`${this.databaseDir}/songs/${videoInfo.videoDetails.title}/${videoInfo.videoDetails.ownerChannelName}.mp3`));

        client.get(videoInfo.videoDetails.thumbnails[0].url, (res) => {
            res.pipe(fs.createWriteStream(`${this.databaseDir}/thumbnails/${videoInfo.videoDetails.title}/${videoInfo.videoDetails.ownerChannelName}.png`));
        });

        this.songs.push(song);

        fs.writeFileSync(`${this.databaseDir}/songData.json`, JSON.stringify({
            songs : this.songs
        }, undefined, 2));

        return true;
    }

    searchSongs(songSearch : string) {
        let availableSongs : Array<song> = [];

        for(let i = 0; i < this.songs.length; i++) {
            if(this.songs[i].name.includes(songSearch)) availableSongs.push(this.songs[i]); 
        }

        return availableSongs;
    }

    getSong(songName : string, songAuthor : string) {
        for(let i = 0; i < this.songs.length; i++) {
            if(this.songs[i].name == songName && this.songs[i].author == songAuthor) {
                return this.songs[i];
            }
        }

        return undefined;
    }

    deleteSong(songName : string, songAuthor : string) {
        // console.log(this.songs);
        for(let i = 0; i < this.songs.length; i++) {
            if(this.songs[i].name == songName && this.songs[i].author == songAuthor) {
                fs.rmSync(this.songs[i].mediaLocation);
                fs.rmSync(this.songs[i].thumbnailLocation);

                this.songs.splice(i, 1);

                fs.writeFileSync(`${this.databaseDir}/songData.json`, JSON.stringify({
                    songs : this.songs
                }, undefined, 2));        
            }
        }
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
    author : string,
    mediaLocation : string;
    thumbnailLocation : string;
}
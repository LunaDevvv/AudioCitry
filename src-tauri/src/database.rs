// TODO: Get Playlists, Create Playlist, Get Playlist, Add To Playlist, Search Playlists, Save Song, Get Song, Reload Songs, Search Songs, Get Songs, Get Song, Delete Song, Create User, Get User Data, Modify Username, Check Pass,  
use std::fs;

pub fn create_database() -> Database {
    
    let database_directory = get_executable_path() + "database";

    if !std::path::Path::exists(std::path::Path::new(&database_directory)) {
        let _ = fs::create_dir(&database_directory);
    };

    let paths = fs::read_dir(get_executable_path()).unwrap();

    for path in paths {
        println!("Path Name: {}", path.unwrap().path().display());
    }    

    Database {
        database_path: database_directory,
        playlists: vec![],
        songs: vec![]
    }
}




pub fn get_executable_path() -> String {
    let path = std::env::current_exe().unwrap();

    path.as_path().to_str().unwrap().to_string().replace("audiocity.exe", "").replace("\\", "/")
}

impl Database {
    pub fn build_playlist(name: String, description: String, songs: Vec<Song>, user: String, public: bool) -> Playlist {
        Playlist {
            name,
            description,
            songs,
            user,
            public
        }
    }
}

/* //! Remove when no longer dead */
#[allow(dead_code)]
pub struct Database {
    database_path: String,
    playlists: Vec<Playlist>,
    songs: Vec<Song>
}

#[allow(dead_code)]
pub struct Playlist {
    name: String,
    description: String,
    songs: Vec<Song>,
    user: String,
    public: bool
}

#[allow(dead_code)]
pub struct Song {
    name: String,
    artist: String,
    thumbnail_location: String
}
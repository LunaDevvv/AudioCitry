//! Audio city, rust rework.
//! Developed by the StardustNebula Team
//* And by team I mean exclusively Stella 💀

// ! DO NOT REMOVE
// ! Removes the additional console in windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// TODO: Create database, and basically get back to where I was


//* Basic import shit.
#[macro_use]
<<<<<<< HEAD
pub mod youtube_dlp;
pub mod database;
pub mod commands;


=======
pub mod database;
pub mod commands;

>>>>>>> 33f17f4ae80b41427826791a4cbf05671b39b4f7
fn main() {
    database::create_database();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
             
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

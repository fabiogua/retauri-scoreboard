// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{command, generate_context, generate_handler, AppHandle, Builder, Manager};

#[command]
fn update_score(app: AppHandle, score: u8) {
    app.get_window("scoreboard")
        .expect("error while getting main window")
        .emit("update-score", score)
        .unwrap();
}

fn main() {
    let app = Builder::default()
        .invoke_handler(generate_handler![update_score])
        .build(generate_context!())
        .expect("error while building tauri application");

    app.get_window("main".into())
        .expect("error while getting main window")
        .show()
        .expect("error while showing main window");
    // app.get_window( "scoreboard".into()).expect("error while getting scoreboard window").hide().expect("error while hiding scoreboard window");
    // app.get_window("controlboard".into()).expect("error while getting controlboard window").hide().expect("error while hiding controlboard window");

    app.run(|_, _| {});
}

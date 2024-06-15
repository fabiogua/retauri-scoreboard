// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::{command, generate_context, generate_handler, AppHandle, Builder, Manager};

#[derive(Serialize, Deserialize, Clone)]
struct ScorePayload {
    team: String,
    score: u8,
}

#[derive(Serialize, Deserialize, Clone)]
struct ExclusionPayload {
    team: String,
    index: u8,
    exclusions: u8,
}

#[derive(Serialize, Deserialize, Clone)]
struct GoalPayload {
    team: String,
    index: u8,
    goals: u8,
}

#[command]
fn update_score(app: AppHandle, score: u8, team: String) {
    app.get_window("scoreboard")
        .expect("error while getting main window")
        .emit("update_score", ScorePayload { team, score })
        .unwrap();
}

#[command]
fn update_player_exclusions(app: AppHandle, team: String, index: u8, exclusions: u8) {
    app.get_window("scoreboard")
        .expect("error while getting main window")
        .emit(
            "update_player_exclusions",
            ExclusionPayload {
                team,
                index,
                exclusions,
            },
        )
        .unwrap();
}

#[tauri::command]
fn update_player_goals(app: AppHandle, team: String, index: u8, goals: u8) {
    app.get_window("scoreboard")
        .expect("error while getting main window")
        .emit("update_player_goals", GoalPayload { team, index, goals })
        .unwrap();
}

fn main() {
    let app = Builder::default()
        .invoke_handler(generate_handler![
            update_score,
            update_player_exclusions,
            update_player_goals
        ])
        .build(generate_context!())
        .expect("error while building tauri application");

    app.get_window("main".into())
        .expect("error while getting main window")
        .hide()
        .expect("error while showing main window");
    // app.get_window( "scoreboard".into()).expect("error while getting scoreboard window").hide().expect("error while hiding scoreboard window");
    // app.get_window("controlboard".into()).expect("error while getting controlboard window").hide().expect("error while hiding controlboard window");

    app.run(|_, _| {});
}

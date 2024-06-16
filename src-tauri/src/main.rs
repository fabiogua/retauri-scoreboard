// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};

use serde::{Deserialize, Serialize};
use tauri::{command, generate_context, generate_handler, AppHandle, Builder, Manager};
use tokio::time::interval;

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

#[derive(Serialize, Deserialize, Clone)]
struct TimeoutPayload {
    team: String,
    timeouts: u8,
}

#[command]
fn update_time(app: AppHandle, time: String) {
    app.get_window("scoreboard")
        .expect("error while getting main window")
        .emit("update_time", time)
        .unwrap();
}

#[command]
fn update_timeouts(app: AppHandle, team: String, timeouts: u8) {
    app.get_window("scoreboard")
        .expect("error while getting main window")
        .emit("update_timeouts", TimeoutPayload { team, timeouts })
        .unwrap();
}

#[command]
fn update_exclusions(app: AppHandle, team: String, index: u8, exclusions: u8) {
    app.get_window("scoreboard")
        .expect("error while getting main window")
        .emit(
            "update_exclusions",
            ExclusionPayload {
                team,
                index,
                exclusions,
            },
        )
        .unwrap();
}

#[tauri::command]
fn update_goals(app: AppHandle, team: String, index: u8, goals: u8) {
    app.get_window("scoreboard")
        .expect("error while getting main window")
        .emit("update_goals", GoalPayload { team, index, goals })
        .unwrap();
}

#[derive(Default)]
pub struct TimerState {
    is_running: Arc<Mutex<bool>>,
    time: Arc<Mutex<u32>>,
}

#[command]
fn toggle_timer(state: tauri::State<TimerState>) {
    let mut is_running = state.is_running.lock().unwrap();
    *is_running = !*is_running;
}

fn main() {
    let app = Builder::default()
        .manage(TimerState {
            is_running: Arc::new(Mutex::new(false)),
            time: Arc::new(Mutex::new(8 * 60 * 1000)),
        })
        .invoke_handler(generate_handler![
            update_exclusions,
            update_goals,
            update_timeouts,
            toggle_timer,
        ])
        .setup(|app| {
            const TIME_STEP: u8 = 10;
            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                let mut interval = interval(tokio::time::Duration::from_millis(TIME_STEP.into()));

                loop {
                    interval.tick().await;

                    task( 
                        app_handle.clone(),
                        TIME_STEP
                    ).await;
                }
            });

            Ok(())
        })
        .build(generate_context!())
        .expect("error while building tauri application");

    app.get_window("main".into())
        .expect("error while getting main window")
        .hide()
        .expect("error while showing main window");
    // app.get_window( "scoreboard".into()).expect("error while getting scoreboard window").hide().expect("error while hiding scoreboard window");
    // app.get_window("controlboard".into()).expects("error while getting controlboard window").hide().expect("error while hiding controlboard window");

    app.run(|_, _| {});
}

async fn task( app_handle: AppHandle, time_step: u8) {

    let state = app_handle.state::<TimerState>();
    let is_running = state.is_running.lock().unwrap();
    let mut time = state.time.lock().unwrap();

    if !*is_running {
        return;
    }

    if *time >= time_step.into() {
        *time -= time_step as u32;
    } else {
        println!("Counter value is less than 10, cannot subtract further.");
        return;
    }

    // when time is equal to a whole second, update the time
    if *time % 1000 != 0 {
        return;
    }

    let time_in_seconds = *time / 1000;
    let seconds = time_in_seconds % 60;
    let minutes = time_in_seconds / 60;
    let formatted_time: String = format!("{}:{}", minutes, seconds);
    update_time(app_handle.clone(), formatted_time);
}

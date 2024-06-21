// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};

use serde::{Deserialize, Serialize};
use tauri::{command, generate_context, generate_handler, AppHandle, Builder, Manager};
use tokio::time::interval;

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
struct MatchStats {
    home: TeamStats,
    guest: TeamStats,
}

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
struct TeamStats {
    name: String,
    timeouts: u8,
    player_stats: Vec<PlayerStats>,
}

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
struct PlayerStats {
    number: u8,
    name: String,
    goals: u8,
    exclusions: u8,
}

#[derive(Clone, Copy, Default, PartialEq, Serialize)]
enum TimeoutState {
    #[default]
    Running,
    Cancelled,
}

#[derive(Serialize, Clone, Default)]
struct TimeStats {
    time: u32,
    phase: TimerPhase,
    quater: u8,
    is_running: bool,
    timeout_time: u32,
    timeout_state: TimeoutState,
}

impl TimeStats {
    fn new(time: u32) -> Self {
        Self {
            time,
            phase: TimerPhase::QuaterTime,
            quater: 1,
            is_running: false,
            timeout_time: 0,
            timeout_state: TimeoutState::Cancelled,
        }
    }

    fn decrement_time(&mut self, time_step: u32) {
        if self.time >= time_step {
            self.time -= time_step;
        } else {
            self.time = 0;
        }
    }

    fn decrement_timeout(&mut self, time_step: u32) {
        if self.timeout_time >= time_step {
            self.timeout_time -= time_step;
        } else {
            self.timeout_time = 0;
            self.timeout_state = TimeoutState::Cancelled;
        }
    }

    fn set_time(&mut self, app: AppHandle, new_time: u32) {
        self.time = new_time;
        self.send_update(app)
    }

    fn set_quater(&mut self, app: AppHandle, new_quater: u8) {
        self.quater = new_quater;
        self.send_update(app);
    }

    fn toggle_timer(&mut self, app: AppHandle) {
        self.is_running = !self.is_running;
        self.send_update(app.clone());
    }

    fn run_timer(&mut self, app: AppHandle, _time_step: u8) {
        if self.time == 0 {
            self.next_phase(app.clone());
        }

        if !self.is_running {
            return;
        }

        if self.timeout_state == TimeoutState::Running {
            self.decrement_timeout(_time_step as u32);
        } else {
        self.decrement_time(_time_step as u32);
        }
        self.send_update(app.clone());
    }

    fn next_phase(&mut self, app: AppHandle) {
        if self.quater == 4 {
            return;
        }

        let long_pause = app
            .try_state::<AppState>()
            .expect("error while getting app state")
            .settings
            .lock()
            .unwrap()
            .long_pause_length
            .lock()
            .unwrap()
            .clone();

        let short_pause = app
            .try_state::<AppState>()
            .expect("error while getting app state")
            .settings
            .lock()
            .unwrap()
            .short_pause_length
            .lock()
            .unwrap()
            .clone();

        let quater_length = app
            .try_state::<AppState>()
            .expect("error while getting app state")
            .settings
            .lock()
            .unwrap()
            .quater_length
            .lock()
            .unwrap()
            .clone();
        match self.phase {
            TimerPhase::QuaterTime => {
                self.phase = TimerPhase::Pause;
                if self.quater == 2 {
                    self.time = long_pause;
                } else {
                    self.time = short_pause;
                }
            }
            TimerPhase::Pause => {
                self.phase = TimerPhase::QuaterTime;
                self.quater += 1;
                self.time = quater_length;
                self.is_running = false;
            }
        }
        self.send_update(app);
    }


    fn toggle_timeout(&mut self, app: AppHandle) {
        match self.timeout_state {
            TimeoutState::Running => {
                self.is_running = false;
                self.timeout_state = TimeoutState::Cancelled;
            }
            TimeoutState::Cancelled => {
                self.is_running = true;
                self.timeout_time = app
                    .try_state::<AppState>()
                    .expect("error while getting app state")
                    .settings
                    .lock()
                    .unwrap()
                    .timeout_length
                    .lock()
                    .unwrap()
                    .clone();
                self.timeout_state = TimeoutState::Running;
            }
        }
        self.send_update(app);
    }

    fn send_update(&self, app: AppHandle) {
        app.emit_all("update_time_stats", self).unwrap();
    }
}

impl MatchStats {
    fn new() -> Self {
        Self {
            home: TeamStats::new(true),
            guest: TeamStats::new(false),
        }
    }

    fn increase_goals(&mut self, app: AppHandle, team: &str, index: u8) {
        let team_stats = if team == "home" {
            &mut self.home
        } else {
            &mut self.guest
        };

        let player_stats = &mut team_stats.player_stats[index as usize];
        player_stats.increase_goals();
        self.send_update(app);
    }

    fn decrease_goals(&mut self, app: AppHandle, team: &str, index: u8) {
        let team_stats = if team == "home" {
            &mut self.home
        } else {
            &mut self.guest
        };

        let player_stats = &mut team_stats.player_stats[index as usize];
        if player_stats.goals > 0 {
            player_stats.decrease_goals();
        }

        self.send_update(app);
    }

    fn increase_exclusions(&mut self, app: AppHandle, team: &str, index: u8) {
        let team_stats = if team == "home" {
            &mut self.home
        } else {
            &mut self.guest
        };

        let player_stats = &mut team_stats.player_stats[index as usize];
        if player_stats.exclusions == 3 {
            return;
        }
        player_stats.increase_exclusions();

        self.send_update(app);
    }
    fn decrease_exclusions(&mut self, app: AppHandle, team: &str, index: u8) {
        let team_stats = if team == "home" {
            &mut self.home
        } else {
            &mut self.guest
        };

        let player_stats = &mut team_stats.player_stats[index as usize];
        if player_stats.exclusions > 0 {
            player_stats.decrease_exclusions();
        }

        self.send_update(app);
    }

    fn increase_timeouts(&mut self, app: AppHandle, team: &str) {
        let team_stats = if team == "home" {
            &mut self.home
        } else {
            &mut self.guest
        };

        if team_stats.timeouts == 2 {
            return;
        }
        team_stats.timeouts += 1;
        self.send_update(app);
    }

    fn decrease_timeouts(&mut self, app: AppHandle, team: &str) {
        let team_stats = if team == "home" {
            &mut self.home
        } else {
            &mut self.guest
        };

        if team_stats.timeouts == 0 {
            return;
        }

        team_stats.timeouts -= 1;

        self.send_update(app);
    }

    fn change_name(&mut self, app: AppHandle, team: &str, index: u8, name: String) {
        let team_stats = if team == "home" {
            &mut self.home
        } else {
            &mut self.guest
        };

        let player_stats = &mut team_stats.player_stats[index as usize];
        player_stats.set_name(name);

        self.send_update(app);
    }

    fn reset(&mut self, app: AppHandle) {
        self.home = TeamStats::new(true);
        self.guest = TeamStats::new(false);

        self.send_update(app);
    }

    fn send_update(&self, app: AppHandle) {
        app.emit_all("update_match_stats", self).unwrap();
    }
}

impl TeamStats {
    fn new(heim: bool) -> Self {
        Self {
            name: if heim { "Heim" } else { "Gast" }.to_string(),
            timeouts: 0,
            player_stats: vec![
                PlayerStats::new(1, "Player 1".to_string()),
                PlayerStats::new(2, "Player 2".to_string()),
                PlayerStats::new(3, "Player 3".to_string()),
                PlayerStats::new(4, "Player 4".to_string()),
                PlayerStats::new(5, "Player 5".to_string()),
                PlayerStats::new(6, "Player 6".to_string()),
                PlayerStats::new(7, "Player 7".to_string()),
                PlayerStats::new(8, "Player 8".to_string()),
                PlayerStats::new(9, "Player 9".to_string()),
                PlayerStats::new(10, "Player 10".to_string()),
                PlayerStats::new(11, "Player 11".to_string()),
                PlayerStats::new(12, "Player 12".to_string()),
                PlayerStats::new(13, "Player 13".to_string()),
                PlayerStats::new(14, "Player 14".to_string()),
                PlayerStats::new(15, "Player 15".to_string()),
            ],
        }
    }
}
impl PlayerStats {
    fn new(number: u8, name: String) -> Self {
        Self {
            number,
            name,
            goals: 0,
            exclusions: 0,
        }
    }

    fn set_name(&mut self, name: String) {
        self.name = name;
    }

    fn set_number(&mut self, number: u8) {
        self.number = number;
    }

    fn increase_goals(&mut self) {
        self.goals += 1;
    }

    fn decrease_goals(&mut self) {
        if self.goals > 0 {
            self.goals -= 1;
        }
    }

    fn increase_exclusions(&mut self) {
        self.exclusions += 1;
    }

    fn decrease_exclusions(&mut self) {
        if self.exclusions > 0 {
            self.exclusions -= 1;
        }
    }

    fn reset(&mut self) {
        self.goals = 0;
        self.exclusions = 0;
    }
}

#[derive(Default, Clone, Copy, PartialEq, Serialize, Deserialize)]
enum TimerPhase {
    #[default]
    Pause,
    QuaterTime,
}

#[derive(Default, Clone)]
pub struct MatchSettings {
    quater_length: Arc<Mutex<u32>>,
    short_pause_length: Arc<Mutex<u32>>,
    long_pause_length: Arc<Mutex<u32>>,
    timeout_length: Arc<Mutex<u32>>,
}

#[derive(Default)]
pub struct AppState {
    settings: Arc<Mutex<MatchSettings>>,
    match_stats: Arc<Mutex<MatchStats>>,
    time_stats: Arc<Mutex<TimeStats>>,
}

#[command]
fn toggle_timer(app: AppHandle, state: tauri::State<AppState>) {
    state.time_stats.lock().unwrap().toggle_timer(app);
}

#[command]
fn toggle_timeout(app: AppHandle, state: tauri::State<AppState>) {
    state.time_stats.lock().unwrap().toggle_timeout(app);
}

    

#[command]
fn change_name(app: AppHandle, team: String, index: u8, name: String) {
    app.try_state::<AppState>()
        .expect("error while getting app state")
        .match_stats
        .lock()
        .unwrap()
        .change_name(app.clone(), &team, index, name);
}

#[tauri::command]
fn exit_app(app: AppHandle) {
    println!("Exiting app");
    app.exit(0);
}

#[command]
fn set_time(app: AppHandle, new_time: u32) {
    app.try_state::<AppState>()
        .expect("error while getting app state")
        .time_stats
        .lock()
        .unwrap()
        .set_time(app.clone(), new_time);
}

#[command]
fn set_quater(app: AppHandle, new_quater: u8) {
    app.try_state::<AppState>()
        .expect("error while getting app state")
        .time_stats
        .lock()
        .unwrap()
        .set_quater(app.clone(), new_quater);
}

#[command]
fn add_goal(app: AppHandle, team: String, index: u8) {
    app.try_state::<AppState>()
        .expect("error while getting app state")
        .match_stats
        .lock()
        .unwrap()
        .increase_goals(app.clone(), &team, index);
}

#[command]
fn remove_goal(app: AppHandle, team: String, index: u8) {
    app.try_state::<AppState>()
        .expect("error while getting app state")
        .match_stats
        .lock()
        .unwrap()
        .decrease_goals(app.clone(), &team, index);
}

#[command]
fn add_exclusion(app: AppHandle, team: String, index: u8) {
    app.try_state::<AppState>()
        .expect("error while getting app state")
        .match_stats
        .lock()
        .unwrap()
        .increase_exclusions(app.clone(), &team, index);
}

#[command]
fn remove_exclusion(app: AppHandle, team: String, index: u8) {
    app.try_state::<AppState>()
        .expect("error while getting app state")
        .match_stats
        .lock()
        .unwrap()
        .decrease_exclusions(app.clone(), &team, index);
}

#[command]
fn add_timeout(app: AppHandle, team: String) {
    app.try_state::<AppState>()
        .expect("error while getting app state")
        .match_stats
        .lock()
        .unwrap()
        .increase_timeouts(app.clone(), &team);
}

#[command]
fn remove_timeout(app: AppHandle, team: String) {
    app.try_state::<AppState>()
        .expect("error while getting app state")
        .match_stats
        .lock()
        .unwrap()
        .decrease_timeouts(app.clone(), &team);
}

#[command]
fn reset_match(app: AppHandle) {
    app.try_state::<AppState>()
        .expect("error while getting app state")
        .match_stats
        .lock()
        .unwrap()
        .reset(app.clone());
}

#[command]
fn start_match(app: AppHandle) {
    app.get_window("main")
        .expect("error while getting main window")
        .hide()
        .expect("error while hiding main window");

    app.get_window("scoreboard")
        .expect("error while getting main window")
        .show()
        .expect("error while showing main window");

    app.get_window("controlboard")
        .expect("error while getting controlboard window")
        .show()
        .expect("error while showing controlboard window");
}

#[command]
fn save_settings(app: AppHandle, quatertime: u32, shortpause: u32, longpause: u32, timeout: u32) {
    let app_state = app
        .try_state::<AppState>()
        .expect("error while getting app state");

    let settings = app_state.settings.lock().unwrap();

    *settings.quater_length.lock().unwrap() = quatertime;
    *settings.short_pause_length.lock().unwrap() = shortpause;
    *settings.long_pause_length.lock().unwrap() = longpause;
    *settings.timeout_length.lock().unwrap() = timeout;

    app_state
        .time_stats
        .lock()
        .unwrap()
        .set_time(app.clone(), quatertime);
}

fn main() {
    let match_settings = MatchSettings {
        quater_length: Arc::new(Mutex::new(8 * 60 * 1000)), //* 100
        short_pause_length: Arc::new(Mutex::new(2 * 60 * 1000)),
        long_pause_length: Arc::new(Mutex::new(3 * 60 * 1000)),
        timeout_length: Arc::new(Mutex::new(1 * 60 * 1000)),
    };

    let app = Builder::default()
        .manage(AppState {
            settings: Arc::new(Mutex::new(match_settings.clone())),
            time_stats: Arc::new(Mutex::new(TimeStats::new(
                *match_settings.quater_length.lock().unwrap(),
            ))),
            match_stats: Arc::new(Mutex::new(MatchStats::new())),
        })
        .invoke_handler(generate_handler![
            toggle_timer,
            toggle_timeout,
            set_time,
            set_quater,
            add_goal,
            remove_goal,
            add_exclusion,
            remove_exclusion,
            add_timeout,
            remove_timeout,
            reset_match,
            start_match,
            save_settings,
            change_name,
            exit_app
        ])
        .setup(|app| {
            const TIME_STEP: u8 = 10;
            let app_handle = app.handle();
            let app_handle_clone = app_handle.clone();

            tauri::async_runtime::spawn(async move {
                let mut interval = interval(tokio::time::Duration::from_millis(TIME_STEP.into()));

                loop {
                    interval.tick().await;

                    timer_task(app_handle.clone(), TIME_STEP).await;
                }
            });
            Ok(())
        })
        .build(generate_context!())
        .expect("error while building tauri application");

    app.get_window("scoreboard".into())
        .expect("error while getting scoreboard window")
        .hide()
        .expect("error while hiding scoreboard window");

    app.get_window("controlboard".into())
        .expect("error while getting controlboard window")
        .hide()
        .expect("error while hiding controlboard window");

    app.run(|_, _| {});
}

async fn timer_task(app_handle: AppHandle, time_step: u8) {
    app_handle
        .try_state::<AppState>()
        .expect("error while getting app state")
        .time_stats
        .lock()
        .unwrap()
        .run_timer(app_handle.clone(), time_step);
}
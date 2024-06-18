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
    Paused,
    Cancelled,
}

#[derive(Clone, Default, Serialize)]
struct TimeoutStats {
    time: u32,
    state: TimeoutState,
}

impl TimeoutStats {
    fn new(app: AppHandle) -> Self {
        Self {
            time: app
                .try_state::<AppState>()
                .expect("error while getting app state")
                .settings
                .lock()
                .unwrap()
                .timeout_length
                .lock()
                .unwrap()
                .clone(),
            state: TimeoutState::Running,
        }
    }

    fn decrement_time(&mut self, time_step: u32) {
        if self.time >= time_step {
            self.time -= time_step;
        } else {
            self.time = 0;
        }
    }

    fn run_timer(&mut self, app: AppHandle, time_step: u8) {

        if self.time == 0 {
            self.state = TimeoutState::Cancelled;
            app.try_state::<AppState>()
                .expect("error while getting app state")
                .time_stats
                .lock()
                .unwrap()
                .send_update(app.clone());
            return;
        }

        if self.state != TimeoutState::Running {
            return;
        }

        self.decrement_time(time_step as u32);

        if self.time % 10 == 0 {
            self.send_update(app);
        }

    }

    fn toggle_timer(&mut self) {
        self.state = match self.state {
            TimeoutState::Running => TimeoutState::Paused,
            TimeoutState::Paused => TimeoutState::Running,
            TimeoutState::Cancelled => TimeoutState::Cancelled,
        };
    }

    fn set_time(&mut self,app: AppHandle, new_time: u32) {
        self.time = new_time;
        self.send_update(app)
    }

    fn send_update(&self, app: AppHandle) {
        app.get_window("scoreboard")
            .expect("error while getting main window")
            .emit("update_timeout_stats", self)
            .unwrap();
    }
}

#[derive(Serialize, Deserialize, Clone, Default)]
struct TimeStats {
    time: u32,
    phase: TimerPhase,
    quater: u8,
    is_running: bool,
}

impl TimeStats {
    fn new(time: u32) -> Self {
        Self {
            time,
            phase: TimerPhase::QuaterTime,
            quater: 1,
            is_running: false,
        }
    }

    fn decrement_time(&mut self, time_step: u32) {
        if self.time >= time_step {
            self.time -= time_step;
        } else {
            self.time = 0;
        }
    }

    fn set_time(&mut self,app: AppHandle, new_time: u32) {
        self.time = new_time;
        self.send_update(app)
    }

    fn set_quater(&mut self, app: AppHandle, new_quater: u8) {
        self.quater = new_quater;
        self.send_update(app);
    }

    fn toggle_timer(&mut self) {
        self.is_running = !self.is_running;
        println!("timer toggled");
        println!("timer is running: {}", self.is_running);
    }

    fn run_timer(&mut self, app: AppHandle, _time_step: u8) {

        if self.time == 0 {
            self.next_phase(app.clone());
        }

        if !self.is_running {
            return;
        }
        // println!("decrementing time by: {} to {}", _time_step, self.time);
        self.decrement_time(_time_step as u32);
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

    fn send_update(&self, app: AppHandle) {
        app.get_window("scoreboard")
            .expect("error while getting main window")
            .emit("update_time_stats", self)
            .unwrap();
    }
}

impl MatchStats {
    fn new() -> Self {
        Self {
            home: TeamStats::new(),
            guest: TeamStats::new(),
        }
    }

    fn increase_goals(&mut self, app: AppHandle, team: &str, index: u8) {
        let team_stats = if team == "home" {
            &mut self.home
        } else {
            &mut self.guest
        };

        let player_stats = &mut team_stats.player_stats[index as usize];
        player_stats.goals += 1;

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
            player_stats.goals -= 1;
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
        player_stats.exclusions += 1;

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
            player_stats.exclusions -= 1;
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

    fn reset(&mut self, app: AppHandle) {
        self.home = TeamStats::new();
        self.guest = TeamStats::new();

        self.send_update(app);
    }

    fn send_update(&self, app: AppHandle) {
        app.get_window("scoreboard")
            .expect("error while getting main window")
            .emit("update_match_stats", self)
            .unwrap();
    }
}

impl TeamStats {
    fn new() -> Self {
        Self {
            name: "Team".to_string(),
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
    timeout_stats: Arc<Mutex<TimeoutStats>>,
}

#[command]
fn toggle_timer(state: tauri::State<AppState>) {
    if state.timeout_stats.lock().unwrap().state != TimeoutState::Cancelled {
        state.timeout_stats.lock().unwrap().toggle_timer();
        return;
    }
    state.time_stats.lock().unwrap().toggle_timer();
}

#[command]
fn set_time(app: AppHandle, new_time: u32, is_timeout: bool) {

    if is_timeout {
        app.try_state::<AppState>()
            .expect("error while getting app state")
            .timeout_stats
            .lock()
            .unwrap().set_time(app.clone(), new_time);
        return;
    }

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
fn toggle_timeout(app: AppHandle) {
    let app_state = app
        .try_state::<AppState>()
        .expect("error while getting app state");
    app_state.time_stats.lock().unwrap().is_running = false;

    let mut timeout_stats = app_state.timeout_stats.lock().unwrap();
    

    if timeout_stats.state == TimeoutState::Running || timeout_stats.state == TimeoutState::Paused {
        timeout_stats.state = TimeoutState::Cancelled;
        app_state.time_stats.lock().unwrap().send_update(app.clone());
        return;
    }

    timeout_stats.time = app_state
        .settings
        .lock()
        .unwrap()
        .timeout_length
        .lock()
        .unwrap()
        .clone();

    timeout_stats.state = TimeoutState::Running;
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
        .expect("error while getting main window").hide().expect("error while hiding main window");

    app.get_window("scoreboard")
        .expect("error while getting main window").show().expect("error while showing main window");

    app.get_window("controlboard").expect("error while getting controlboard window").show().expect("error while showing controlboard window");
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

    app_state.time_stats.lock().unwrap().set_time(app.clone(), quatertime);
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
            timeout_stats: Arc::new(Mutex::new(TimeoutStats::default())),
        })
        .invoke_handler(generate_handler![
            toggle_timer,
            set_time,
            set_quater,
            add_goal,
            remove_goal,
            add_exclusion,
            remove_exclusion,
            add_timeout,
            remove_timeout,
            reset_match,
            toggle_timeout,
            start_match,
            save_settings
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

            tauri::async_runtime::spawn(async move {
                let mut interval = interval(tokio::time::Duration::from_millis(TIME_STEP.into()));

                let timeout_state = app_handle_clone
                    .try_state::<AppState>()
                    .expect("error while getting app state")
                    .timeout_stats
                    .lock()
                    .unwrap()
                    .state;
                loop {
                    interval.tick().await;

                    if timeout_state == TimeoutState::Cancelled {
                        break;
                    }

                    timeout_task(app_handle_clone.clone(), TIME_STEP).await;
                }
            });

            Ok(())
        })
        .build(generate_context!())
        .expect("error while building tauri application");

    // app.get_window("main".into())
    //     .expect("error while getting main window")
    //     .hide()
    //     .expect("error while showing main window");
    app.get_window( "scoreboard".into()).expect("error while getting scoreboard window").hide().expect("error while hiding scoreboard window");
    app.get_window("controlboard".into()).expect("error while getting controlboard window").hide().expect("error while hiding controlboard window");

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

async fn timeout_task(app_handle: AppHandle, time_step: u8) {
    app_handle
        .try_state::<AppState>()
        .expect("error while getting app state")
        .timeout_stats
        .lock()
        .unwrap()
        .run_timer(app_handle.clone(), time_step);
}

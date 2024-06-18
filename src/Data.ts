export interface Team {
  name: string;
  score: number;
  players: Player[];
  timeouts: number;
}

export interface Player {
  name: string;
  number: number;
  exclusions: number;
  goals: number;
}

export enum TeamEnum {
  home = "home",
  guest = "guest",
}


export interface MatchStats {
  home: TeamStats;
  guest: TeamStats;
}

export interface TeamStats {
  name: string;
  timeouts: number;
  player_stats: PlayerStats[];
}

export interface PlayerStats {
  number: number;
  name: string;
  goals: number;
  exclusions: number;
}

export interface TimeStats {
  time: number;
  quater: number;
}

export interface TimeoutStats{

  time: number;
  state: TimeoutState,
}

export enum TimeoutState {
  started,
  paused,
  canceled,
}
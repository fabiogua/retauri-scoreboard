export interface Team {
  name: string;
  score: number;
  players: Player[];
  side: TeamEnum;
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

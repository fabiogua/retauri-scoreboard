interface Team {
  name: string;
  score: number;
  players: Player[];
}

interface Player {
  name: string;
  number: number;
  exclusions: number;
  goals: number;
}

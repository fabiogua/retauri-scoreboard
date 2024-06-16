import { invoke } from "@tauri-apps/api";
import "./Player.css";
import { Player, TeamEnum } from "../Data";

function PlayerUi({ player, team }: { player: Player; team: TeamEnum }) {
  const incrementPlayerExclusions = async (
    team: TeamEnum,
    playerNumber: number
  ) => {
    if (player.exclusions == 3) return;

    await invoke("update_exclusions", {
      team,
      index: playerNumber - 1,
      exclusions: player.exclusions + 1,
    });
  };

  const decrementPlayerExclusions = async (
    team: TeamEnum,
    playerNumber: number
  ) => {
    if (player.exclusions == 0) return;
    await invoke("update_exclusions", {
      team,
      index: playerNumber - 1,
      exclusions: player.exclusions - 1,
    });
  };

  const incrementPlayerGoals = async (team: TeamEnum, playerNumber: number) => {
    console.log("incrementing goals" + player.goals );

    await invoke("update_goals", {
      team,
      index: playerNumber - 1,
      goals: player.goals + 1,
    });
  };

  const decrementPlayerGoals = async (team: TeamEnum, playerNumber: number) => {
    if (player.goals == 0) return;
    await invoke("update_goals", {
      team,
      index: playerNumber - 1,
      goals: player.goals - 1,
    });
  };

  return (
    <div className="player">
      <div className="player-number">
        <span>{player.number}</span>
      </div>
      <div className="player-name">
        <span>{player.name}</span>
      </div>
      <div className="player-exclusions">
        <span>{player.exclusions}</span>
        <button onClick={() => incrementPlayerExclusions(team, player.number)}>
          +
        </button>
        <button onClick={() => decrementPlayerExclusions(team, player.number)}>
          -
        </button>
      </div>
      <div className="player-goals">
        <span className="goals">{player.goals}</span>
        <button onClick={() => incrementPlayerGoals(team, player.number)}>
          +
        </button>
        <button onClick={() => decrementPlayerGoals(team, player.number)}>
          -
        </button>
      </div>
    </div>
  );
}

export default PlayerUi;

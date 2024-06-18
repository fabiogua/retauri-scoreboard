import { invoke } from "@tauri-apps/api";
import "../styles/Player.css";
import { Player, TeamEnum } from "../Data";

function PlayerUi({ player, team }: { player: Player; team: TeamEnum }) {
  const addExclusion = async (
    team: TeamEnum,
    playerNumber: number
  ) => {
    await invoke("add_exclusion", {
      team,
      index: playerNumber - 1,
    });
  };

  const removeExclusion = async (
    team: TeamEnum,
    playerNumber: number
  ) => {
    await invoke("remove_exclusion", {
      team,
      index: playerNumber - 1,
    });
  };

  const addGoal = async (team: TeamEnum, playerNumber: number) => {
    await invoke("add_goal", {
      team,
      index: playerNumber - 1,
    });
  };

  const removeGoal = async (team: TeamEnum, playerNumber: number) => {
    if (player.goals == 0) return;
    await invoke("remove_goal", {
      team,
      index: playerNumber - 1,
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
        <button onClick={() => addExclusion(team, player.number)}>
          +
        </button>
        <span>{player.exclusions}</span>
        <button onClick={() => removeExclusion(team, player.number)}>
          -
        </button>
      </div>
      <div className="player-goals">
        <button onClick={() => addGoal(team, player.number)}>
          +
        </button>
        <span className="goals">{player.goals}</span>
        <button onClick={() => removeGoal(team, player.number)}>
          -
        </button>
      </div>
    </div>
  );
}

export default PlayerUi;

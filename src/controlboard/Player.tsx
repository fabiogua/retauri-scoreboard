import { invoke } from "@tauri-apps/api";
import { Player, TeamEnum } from "../Data";
import IncrementComponent from "./IncrementComponent";

import "../styles/Player.css";

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
    <tr className="player">
      <td className="player-number">
        <span>{player.number}</span>
      </td>
      {/* <td className="player-name">
        <input type="text" value={tmpName} onBlur={changeName} onChange={(event) => setTmpName(event.target.value)} />
      </td> */}
      <td className="player-exclusions">
      <IncrementComponent value={player.exclusions} max={3} increment={() => addExclusion(team, player.number)} decrement={() => removeExclusion(team, player.number)} />
      </td>
      <td className="player-goals">
      <IncrementComponent value={player.goals} digit={2} increment={() => addGoal(team, player.number)} decrement={() => removeGoal(team, player.number)} />
      </td>
    </tr>
  );
}

export default PlayerUi;

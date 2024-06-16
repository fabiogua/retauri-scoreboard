import { invoke } from "@tauri-apps/api";
import { Team } from "../Data";
import PlayerUi from "./Player";
import "./Team.css";

function TeamUi({ team }: { team: Team }) {
  const incrementTimeout = async (team: Team) => {
    if (team.timeouts == 2) return;
    team.timeouts += 1;

    await invoke("update_timeouts", {
      team: team.side,
      timeouts: team.timeouts,
    });
  };

  const decrementTimeout = async (team: Team) => {
    if (team.timeouts == 0) return;
    team.timeouts -= 1;

    await invoke("update_timeouts", {
      team: team.side,
      timeouts: team.timeouts,
    });
  };

  return (
    <div className="team">
      <div className="team-header">
        <h1>{team.score}</h1>
        <h1>{team.name}</h1>
        <div className="player-exclusions">
          <h2>Timeout: {team.timeouts}</h2>
          <button onClick={() => incrementTimeout(team)}>+</button>
          <button onClick={() => decrementTimeout(team)}>- </button>
        </div>
      </div>
      <div className="player-list">
        {team.players.map((player) => (
          <PlayerUi player={player} team={team.side} />
        ))}
      </div>
    </div>
  );
}

export default TeamUi;

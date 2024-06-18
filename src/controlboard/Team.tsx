import { invoke } from "@tauri-apps/api";
import { Team, TeamEnum } from "../Data";
import PlayerUi from "./Player";
import "../styles/Team.css";

function TeamUi({ team, side }: { team: Team; side: TeamEnum }) {
  const addTimeout = async () => {
    await invoke("add_timeout", {
      team: side,
    });
  };

  const removeTimeout = async () => {
    await invoke("remove_timeout", {
      team: side,
    });
  };

  return (
    <div className="team">
      <div className="team-header">
        <h1>{team.score}</h1>
        <h1>{team.name}</h1>
        <div className="player-exclusions">
          <h2>Timeout: {team.timeouts}</h2>
          <button onClick={() => addTimeout()}>+</button>
          <button onClick={() => removeTimeout()}>- </button>
        </div>
      </div>
      <div className="player-list">
        <div className="player-header player">
          <span>Player</span>
          <span>Name</span>
          <span>Exclusions</span>
          <span>Goals</span>
        </div>
        {team.players.map((player) => (
          <PlayerUi player={player} team={side} />
        ))}
      </div>
    </div>
  );
}

export default TeamUi;

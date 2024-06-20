import { invoke } from "@tauri-apps/api";
import { Team, TeamEnum } from "../Data";
import PlayerUi from "./Player";
import IncrementComponent from "./IncrementComponent";

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
        <IncrementComponent
          value={team.timeouts}
          max={2}
          increment={addTimeout}
          decrement={removeTimeout}
        />
      </div>
      <table className="player-list">
        <thead>
          <tr>
            <th>Nr</th>
            {/* <th>Name</th> */}
            <th>Ausschlussfehler</th>
            <th>Tore</th>
          </tr>
        </thead>
        <tbody>
          {team.players.map((player) => (
            <PlayerUi player={player} team={side} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeamUi;

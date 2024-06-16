import { Team } from "../Data";
import PlayerUi from "./Player";

function TeamUi( {team}: {team: Team}) {
  return (
    <div className="team">
      <h2>{team.name}</h2>
      <h3>{team.score}</h3>
      <div>
        {team.players.map((player) => (
          <PlayerUi player={player}/>
        ))}
      </div>
    </div>
  );
}

export default TeamUi;

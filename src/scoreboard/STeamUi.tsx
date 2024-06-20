import { Team } from "../Data";
import PlayerUi from "./SPlayerUi";
import "../styles/Team.css";

function STeamUi({ team }: { team: Team }) {
  return (
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
          <PlayerUi player={player} />
        ))}
      </tbody>
    </table>
  );
}

export default STeamUi;

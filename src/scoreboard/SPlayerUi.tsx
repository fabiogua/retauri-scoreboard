import { Player } from "../Data";

import "../styles/Player.css";
import ExclusionUi from "./SExclusionUi";

function SPlayerUi({ player }: { player: Player }) {
  return (
    <tr className="player">
      <td className="player-number">
        <span>{player.number}</span>
      </td>
      {/* <td className="player-name">
        <span>{player.name}</span>
      </td> */}
      <td className="player-exclusions">
        <ExclusionUi value={player.exclusions} />
      </td>
      <td className="player-goals">
        <span>{player.goals}</span>
      </td>
    </tr>
  );
}

export default SPlayerUi;

import { Player } from "../Data";
import "./Player.css";

function PlayerUi({ player }: { player: Player}) {

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
      </div>
      <div className="player-goals">
        <span>{player.goals}</span>
      </div>
    </div>
  );
}

export default PlayerUi;

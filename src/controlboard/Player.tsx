import { useState } from "react";
import "./Scoreboard.css";

function Player() {

  const [name, setName] = useState("");
  const [number, setNumber] = useState(0);
  const [exclusions, setExclusions] = useState(0);
  const [goals, setGoals] = useState(0);

  return (
    <div className="player">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Player name"
      />
      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(parseInt(e.target.value))}
        placeholder="Number"
      />
      <input
        type="number"
        value={exclusions}
        onChange={(e) => setExclusions(parseInt(e.target.value))}
        placeholder="Exclusions"
      />
      <input
        type="number"
        value={goals}
        onChange={(e) => setGoals(parseInt(e.target.value))}
        placeholder="Goals"
      />
    </div>
  );
}

export default Player;

import { useState } from "react";
import "./MatchInfo.css";
import { invoke } from "@tauri-apps/api";

function MatchInfo({ time }: { time: string }) {
  const [period] = useState(1);

  const toggle_timer = async () => {
    console.log("Toggling timer");
    await invoke("toggle_timer");
  };

  const increasePeriod = async () => {
    if (period == 4) return;

    await invoke("update_period", {
      period: period + 1,
    });
  };

  const decreasePeriod = async () => {
    if (period == 1) return;
    await invoke("update_period", {
      period: period - 1,
    });
  };

  return (
    <div className="match-info">
      <div className="match-info-time">
        <div className="time">
          <h1>{time}</h1>
          <button onClick={toggle_timer}>Toggle</button>
        </div>
        <div className="period">
          <h3>{period}</h3>
          <button onClick={increasePeriod}>+</button>
          <button onClick={decreasePeriod}>-</button>
        </div>
      </div>
    </div>
  );
}

export default MatchInfo;

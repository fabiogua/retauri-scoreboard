import { useState } from "react";
import"../styles/MatchInfo.css";

function MatchInfo({ time }: { time: string }) {
  const [period] = useState(1);

  return (
    <div className="match-info">
      <div className="match-info-time">
        <div className="time">
          <h1>{time}</h1>
        </div>
        <div className="period">
          <h3>{period}</h3>
        </div>
      </div>
    </div>
  );
}

export default MatchInfo;

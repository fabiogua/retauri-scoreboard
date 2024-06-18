import"../styles/MatchInfo.css";

function MatchInfo({ time, quater }: { time: string, quater: number}) {

  return (
    <div className="match-info">
      <div className="match-info-time">
        <div className="time">
          <h1>{time}</h1>
        </div>
        <div className="period">
          <h3>{quater}</h3>
        </div>
      </div>
    </div>
  );
}

export default MatchInfo;

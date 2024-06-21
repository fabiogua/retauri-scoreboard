import { Team, TeamEnum } from "../Data";
import SMatchInfoTeam from "./SMatchInfoTeam";
import "../styles/MatchInfo.css";

function SMatchInfo({
  time,
  quater,
  homeTeam,
  guestTeam,
}: {
  time: string;
  quater: number;
  homeTeam: Team;
  guestTeam: Team;
}) {
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
      <div className="match-info-teams">
        <SMatchInfoTeam
        src="assets/logos/nuernberg.png"
          side={TeamEnum.home}
          name={homeTeam.name}
          score={homeTeam.score}
        />
        <SMatchInfoTeam
          side={TeamEnum.guest}
          name={guestTeam.name}
          score={guestTeam.score}
          src="assets/logos/nuernberg.png"
        />
      </div>
    </div>
  );
}

export default SMatchInfo;

import { useEffect, useState } from "react";
import "../styles/Controlboard.css";
import { listen } from "@tauri-apps/api/event";
import TeamUi from "./STeamUi";
import {
  MatchStats,
  Team,
  TeamStats,
  TimeStats,
  TimeoutStats,
} from "../Data";
import MatchInfo from "./SMatchInfo";

function Scoreboard() {
  const [homeTeam, setHomeTeam] = useState<Team>({
    name: "Heim",
    score: 0,
    timeouts: 0,
    players: [...Array(15)].map((_, i) => {
      return {
        name: `Player ${i + 1}`,
        number: i + 1,
        goals: 0,
        exclusions: 0,
      };
    }),
  });

  const [guestTeam, setGuestTeam] = useState<Team>({
    name: "Gast",
    score: 0,
    timeouts: 0,
    players: [...Array(15)].map((_, i) => {
      return {
        name: `Player ${i + 1}`,
        number: i + 1,
        goals: 0,
        exclusions: 0,
      };
    }),
  });

  const mapTeamStatsToTeam = (teamStats: TeamStats): Team => {
    return {
      name: teamStats.name,
      score: teamStats.player_stats.reduce(
        (acc, player) => acc + player.goals,
        0
      ),
      timeouts: teamStats.timeouts,
      players: teamStats.player_stats,
    };
  };

  const [time, setTime] = useState("08:00");
  const [quater, setQuater] = useState(1);

  useEffect(() => {
    const unlistenMatchStats = listen("update_match_stats", (event: any) => {
      const payload: MatchStats = event.payload;

      const home = mapTeamStatsToTeam(payload.home as TeamStats);
      const guest = mapTeamStatsToTeam(payload.guest as TeamStats);

      setHomeTeam(home);
      setGuestTeam(guest);
    });

    const updateTimeStats = listen("update_time_stats", (event: any) => {
      const payload: TimeStats = event.payload;

      var timeToUse = payload.time;

      if (payload.timeout_state === "Running")
        timeToUse = payload.timeout_time;

      if (timeToUse < 60 * 1000) {
        const timeInTenMiliseconds = timeToUse / 10;
        const tenSeconds = Math.floor(timeInTenMiliseconds / 1000);
        const seconds = Math.floor((timeInTenMiliseconds % 1000) / 100);
        const tenMiliseconds = Math.floor((timeInTenMiliseconds % 100) / 10);
        const miliseconds = Math.floor(timeInTenMiliseconds % 10);

        setTime(`${tenSeconds}${seconds}:${tenMiliseconds}${miliseconds}`);
      } else {
        const timeInSec = timeToUse / 1000;

        const tenMinutes = Math.floor(timeInSec / 600);
        const minutes = Math.floor(timeInSec / 60);

        const tenSeconds = Math.floor((timeInSec % 60) / 10);
        const seconds = Math.floor((timeInSec % 60) % 10);

        setTime(`${tenMinutes}${minutes}:${tenSeconds}${seconds}`);
      }
      setQuater(payload.quater);
    });

    return () => {
      updateTimeStats.then((f) => f());
      unlistenMatchStats.then((f) => f());
    };
  }, []);

  return (
    <div className="scoreboard">
      <TeamUi team={homeTeam}  />
      <MatchInfo 
        homeTeam={homeTeam}
        guestTeam={guestTeam}
        time={time}
        quater={quater}
      />
      <TeamUi team={guestTeam}  />
    </div>
  );
}

export default Scoreboard;

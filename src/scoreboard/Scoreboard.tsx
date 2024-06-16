import { useEffect, useState } from "react";
import "./Scoreboard.css";
import { listen } from "@tauri-apps/api/event";
import TeamUi from "./Team";
import { Team, TeamEnum } from "../Data";
import MatchInfo from "./MatchInfo";

function Controlboard() {
 
  const [homeTeam, setHomeTeam] = useState<Team>({
    name: "Home Team",
    score: 0,
    side: TeamEnum.home,
    timeouts: 0,
    players: [...Array(13)].map((_, i) => {
      return {
        name: `Player ${i + 1}`,
        number: i + 1,
        goals: 0,
        exclusions: 0,
      };
    }),
  });

  const [guestTeam, setGuestTeam] = useState<Team>({
    name: "Guest Team",
    score: 0,
    side: TeamEnum.guest,
    timeouts: 0,
    players: [...Array(13)].map((_, i) => {
      return {
        name: `Player ${i + 1}`,
        number: i + 1,
        goals: 0,
        exclusions: 0,
      };
    }),
  });

  const [time, setTime] = useState("00:00");

  useEffect(() => {
    const unlistenExclusion = listen(
      "update_exclusions",
      (event: any) => {
        const payload = event.payload;
        const team = payload.team === "home" ? homeTeam : guestTeam;
        const players = team.players;
        players[payload.index].exclusions = payload.exclusions;
        payload.team === "home"
          ? setHomeTeam({ ...team, players: [...players] })
          : setGuestTeam({ ...team, players: [...players] });
      }
    );

    const unlistenGoal = listen("update_goals", (event: any) => {
      const payload = event.payload;
      const team = payload.team === "home" ? homeTeam : guestTeam;
      const players = team.players;
      players[payload.index].goals = payload.goals;
      team.score = players.reduce((acc, player) => acc + player.goals, 0);
      payload.team === "home"
        ? setHomeTeam({ ...team, players: [...players] })
        : setGuestTeam({ ...team, players: [...players] });
    });

    const unlistenTimeout = listen("update_timeouts", (event: any) => {
      const payload = event.payload;
      const team = payload.team === "home" ? homeTeam : guestTeam;
      team.timeouts = payload.timeouts;
      payload.team === "home"
        ? setHomeTeam({ ...team })
        : setGuestTeam({ ...team });
    }
    );

    const updateTime = listen("update_time", (event: any) => {
      const payload = event.payload;
      setTime(payload);
    });


    return () => {
      unlistenExclusion.then((f) => f());
      unlistenGoal.then((f) => f());
      unlistenTimeout.then((f) => f());
      updateTime.then((f) => f());
    };
  }, []);

  return (
    <div>
      <h1>Score Controller</h1>
      <div className="teams">
        <TeamUi team={homeTeam} />
        <MatchInfo time={time}/>
        <TeamUi team={guestTeam}/>
      </div>
    </div>
  );
}

export default Controlboard;

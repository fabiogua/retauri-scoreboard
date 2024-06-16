import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import TeamUi from "./Team";
import { Team, TeamEnum } from "../Data";

function Scoreboard() {

  const [homeTeam, setHomeTeam] = useState<Team>({
    name: "Home Team",
    score: 0,
    side: TeamEnum.home,
    players: [...Array(13)].map((_, i) => {
      return {
        number: i + 1,
        name: `Player ${i + 1}`,
        goals: 0,
        exclusions: 0,
      };
    }),
  });

  const [guestTeam, setGuestTeam] = useState({
    name: "Guest Team",
    score: 0,
    side: TeamEnum.guest,
    players: [...Array(13)].map((_, i) => {
      return {
        number: i + 1,
        name: `Player ${i + 1}`,
        goals: 0,
        exclusions: 0,
      };
    }),
  });

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

    return () => {
      unlistenExclusion.then((f) => f());
      unlistenGoal.then((f) => f());
    };
  }, []);

  return (
      <div className="teams">
        <TeamUi team={homeTeam} />
        <TeamUi team={guestTeam}/>
      </div>
  );
}

export default Scoreboard;

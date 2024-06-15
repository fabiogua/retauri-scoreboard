import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

function Scoreboard() {
  const [homeScore, setHomeScore] = useState(0);
  const [guestScore, setGuestScore] = useState(0);
  const [homePlayers, setHomePlayers] = useState<Player[]>(
    [...Array(13).keys()].map((i) => ({
      name: `Player ${i}`,
      number: i,
      exclusions: 0,
      goals: 0,
    }))
  );
  const [guestPlayers, setGuestPlayers] = useState<Player[]>(
    [...Array(13).keys()].map((i) => ({
      name: `Player ${i}`,
      number: i,
      exclusions: 0,
      goals: 0,
    }))
  );

  useEffect(() => {
    const unlistenScore = listen("update_score", (event: any) => {
      event.payload.team === "home"
        ? setHomeScore(event.payload.score)
        : setGuestScore(event.payload.score);
    });

    const unlistenExclusion = listen(
      "update_player_exclusions",
      (event: any) => {
        const { team, index, exclusions } = event.payload;

        const players = team === "home" ? homePlayers : guestPlayers;
        players[index].exclusions = exclusions;
        team === "home"
          ? setHomePlayers([...players])
          : setGuestPlayers([...players]);
      }
    );

    const unlistenGoal = listen("update_player_goals", (event: any) => {
      const players =
        event.payload.team === "home" ? homePlayers : guestPlayers;
      players[event.payload.index].goals = event.payload.goals;
      event.payload.team === "home"
        ? setHomePlayers([...players])
        : setGuestPlayers([...players]);
    });

    return () => {
      unlistenScore.then((f) => f());
      unlistenExclusion.then((f) => f());
      unlistenGoal.then((f) => f());
    };
  }, []);

  return (
    <div>
      <h1>Score Display</h1>
      <div>
        <h2>Home Team</h2>
        <p>Score: {homeScore}</p>
        <div>
          {homePlayers.map((player, index) => (
            <div key={index}>
              <span>
                {player.name} - Exclusions: {player.exclusions} - Goals:{" "}
                {player.goals}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2>Guest Team</h2>
        <p>Score: {guestScore}</p>
        <div>
          {guestPlayers.map((player, index) => (
            <div key={index}>
              <span>
                {player.name} - Exclusions: {player.exclusions} - Goals:{" "}
                {player.goals}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Scoreboard;

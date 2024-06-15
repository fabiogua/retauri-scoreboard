import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./Scoreboard.css";
import { listen } from "@tauri-apps/api/event";

function Controlboard() {
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

  //#region Score
  const incrementScore = (team: string) => {
    const score = team === "home" ? homeScore : guestScore;
    updateScore(team, score + 1);
  };

  const decrementScore = (team: string) => {
    const score = team === "home" ? homeScore : guestScore;
    if (score > 0) {
      updateScore(team, score - 1);
    }
  };

  const updateScore = async (team: string, score: number) => {
    await invoke("update_score", { team, score });
  };
  //#endregion

  //#region Score
  const incrementPlayerGoals = (team: string, index: number) => {
    const players = team === "home" ? homePlayers : guestPlayers;
    const player = players[index];
    updatePlayerGoals(team, index, player.goals + 1);
  };

  const decrementPlayerGoals = (team: string, index: number) => {
    const players = team === "home" ? homePlayers : guestPlayers;
    const player = players[index];
    if (player.goals > 0) {
      updatePlayerGoals(team, index, player.goals - 1);
    }
  };

  const updatePlayerGoals = async (
    team: string,
    index: number,
    goals: number
  ) => {
    await invoke("update_player_goals", { team, index, goals });
  };
  //#endregion

  //#region Exclusions
  const incrementPlayerExclusions = (team: string, index: number) => {
    const players = team === "home" ? homePlayers : guestPlayers;
    const player = players[index];
    updatePlayerExclusions(team, index, player.exclusions + 1);
  };

  const decrementPlayerExclusions = (team: string, index: number) => {
    const players = team === "home" ? homePlayers : guestPlayers;
    const player = players[index];
    if (player.exclusions > 0) {
      updatePlayerExclusions(team, index, player.exclusions - 1);
    }
  };

  const updatePlayerExclusions = async (
    team: string,
    index: number,
    exclusions: number
  ) => {
    await invoke("update_player_exclusions", { team, index, exclusions });
  };

  //#endregion

  useEffect(() => {
    const unlistenScore = listen("update_score", (event: any) => {
      event.payload.team === "home"
        ? setHomeScore(event.payload.score)
        : setGuestScore(event.payload.score);
    });

    const unlistenExclusion = listen(
      "update_player_exclusions",
      (event: any) => {
        const players =
          event.payload.team === "home" ? homePlayers : guestPlayers;
        players[event.payload.index].exclusions = event.payload.exclusions;
        event.payload.team === "home"
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
      <h1>Score Controller</h1>
      <div>
        <h2>Home Team</h2>
        <button onClick={() => incrementScore("home")}>
          Increase Home Score
        </button>
        <button onClick={() => decrementScore("home")}>
          Decrease Home Score
        </button>
        <div>
          {homePlayers.map((player, index) => (
            <div key={index}>
              <span>
                {player.name} - Exclusions: {player.exclusions}
              </span>
              <span>
                Ausschluss
                <button
                  onClick={() => incrementPlayerExclusions("home", index)}
                >
                  +
                </button>
                <button
                  onClick={() => decrementPlayerExclusions("home", index)}
                >
                  -
                </button>
              </span>
              <span>
                Tor
                <button onClick={() => incrementPlayerGoals("home", index)}>
                  +
                </button>
                <button onClick={() => decrementPlayerGoals("home", index)}>
                  -
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2>Guest Team</h2>
        <button onClick={() => incrementScore("guest")}>
          Increase Guest Score
        </button>
        <button onClick={() => decrementScore("guest")}>
          Decrease Guest Score
        </button>
        <div>
          {guestPlayers.map((player, index) => (
            <div key={index}>
              <span>
                {player.name} - Exclusions: {player.exclusions}
              </span>
              <span>
                Ausschluss
                <button
                  onClick={() => incrementPlayerExclusions("home", index)}
                >
                  +
                </button>
                <button
                  onClick={() => decrementPlayerExclusions("home", index)}
                >
                  -
                </button>
              </span>
              <span>
                Tor
                <button onClick={() => incrementPlayerGoals("home", index)}>
                  +
                </button>
                <button onClick={() => decrementPlayerGoals("home", index)}>
                  -
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Controlboard;

import { useEffect, useState } from "react";
import "../styles/Controlboard.css";
import { listen } from "@tauri-apps/api/event";
import TeamUi from "./Team";
import {
  MatchStats,
  Team,
  TeamEnum,
  TeamStats,
  TimeStats,
} from "../Data";
import MatchInfo from "./MatchInfo";
import buzzer from "../../src/assets/buzzer.mp3";

let  audio = new Audio(buzzer);

audio.loop= false
audio.volume = 0.5;
audio.pause();
audio.currentTime = 0;

function Controlboard() {
  const [homeTeam, setHomeTeam] = useState<Team>({
    name: "Team",
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
    name: "Team",
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
  const [isTimeout, setIsTimeout] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (!audio.paused)
        return;

      if (event.key === "Enter" ) {
        playSound();
      }
    };

    const handleKeyUp = (event: any) => {
      if (audio.paused)
        return;

      if (event.key === "Enter" ) {
        stopSound();
      }
    };

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

      if (payload.timeout_state === "Running"){
        timeToUse = payload.timeout_time;
        if (payload.timeout_time === 15000) {
          stopSound();
          playSound();
        }else if (payload.timeout_time === 13000) {
          stopSound();
        }
      }

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

      if (payload.time === 0) {
        playSound();
      }

      setQuater(payload.quater);
      setIsRunning(payload.is_running);
      setIsTimeout(false);
    });

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);
   
    return () => {
      updateTimeStats.then((f) => f());
      unlistenMatchStats.then((f) => f());
      window.removeEventListener("keaydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function playSound() {
    if (audio.paused)
      audio.play();
  }

  function stopSound() {
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  return (
    <div className="controlboard">
      <TeamUi team={homeTeam} side={TeamEnum.home} />
      <MatchInfo
        isRunning={isRunning}
        time={time}
        quater={quater}
        isTimeout={isTimeout}
      />
      <TeamUi team={guestTeam} side={TeamEnum.guest} />
    </div>
  );
}

export default Controlboard;

import { useEffect, useState } from "react";
import "../styles/Controlboard.css";
import { listen } from "@tauri-apps/api/event";
import TeamUi from "./Team";
import { MatchStats, Team, TeamEnum, TeamStats, TimeStats, TimeoutStats } from "../Data";
import MatchInfo from "./MatchInfo";

// import beep from "../../src/assets/buzzer.wav";

function Controlboard() {
  const [homeTeam, setHomeTeam] = useState<Team>({
    name: "Home Team",
    score: 0,
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

  const mapTeamStatsToTeam = (teamStats: TeamStats): Team => {
    
    console.log(teamStats);

    return {
      name: teamStats.name,
      score: teamStats.player_stats.reduce((acc, player) => acc + player.goals, 0),
      timeouts: teamStats.timeouts,
      players: teamStats.player_stats,
    };
  };

  

  const [time, setTime] = useState("08:00");
  const [quater, setQuater] = useState(1);
  const [isTimeout, setIsTimeout] = useState(false);


  // let audio = new Audio(beep);

  useEffect(() => {

    // const handleKeyPress = (event:any) => {
    //   console.log(event.key);
    //   if (event.key === 'Enter') {
    //     playSound();
    //   }
    // };

    // const handleKeyUp = (event:any) => {
    //   if (event.key === 'Enter') {
    //     stopSound();
    //   }
    // }

    const unlistenMatchStats = listen("update_match_stats", (event: any) => {
      const payload: MatchStats = event.payload;

      const home = mapTeamStatsToTeam(payload.home as TeamStats);
      const guest = mapTeamStatsToTeam(payload.guest as TeamStats);

      setHomeTeam(home);
      setGuestTeam(guest);
    });

    const updateTimeoutStats = listen("update_timeout_stats", (event: any) => {
      const payload: TimeoutStats = event.payload;

      const timeInTenMiliseconds = payload.time / 10;
      const tenSeconds = Math.floor(timeInTenMiliseconds / 1000);
      const seconds = Math.floor((timeInTenMiliseconds % 1000) / 100);
      const tenMiliseconds = Math.floor((timeInTenMiliseconds % 100) / 10);
      const miliseconds = Math.floor(timeInTenMiliseconds % 10);

      setTime(`${tenSeconds}${seconds}:${tenMiliseconds}${miliseconds}`);

      setIsTimeout(true);

      // if (payload.time === 15000) {
      //   playSound();
      // }

      // if (payload.time === 12000) {
      //   stopSound();
      // }
    });


    const updateTimeStats = listen("update_time_stats", (event: any) => {
      const payload : TimeStats= event.payload;

      if (payload.time < 60*1000) {
        const timeInTenMiliseconds = payload.time / 10;
        const tenSeconds = Math.floor(timeInTenMiliseconds / 1000);
        const seconds = Math.floor((timeInTenMiliseconds % 1000) / 100);
        const tenMiliseconds = Math.floor((timeInTenMiliseconds % 100) / 10);
        const miliseconds = Math.floor(timeInTenMiliseconds % 10);

        setTime(`${tenSeconds}${seconds}:${tenMiliseconds}${miliseconds}`);
      }
      else {
      const timeInSec = payload.time / 1000;

      const tenMinutes = Math.floor(timeInSec / 600);
      const minutes = Math.floor(timeInSec / 60);

      const tenSeconds = Math.floor((timeInSec % 60) / 10);
      const seconds = Math.floor((timeInSec % 60) % 10);

      setTime(`${tenMinutes}${minutes}:${tenSeconds}${seconds}`);
      }
      setQuater(payload.quater);
      setIsTimeout(false);
    });

    // window.addEventListener('keypress', handleKeyPress);
    // window.addEventListener('keyup', handleKeyUp);

    return () => {
      updateTimeStats.then((f) => f());
      unlistenMatchStats.then((f) => f());
      updateTimeoutStats.then((f) => f());
      // window.removeEventListener('keypress', handleKeyPress);
      // window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);


// function playSound () {
//     audio.volume = 0.5;
//     audio.play()
// };

// function stopSound () {
//   if (!audio.paused) {
//     audio.pause();
//     audio.currentTime = 0;
//   }
// }

  return (
    <div className="main">
      <h1>Score Controller</h1>
      <div className="teams">
        <TeamUi team={homeTeam} side={TeamEnum.home} />
        <MatchInfo time={time} quater={quater} isTimeout={isTimeout}/>
        <TeamUi team={guestTeam} side={TeamEnum.guest} />
      </div>
    </div>
  );
}

export default Controlboard;

import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';

function Scoreboard ()  {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const unlistenScore = listen("update-score", (event: any) => {
        console.log(event);
      setScore(event.payload);
    });

    return () => {
      unlistenScore.then(f => f());
    };
  }, []);

  return (
    <div>
      <h1>Score Display</h1>
      <p>Score: {score}</p>
    </div>
  );
};

export default Scoreboard;

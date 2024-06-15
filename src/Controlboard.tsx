import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./Scoreboard.css";


function Controlboard() {

    const [score, setScore] = useState<number>(0);
    
    const incrementScore = async () => {
        const newScore = score + 1;
        updateScore(newScore);
    };

    const decrementScore = async () => {
        const newScore = score - 1;
        if (newScore < 0) {
            return;
        }
        updateScore(newScore);
    }

    const updateScore  = async (score: number) => {
        setScore(score);
        await invoke("update_score", { score });
    }
    
    return (
        <div className="Scoreboard">
        <header className="Scoreboard-header">
            <img src={reactLogo} className="Scoreboard-logo" alt="logo" />
            <p>
            Score: {score}
            </p>
            <button onClick={incrementScore}>Increment</button>
            <button onClick={decrementScore}>Decrement</button>

        </header>
        </div>
    );
}

export default Controlboard;
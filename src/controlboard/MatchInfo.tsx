import { useState } from "react";
import { invoke } from "@tauri-apps/api";
import "../styles/MatchInfo.css";

function MatchInfo({
  time,
  quater,
  isTimeout,
  isRunning,
}: {
  time: string;
  quater: number;
  isTimeout: boolean;
  isRunning: boolean;
}) {
  const [isTimeEditing, setIsTimeEditing] = useState(false);
  const [isQuaterEditing, setIsQuaterEditing] = useState(false);
  const [tmpTime, setTmpTime] = useState(time);
  const [tmpQuater, setTmpQuater] = useState(quater.toString());

  const toggle_timer = async () => {
    await invoke("toggle_timer");
  };

  const toggle_timeout = async () => {
    await invoke("toggle_timeout");
  };

  async function setTime() {
    setIsTimeEditing(false);
    const newTime =
      (Number(tmpTime.substring(0, 2)) * 60 + Number(tmpTime.substring(3, 5))) *
      1000;
    await invoke("set_time", { newTime: newTime, isTimeout: isTimeout });
  }

  async function setQuater() {
    setIsQuaterEditing(false);
    const newQuater = Number(tmpQuater);
    await invoke("set_quater", { newQuater: newQuater });
  }

  const handleChange = (event: any) => {
    let value: string = event.target.value;

    if (value.length > 5) {
      return;
    }

    if (value.length === 3 || value.length === 4) {
      const dd = value.substring(2, 3);
      const lastChar = value.substring(2);
      if (dd != ":") {
        value = value.substring(0, 2) + ":" + lastChar;
      }
    }

    switch (value.length) {
      case 1:
        if (!value.match(/[0-5]/)) return;
        break;
      case 2:
        if (!value.substring(0, 2).match(/[0-5][0-9]/)) return;
        break;
      case 3:
        if (!value.substring(0, 3).match(/[0-5][0-9]:/)) return;
        break;
      case 4:
        if (!value.substring(0, 4).match(/[[0-5][0-9]:[0-5]/)) return;
        break;
      case 5:
        if (!value.substring(0, 5).match(/[0-5][0-9]:[0-5][0-9]/)) return;
        break;
      default:
        break;
    }

    setTmpTime(value);
  };

  const handleQuaterChange = (event: any) => {
    let value: string = event.target.value;

    if (value.length > 1) {
      return;
    }

    if (value.length === 0) {
      setTmpQuater("");
    }

    if (!value.match(/[1-4]/)) return;

    setTmpQuater(value);
  };

  return (
    <div className="match-info">
      <div className="match-info-time">
        <div className="time">
          {isTimeEditing ? (
            <div className="time-input-box">
              <input
                className="time-input"
                type="text"
                value={tmpTime}
                placeholder="mm:ss"
                onChange={(e) => {
                  handleChange(e);
                }}
                onKeyDown={(e) => {
                  handleChange(e);
                  if (e.key === "Enter") setTime();
                  if (e.key === "Escape") setIsTimeEditing(false);
                }}
                onBlur={setTime}
              />
            </div>
          ) : (
            <h1
              onDoubleClick={() => {
                setIsTimeEditing(true);
                setTmpTime("");
              }}
            >
              {time}
            </h1>
          )}
          <div className="time-buttons">
            <button onClick={toggle_timer}>
              {isRunning ? "Stop" : "Start"}
            </button>
            <button onClick={toggle_timeout}>Timeout</button>
          </div>
        </div>
        <div className="period">
          {isQuaterEditing ? (
            <div className="quater-input-box">
              <input
                className="quater-input"
                type="string"
                value={tmpQuater}
                onChange={(e) => {
                  handleQuaterChange(e);
                }}
                onBlur={setQuater}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setQuater();
                  if (e.key === "Escape") setIsQuaterEditing(false);
                }}
              />
            </div>
          ) : (
            <h3
              onDoubleClick={() => {
                setIsQuaterEditing(true);
                setTmpQuater(quater.toString());
              }}
            >
              {quater}
            </h3>
          )}
        </div>
      </div>
      <button
        className="quit"
        onClick={async () => {
          await invoke("exit_app");
        }}
      >
        Beenden
      </button>
    </div>
  );
}

export default MatchInfo;

import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import "../styles/Settings.css";
import TimeBox from "./TimeBox";

function Settings() {
  useEffect(() => {
    window.addEventListener("unload", async (ev) => {
      ev.preventDefault();
      await invoke("exit_app");
    });

    return () => {
      window.removeEventListener("unload", async (ev) => {
        ev.preventDefault();
        await invoke("exit_app");
      });
    };
  }, []);

  const [quarterLength, setQuarterLength] = useState(800);
  const [shortBreakLength, setShortBreakLength] = useState(200);
  const [longBreakLength, setLongBreakLength] = useState(300);
  const [timeoutLength, setTimeoutLength] = useState(100);

  async function startMatch() {
    saveSettings();
    await invoke("start_match");
  }

  async function saveSettings() {
    await invoke("save_settings", {
      quatertime: quarterLength * 600,
      shortpause: shortBreakLength * 600,
      longpause: longBreakLength * 600,
      timeout: timeoutLength * 600,
    });
  }

  return (
    <div className="settings">
      <h1>Einstellungen</h1>
      <div className="settings-header">
        <p>
          Bitte geben Sie die Zeitwerte für Minuten und Sekunden separat ein.
          <br />
          <br />
          Zum Beispiel:
        </p>

        <ul>
          <li>
            8 Minuten: <strong>800</strong> oder <strong>0800</strong>
          </li>
          <li>
            30 Sekunden: <strong>0030</strong> oder <strong>30</strong>
          </li>
        </ul>
      </div>
      <table className="match-settings">
        <thead>
          <tr>
            <th></th>
            <th>Konvertiert</th>
            <th>Eingabe</th>
          </tr>
        </thead>
        <TimeBox
          title="Viertelzeit"
          time={quarterLength}
          setTime={setQuarterLength}
        />
        <TimeBox
          title="kurze Pause"
          time={shortBreakLength}
          setTime={setShortBreakLength}
        />
        <TimeBox
          title="lange Pause"
          time={longBreakLength}
          setTime={setLongBreakLength}
        />
        <TimeBox
          title="Timeout"
          time={timeoutLength}
          setTime={setTimeoutLength}
        />
      </table>
      <button className="start-button" onClick={startMatch}>
        Match Starten
      </button>
      <button className="quit-button"
      onClick={ async () => {
        await invoke("exit_app");
      }
      }>Beenden</button>
    </div>
  );
}

export default Settings;

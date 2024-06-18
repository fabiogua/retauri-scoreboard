import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import "./Settings.css";

function Settings() {
  const [quarterLength, setQuarterLength] = useState(8 * 60);
  const [shortBreakLength, setShortBreakLength] = useState(2 * 60);
  const [longBreakLength, setLongBreakLength] = useState(3 * 60);
  const [timeoutLength, setTimeoutLength] = useState(1 * 60);

  async function startMatch() {
    saveSettings();
    await invoke("start_match");
  }

  async function saveSettings() {
    await invoke("save_settings", {
      quatertime: quarterLength * 1000,
      shortpause: shortBreakLength * 1000,
      longpause: longBreakLength * 1000,
      timeout: timeoutLength * 1000,
    });
  }

  const handleTimeChange = (setter: any) => (e: any) => {
    const [minutes, seconds] = e.target.value.split(":").map(Number);
    setter(minutes * 60 + seconds);
  };

  return (
    <div className="settings-container">
      <h1>Einstellungen</h1>
      <p>
        Bitte geben Sie alle Zeitwerte im Format <strong>'mm:ss'</strong> ein.
        <br />
        <br />
        Zum Beispiel:
        <ul>
          <li>
            8 Minuten: <strong>08:00</strong>
          </li>
          <li>
            30 Sekunden: <strong>00:30</strong>
          </li>
        </ul>
      </p>

      <div className="match-settings">
        <div className="match-settings__input-group">
          <label htmlFor="quarter-length">Viertelzeit</label>
          <input
            type="text"
            id="quarter-length"
            name="quarter-length"
            placeholder="00:00"
            onChange={handleTimeChange(setQuarterLength)}
          />
        </div>
        <div className="match-settings__input-group">
          <label htmlFor="short-break-length">Kurze Pause</label>
          <input
            type="text"
            id="short-break-length"
            name="short-break-length"
            placeholder="00:00"
            onChange={handleTimeChange(setShortBreakLength)}
          />
        </div>
        <div className="match-settings__input-group">
          <label htmlFor="long-break-length">Lange Pause</label>
          <input
            type="text"
            id="long-break-length"
            name="long-break-length"
            placeholder="00:00"
            onChange={handleTimeChange(setLongBreakLength)}
          />
        </div>
        <div className="match-settings__input-group">
          <label htmlFor="timeout-length">Timeout</label>
          <input
            type="text"
            id="timeout-length"
            name="timeout-length"
            placeholder="00:00"
            onChange={handleTimeChange(setTimeoutLength)}
          />
        </div>
      </div>
      <button className="start-button" onClick={startMatch}>
        Match Starten
      </button>
    </div>
  );
}

export default Settings;

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

  const handleTimeChange = (setter: any) => (e: any, type: string) => {
    let value = e.target.value;
    if (value === "") value = "0";
    const minutes = type === "minutes" ? parseInt(value) : 0;
    const seconds = type === "seconds" ? parseInt(value) : 0;
    setter(() =>  minutes * 60 + seconds);
  };

  return (
    <div className="settings-container">
      <h1>Einstellungen</h1>
      <p>
        Bitte geben Sie die Zeitwerte für Minuten und Sekunden separat ein.
        <br />
        <br />
        Zum Beispiel:
        <ul>
          <li>
            8 Minuten: <strong>8</strong> und <strong>0</strong>
          </li>
          <li>
            30 Sekunden: <strong>0</strong> und <strong>30</strong>
          </li>
        </ul>
      </p>
      <div className="match-settings">
        <div className="match-settings__input-group">
          <label htmlFor="quarter-length-minutes">Viertelzeit</label>
          <div className="time-inputs">
            <input
              type="text"
              id="quarter-length-minutes"
              name="quarter-length-minutes"
              placeholder={(quarterLength / 60).toString()}
              maxLength={2}
              pattern="[0-5][0-9]"
              onChange={(e) => handleTimeChange(setQuarterLength)(e, "minutes")}
            />
            <input
              type="text"
              id="quarter-length-seconds"
              name="quarter-length-seconds"
              placeholder={(quarterLength % 60).toString()}
              maxLength={2}
              pattern="[0-5][0-9]"
              onChange={(e) => handleTimeChange(setQuarterLength)(e, "seconds")}
            />
          </div>
        </div>
        <div className="match-settings__input-group">
          <label htmlFor="short-break-length-minutes">Kurze Pause</label>
          <div className="time-inputs">
            <input
              type="text"
              id="short-break-length-minutes"
              name="short-break-length-minutes"
              placeholder={(shortBreakLength / 60).toString()}
              maxLength={2}
              pattern="[0-5][0-9]"
              onChange={(e) =>
                handleTimeChange(setShortBreakLength)(e, "minutes")
              }
            />
            <input
              type="text"
              id="short-break-length-seconds"
              name="short-break-length-seconds"
              placeholder={(shortBreakLength % 60).toString()}
              maxLength={2}
              pattern="[0-5][0-9]"
              onChange={(e) =>
                handleTimeChange(setShortBreakLength)(e, "seconds")
              }
            />
          </div>
        </div>
        <div className="match-settings__input-group">
          <label htmlFor="long-break-length-minutes">Lange Pause</label>
          <div className="time-inputs">
            <input
              type="text"
              id="long-break-length-minutes"
              name="long-break-length-minutes"
              placeholder={(longBreakLength / 60).toString()}
              maxLength={2}
              pattern="[0-5][0-9]"
              onChange={(e) =>
                handleTimeChange(setLongBreakLength)(e, "minutes")
              }
            />
            <input
              type="text"
              id="long-break-length-seconds"
              name="long-break-length-seconds"
              placeholder={(longBreakLength % 60).toString()}
              maxLength={2}
              pattern="[0-5][0-9]"
              onChange={(e) =>
                handleTimeChange(setLongBreakLength)(e, "seconds")
              }
            />
          </div>
        </div>
        <div className="match-settings__input-group">
          <label htmlFor="timeout-length-minutes">Timeout</label>
          <div className="time-inputs">
            <input
              type="text"
              id="timeout-length-minutes"
              name="timeout-length-minutes"
              placeholder={(timeoutLength / 60).toString()}
              maxLength={2}
              pattern="[0-5][0-9]"
              onChange={(e) => handleTimeChange(setTimeoutLength)(e, "minutes")}
            />
            <input
              type="text"
              id="timeout-length-seconds"
              name="timeout-length-seconds"
              placeholder={(timeoutLength % 60).toString()}
              maxLength={2}
              pattern="[0-5][0-9]"
              onChange={(e) => handleTimeChange(setTimeoutLength)(e, "seconds")}
            />
          </div>
        </div>
      </div>
      <button className="start-button" onClick={startMatch}>
        Match Starten
      </button>
    </div>
  );
}

export default Settings;

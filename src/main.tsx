import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import Scoreboard from "./scoreboard/Scoreboard";
import Controlboard from "./controlboard/Controlboard";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
 <HashRouter>
    <React.StrictMode>
      <Routes>
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/controlboard" element={<Controlboard />} />
      </Routes>
    </React.StrictMode>
  </HashRouter>,
);

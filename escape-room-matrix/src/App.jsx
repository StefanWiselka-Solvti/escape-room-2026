import { useState, useEffect } from "react";
import MatrixRain from "./MatrixRain";
import {
  GAME_DURATION_MINUTES,
  GAME_VERSION,
} from "./gameSettings";

export default function App() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  // ---- TIMER LOGIC ----
  useEffect(() => {
    const storedVersion = localStorage.getItem("escape_version");

    // Reset przy zmianie wersji
    if (storedVersion !== GAME_VERSION) {
      localStorage.removeItem("escape_end_time");
      localStorage.removeItem("escape_finish_time");
      localStorage.setItem("escape_version", GAME_VERSION);
    }

    const finishTime = localStorage.getItem("escape_finish_time");

    // Jeśli gra już ukończona → użyj zapisanego czasu
    if (finishTime) {
      setUnlocked(true);
      setTimeLeft(Number(finishTime));
      return;
    }

    let endTime = localStorage.getItem("escape_end_time");

    if (!endTime) {
      endTime =
        Date.now() + GAME_DURATION_MINUTES * 60 * 1000;
      localStorage.setItem("escape_end_time", endTime);
    }

    const interval = setInterval(() => {
  if (localStorage.getItem("escape_finish_time")) {
    clearInterval(interval);
    return;
  }

  const remaining = endTime - Date.now();

  if (remaining <= 0) {
    setTimeLeft(0);
    clearInterval(interval);
  } else {
    setTimeLeft(remaining);
  }
}, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === "123456") {
      // ZAPISZ ZAMROŻONY CZAS
      localStorage.setItem("escape_finish_time", timeLeft);
      
      setUnlocked(true);
    } else {
      setError("ODMOWA DOSTĘPU");
      setPassword("");
    }
  };

  if (timeLeft === 0 && !unlocked) {
    return (
      <div className="success-screen">
        <h1>💀 SYSTEM ZABLOKOWANY</h1>
        <p>KONIEC CZASU</p>
      </div>
    );
  }

  if (unlocked) {
    return (
      <div className="success-screen">
        <h1>🔓 GRATULACJE WIRUS ODINSTALOWANY</h1>
        <p>Ferie rodzinne w Ustroniu uratowane!</p>

        <div style={{ fontSize: "32px", margin: "20px 0" }}>
          ⏳ Pozostały czas: {formatTime(timeLeft)}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <MatrixRain />

      <div className="overlay">
        <h1>⚠ SYSTEM ZABLOKOWANY ⚠</h1>

        <div style={{ marginBottom: "20px", fontSize: "24px" }}>
          ⏳ {formatTime(timeLeft)}
        </div>

        <p>WPISZ HASŁO ABY USUNĄĆ WIRUSA</p>

        <form onSubmit={handleSubmit}>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={6}
            autoFocus
          />
          <button type="submit">USUŃ WIRUSA</button>
        </form>

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
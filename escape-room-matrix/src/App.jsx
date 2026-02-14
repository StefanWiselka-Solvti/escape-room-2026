import { useState, useEffect } from "react";
import MatrixRain from "./MatrixRain";

const GAME_DURATION_MINUTES = 20;
const GAME_VERSION = "1.0"; 
// ↑ zmień tę wartość żeby zresetować czas (np. "1.1")

export default function App() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const CORRECT_PASSWORD = "NEON42";

  // ---- TIMER LOGIC ----
  useEffect(() => {
    const storedVersion = localStorage.getItem("escape_version");

    // Jeśli zmieniono wersję gry → reset timera
    if (storedVersion !== GAME_VERSION) {
      localStorage.removeItem("escape_end_time");
      localStorage.setItem("escape_version", GAME_VERSION);
    }

    let endTime = localStorage.getItem("escape_end_time");

    if (!endTime) {
      endTime =
        Date.now() + GAME_DURATION_MINUTES * 60 * 1000;
      localStorage.setItem("escape_end_time", endTime);
    }

    const interval = setInterval(() => {
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

    if (password === CORRECT_PASSWORD) {
      setUnlocked(true);
    } else {
      setError("ODMOWA DOSTĘPU");
      setPassword("");
    }
  };

  if (timeLeft === 0 && !unlocked) {
    return (
      <div className="success-screen">
        <h1>💀 SYSTEM LOCKED</h1>
        <p>TIME EXPIRED</p>
      </div>
    );
  }

  if (unlocked) {
    return (
      <div className="success-screen">
        <h1>🔓 SYSTEM UNLOCKED</h1>
        <p>Kolejna wskazówka została aktywowana...</p>
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

        <p>WPISZ HASŁO ABY ODNINSTALOWAĆ WIRUSA</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit">USUŃ WIRUSA</button>
        </form>

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
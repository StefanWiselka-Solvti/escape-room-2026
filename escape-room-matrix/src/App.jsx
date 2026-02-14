import { useState, useEffect } from "react";
import MatrixRain from "./MatrixRain";
import { GAME_DURATION_MINUTES } from "./gameSettings";

export default function App() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameVersion, setGameVersion] = useState("A");

  // ---- GENERATOR LOSOWEJ WERSJI ----
  const generateRandomVersion = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return chars[Math.floor(Math.random() * chars.length)];
  };

  // ---- NASŁUCH KOMBINACJI (Ctrl + Shift + V) ----
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "V") {
        const newVersion = generateRandomVersion();
        setGameVersion(newVersion);
        console.log("Nowa wersja gry:", newVersion);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ---- TIMER LOGIC ----
  useEffect(() => {
    const storedVersion = localStorage.getItem("escape_version");

    if (storedVersion !== gameVersion) {
      localStorage.removeItem("escape_end_time");
      localStorage.removeItem("escape_finish_time");
      localStorage.setItem("escape_version", gameVersion);

      setUnlocked(false);
      setPassword("");
      setError("");
    }

    const finishTime = localStorage.getItem("escape_finish_time");

    if (finishTime) {
      setUnlocked(true);
      setTimeLeft(Number(finishTime));
      return;
    }

    let endTime = localStorage.getItem("escape_end_time");

    if (!endTime) {
      endTime = Date.now() + GAME_DURATION_MINUTES * 60 * 1000;
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
  }, [gameVersion]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  // ---- WALIDACJA HASŁA ----
  const validatePassword = (value) => {
    if (value === "4382") {
      localStorage.setItem("escape_finish_time", timeLeft);
      setUnlocked(true);
    } else {
      setError("ODMOWA DOSTĘPU");
      setPassword("");
    }
  };

  // ---- AUTO WALIDACJA PO 6 ZNAKACH ----
  const handleChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setError("");

    if (value.length === 4) {
      validatePassword(value);
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
        <p style={{ fontSize: "32px", margin: "20px 0" }}>Ferie rodzinne w Ustroniu uratowane!</p>

        <div style={{ fontSize: "64px", margin: "20px 0" }}>
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

        <input
          value={password}
          onChange={handleChange}
          maxLength={6}
          autoFocus
        />

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}

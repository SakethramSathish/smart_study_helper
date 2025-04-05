import { useState, useEffect, useRef } from "react";

const TimerMode = () => {
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds (Pomodoro default)
  const [timerType, setTimerType] = useState("pomodoro"); // pomodoro, shortBreak, longBreak
  const [cycles, setCycles] = useState(0);
  const [timerSettings, setTimerSettings] = useState({
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    longBreakInterval: 4
  });
  
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start the timer
  const startTimer = () => {
    setTimerActive(true);
  };

  // Pause the timer
  const pauseTimer = () => {
    setTimerActive(false);
  };

  // Reset the timer
  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(timerSettings[timerType]);
  };

  // Switch timer type
  const switchTimerType = (type) => {
    setTimerActive(false);
    setTimerType(type);
    setTimeLeft(timerSettings[type]);
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }

    if (timerType === "pomodoro") {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      
      if (newCycles % timerSettings.longBreakInterval === 0) {
        // Time for a long break
        switchTimerType("longBreak");
        if (timerSettings.autoStartBreaks) {
          setTimerActive(true);
        }
      } else {
        // Time for a short break
        switchTimerType("shortBreak");
        if (timerSettings.autoStartBreaks) {
          setTimerActive(true);
        }
      }
    } else {
      // Break is over, back to pomodoro
      switchTimerType("pomodoro");
      if (timerSettings.autoStartPomodoros) {
        setTimerActive(true);
      }
    }
  };

  // Update timer settings
  const updateSettings = (setting, value) => {
    const newSettings = { ...timerSettings, [setting]: value };
    setTimerSettings(newSettings);
    
    // Update current timer if the setting being changed is for the current timer type
    if (setting === timerType) {
      setTimeLeft(value);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive]);

  // Set correct time when changing timer type
  useEffect(() => {
    setTimeLeft(timerSettings[timerType]);
  }, [timerType, timerSettings]);

  return (
    <div className="timer-container">
      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" />
      
      {/* Timer tabs */}
      <div className="timer-tabs">
        <button 
          className={`timer-tab ${timerType === "pomodoro" ? "active" : ""}`}
          onClick={() => switchTimerType("pomodoro")}
        >
          Pomodoro
        </button>
        <button 
          className={`timer-tab ${timerType === "shortBreak" ? "active" : ""}`}
          onClick={() => switchTimerType("shortBreak")}
        >
          Short Break
        </button>
        <button 
          className={`timer-tab ${timerType === "longBreak" ? "active" : ""}`}
          onClick={() => switchTimerType("longBreak")}
        >
          Long Break
        </button>
      </div>
      
      {/* Timer display */}
      <div className="timer-display">
        <h2>{formatTime(timeLeft)}</h2>
      </div>
      
      {/* Timer controls */}
      <div className="timer-controls">
        {!timerActive ? (
          <button className="timer-button start" onClick={startTimer}>
            Start
          </button>
        ) : (
          <button className="timer-button pause" onClick={pauseTimer}>
            Pause
          </button>
        )}
        <button className="timer-button reset" onClick={resetTimer}>
          Reset
        </button>
      </div>
      
      {/* Settings */}
      <div className="timer-settings">
        <h3>Settings</h3>
        <div className="settings-row">
          <label>
            Pomodoro:
            <input
              type="number"
              value={timerSettings.pomodoro / 60}
              min="1"
              max="60"
              onChange={(e) => updateSettings("pomodoro", e.target.value * 60)}
            />
            minutes
          </label>
        </div>
        <div className="settings-row">
          <label>
            Short Break:
            <input
              type="number"
              value={timerSettings.shortBreak / 60}
              min="1"
              max="30"
              onChange={(e) => updateSettings("shortBreak", e.target.value * 60)}
            />
            minutes
          </label>
        </div>
        <div className="settings-row">
          <label>
            Long Break:
            <input
              type="number"
              value={timerSettings.longBreak / 60}
              min="1"
              max="60"
              onChange={(e) => updateSettings("longBreak", e.target.value * 60)}
            />
            minutes
          </label>
        </div>
        <div className="settings-row">
          <label>
            Long Break Interval:
            <input
              type="number"
              value={timerSettings.longBreakInterval}
              min="1"
              max="10"
              onChange={(e) => updateSettings("longBreakInterval", parseInt(e.target.value))}
            />
            pomodoros
          </label>
        </div>
        <div className="settings-row">
          <label>
            <input
              type="checkbox"
              checked={timerSettings.autoStartBreaks}
              onChange={(e) => updateSettings("autoStartBreaks", e.target.checked)}
            />
            Auto-start Breaks
          </label>
        </div>
        <div className="settings-row">
          <label>
            <input
              type="checkbox"
              checked={timerSettings.autoStartPomodoros}
              onChange={(e) => updateSettings("autoStartPomodoros", e.target.checked)}
            />
            Auto-start Pomodoros
          </label>
        </div>
      </div>
      
      {/* Cycle counter */}
      <div className="cycle-counter">
        <p>Completed Cycles: {cycles}</p>
      </div>
    </div>
  );
};

export default TimerMode;
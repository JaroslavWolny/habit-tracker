import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import HabitList from './components/HabitList';
import AddHabit from './components/AddHabit';
import Calendar from './components/Calendar';
import Award from './components/Award';
import ShareCard from './components/ShareCard';

function App() {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('habits_def');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('habit_history');
    return saved ? JSON.parse(saved) : {};
  });

  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('user_xp');
    return saved ? parseInt(saved) : 0;
  });

  const shareRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('habits_def', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habit_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('user_xp', xp.toString());
  }, [xp]);

  const getTodayStr = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const today = getTodayStr();

  const calculateLevel = () => {
    return Math.floor(xp / 100) + 1;
  };

  const level = calculateLevel();
  const xpProgress = xp % 100;

  const calculateStreak = () => {
    let streak = 0;
    const todayDate = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(todayDate.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const completedIds = history[dateStr] || [];

      // Filter habits that existed on this date
      // We assume habit.id is a timestamp of creation for new habits
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const relevantHabits = habits.filter(h => {
        // For today (i=0), consider all active habits to avoid issues with clock skew
        if (i === 0) return true;

        // If id is not a number (legacy data), assume it existed
        if (typeof h.id !== 'number') return true;
        return h.id <= endOfDay.getTime();
      });

      // If no habits existed that day, it doesn't count towards streak
      if (relevantHabits.length === 0) {
        if (i === 0) continue;
        break;
      }

      const allCompleted = relevantHabits.every(h => completedIds.includes(h.id));

      if (allCompleted) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  const triggerHaptic = (type = 'light') => {
    if (navigator.vibrate) {
      // Simple vibration patterns
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 40,
        success: [10, 30, 10]
      };
      navigator.vibrate(patterns[type] || 10);
    }
  };

  const addHabit = (text) => {
    setHabits([...habits, { id: Date.now(), text }]);
    triggerHaptic('light');
  };

  const editHabit = (id, newText) => {
    setHabits(habits.map(h => h.id === id ? { ...h, text: newText } : h));
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
    triggerHaptic('medium');
  };

  const toggleHabit = (id) => {
    const date = new Date();
    const currentToday = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    setHistory(prev => {
      const todayCompleted = prev[currentToday] || [];
      const isCompleted = todayCompleted.includes(id);

      let newTodayCompleted;
      if (isCompleted) {
        newTodayCompleted = todayCompleted.filter(hId => hId !== id);
        setXp(prevXp => Math.max(0, prevXp - 10));
        triggerHaptic('light');
      } else {
        newTodayCompleted = [...todayCompleted, id];
        setXp(prevXp => prevXp + 10);
        triggerHaptic('success');

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d946ef', '#8b5cf6', '#06b6d4', '#10b981']
        });
      }

      return {
        ...prev,
        [currentToday]: newTodayCompleted
      };
    });
  };

  const handleShare = async () => {
    if (shareRef.current) {
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2
      });
      const image = canvas.toDataURL("image/png");

      const link = document.createElement('a');
      link.href = image;
      link.download = `habit-streak-${today}.png`;
      link.click();
    }
  };

  const todayHabits = habits.map(h => ({
    ...h,
    completed: (history[today] || []).includes(h.id)
  }));

  const completedCount = (history[today] || []).filter(id => habits.some(h => h.id === id)).length;
  const isAllDone = habits.length > 0 && completedCount === habits.length;

  return (
    <div className="app-container">
      <Award show={isAllDone} />

      <div className="header-row">
        <h1>Habit Tracker</h1>
        <div className="streak-display">
          🔥 {streak}
        </div>
      </div>

      <div className="glass-panel main-panel">

        <div className="rpg-stats">
          <div className="level-badge">
            <span className="level-label">LVL</span>
            <span className="level-number">{level}</span>
          </div>
          <div className="xp-bar-container">
            <div className="xp-bar" style={{ width: `${xpProgress}%` }}></div>
            <span className="xp-text">{xpProgress} / 100 XP</span>
          </div>
        </div>

        <AddHabit onAdd={addHabit} />
        <HabitList
          habits={todayHabits}
          onToggle={toggleHabit}
          onEdit={editHabit}
          onDelete={deleteHabit}
        />

        <button className="glass-button share-btn" onClick={handleShare}>
          Share Progress 📸
        </button>

        <Calendar history={history} habits={habits} />
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ShareCard
          ref={shareRef}
          streak={streak}
          habits={habits}
          todayHabits={todayHabits}
        />
      </div>
    </div>
  );
}

export default App;

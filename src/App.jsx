import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import HabitList from './components/HabitList';
import AddHabit from './components/AddHabit';
import Calendar from './components/Calendar';
import Award from './components/Award';
import ShareCard from './components/ShareCard';
import LevelUpModal from './components/LevelUpModal';
import MysteryBoxModal from './components/MysteryBoxModal';

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

  const calculateLevel = (currentXp) => {
    return Math.floor(currentXp / 500) + 1;
  };

  const [showLevelUp, setShowLevelUp] = useState(false);
  const previousLevel = useRef(calculateLevel(xp));

  useEffect(() => {
    const currentLevel = calculateLevel(xp);
    if (currentLevel > previousLevel.current) {
      setShowLevelUp(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
    previousLevel.current = currentLevel;
  }, [xp]);

  const level = calculateLevel(xp);
  const xpProgress = xp % 500;

  const calculateStreak = () => {
    let streak = 0;
    const todayDate = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(todayDate.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const completedIds = history[dateStr] || [];

      // Filter habits that existed on this date
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const relevantHabits = habits.filter(h => {
        if (i === 0) return true;
        if (typeof h.id !== 'number') return true;
        return h.id <= endOfDay.getTime();
      });

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

  const calculateHabitStreak = (habitId) => {
    let streak = 0;
    const todayDate = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(todayDate.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      // Check if habit existed
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      if (typeof habitId === 'number' && habitId > endOfDay.getTime()) {
        break; // Habit didn't exist yet
      }

      const isCompleted = (history[dateStr] || []).includes(habitId);

      if (isCompleted) {
        streak++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  const triggerHaptic = (type = 'light') => {
    if (navigator.vibrate) {
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

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('user_inventory');
    return saved ? JSON.parse(saved) : { achievements: [] };
  });

  const [showMysteryBox, setShowMysteryBox] = useState(false);

  useEffect(() => {
    localStorage.setItem('user_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const toggleHabit = (id) => {
    const date = new Date();
    const currentToday = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    setHistory(prev => {
      const todayCompleted = prev[currentToday] || [];
      const isCompleted = todayCompleted.includes(id);

      let newTodayCompleted;
      let xpChange = 0;
      let shouldTriggerBox = false;

      if (isCompleted) {
        newTodayCompleted = todayCompleted.filter(hId => hId !== id);
        xpChange = -10;
        triggerHaptic('light');
      } else {
        newTodayCompleted = [...todayCompleted, id];
        xpChange = 10;
        triggerHaptic('success');

        // Check for Perfect Day (all habits completed)
        if (habits.length > 0 && newTodayCompleted.length === habits.length) {
          // Check if box already claimed today
          const lastBoxDate = prev.lastMysteryBoxDate;
          if (lastBoxDate !== currentToday) {
            shouldTriggerBox = true;
          } else {
            // Just confetti if already claimed
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }
      }

      setXp(prevXp => Math.max(0, prevXp + xpChange));

      if (shouldTriggerBox) {
        setTimeout(() => setShowMysteryBox(true), 500);
      }

      return {
        ...prev,
        [currentToday]: newTodayCompleted
      };
    });
  };

  const handleRewardClaimed = (reward) => {
    const date = new Date();
    const currentToday = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // Mark box as claimed for today
    setHistory(prev => ({
      ...prev,
      lastMysteryBoxDate: currentToday
    }));

    if (reward.type === 'xp') {
      setXp(prev => prev + reward.amount);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b'] // Gold colors
      });
    } else if (reward.type === 'achievement') {
      setInventory(prev => {
        if (prev.achievements.includes(reward.id)) {
          // Fallback XP if already owned
          setXp(x => x + 100);
          return prev;
        }
        return {
          ...prev,
          achievements: [...prev.achievements, reward.id]
        };
      });
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#d946ef', '#8b5cf6', '#06b6d4'] // Rare colors
      });
    }
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
    completed: (history[today] || []).includes(h.id),
    streak: calculateHabitStreak(h.id)
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

      <LevelUpModal
        show={showLevelUp}
        level={level}
        onClose={() => setShowLevelUp(false)}
      />

      <MysteryBoxModal
        show={showMysteryBox}
        onClose={() => setShowMysteryBox(false)}
        onRewardClaimed={handleRewardClaimed}
      />
    </div>
  );
}

export default App;

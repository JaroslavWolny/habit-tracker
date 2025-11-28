import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import './components/StreakDisplay.css';
import confetti from 'canvas-confetti';
import HabitList from './components/HabitList';
import AddHabit from './components/AddHabit';
import Calendar from './components/Calendar';
import Award from './components/Award';
import ShareCard from './components/ShareCard';
import BodyWidget from './components/BodyWidget';

import KnowledgeCardModal from './components/KnowledgeCardModal';

function App() {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('habits_def');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('habit_history');
    return saved ? JSON.parse(saved) : {};
  });

  const [showKnowledgeCard, setShowKnowledgeCard] = useState(false);
  const shareRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('habits_def', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habit_history', JSON.stringify(history));
  }, [history]);

  const getTodayStr = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const today = getTodayStr();

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

  const addHabit = (text, category = 'training') => {
    setHabits([...habits, { id: Date.now(), text, category }]);
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
      let shouldTriggerCard = false;

      if (isCompleted) {
        // STRICT MODE: Cannot undo a completed habit for the day
        triggerHaptic('medium'); // Error vibration
        return prev;
      } else {
        newTodayCompleted = [...todayCompleted, id];
        triggerHaptic('success');

        // Check for Perfect Day
        if (habits.length > 0 && newTodayCompleted.length === habits.length) {
          // Check if already claimed today (using same key as mystery box for simplicity)
          const lastCardDate = prev.lastMysteryBoxDate;
          if (lastCardDate !== currentToday) {
            shouldTriggerCard = true;
          } else {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#39FF14', '#ffffff'] // Neon Green & White
            });
          }
        }
      }

      if (shouldTriggerCard) {
        setTimeout(() => setShowKnowledgeCard(true), 500);
      }

      return {
        ...prev,
        [currentToday]: newTodayCompleted,
        lastMysteryBoxDate: shouldTriggerCard ? currentToday : prev.lastMysteryBoxDate
      };
    });
  };

  const handleShare = async () => {
    if (shareRef.current) {
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: '#000000',
        scale: 2
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `optimal-body-${today}.png`;
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

  // Calculate Stats for Dashboard
  const calculateStats = () => {
    const stats = {
      training: 0, // 0-1 for BodyWidget
      nutrition: 0,
      recovery: 0,
      str: 0, // 0-100% for PerformanceStats
      rec: 0,
      know: 0
    };

    const categories = {
      training: { total: 0, done: 0 },
      nutrition: { total: 0, done: 0 },
      recovery: { total: 0, done: 0 },
      knowledge: { total: 0, done: 0 }
    };

    todayHabits.forEach(h => {
      const cat = h.category || 'training'; // Default to training if missing
      if (categories[cat]) {
        categories[cat].total++;
        if (h.completed) categories[cat].done++;
      }
    });

    // Body Widget Stats (0-1)
    stats.training = categories.training.total > 0 ? categories.training.done / categories.training.total : 0;
    stats.nutrition = categories.nutrition.total > 0 ? categories.nutrition.done / categories.nutrition.total : 0;
    stats.recovery = categories.recovery.total > 0 ? categories.recovery.done / categories.recovery.total : 0;
    stats.knowledge = categories.knowledge.total > 0 ? categories.knowledge.done / categories.knowledge.total : 0;

    // Performance Stats (0-100%)
    // STR = Training + Knowledge (Discipline)
    const strTotal = categories.training.total + categories.knowledge.total;
    const strDone = categories.training.done + categories.knowledge.done;
    stats.str = strTotal > 0 ? (strDone / strTotal) * 100 : 0;

    // REC = Recovery + Nutrition (Health)
    const recTotal = categories.recovery.total + categories.nutrition.total;
    const recDone = categories.recovery.done + categories.nutrition.done;
    stats.rec = recTotal > 0 ? (recDone / recTotal) * 100 : 0;

    // KNOW = Knowledge (Focus)
    stats.know = categories.knowledge.total > 0 ? (categories.knowledge.done / categories.knowledge.total) * 100 : 0;

    return stats;
  };

  const currentStats = calculateStats();

  return (
    <div className="app-container">
      <div className="header-row">
        <div className="app-brand">
          <h1>OPTIMAL APP</h1>
        </div>
        <div className="streak-minimal">
          <span className="streak-fire">🔥</span>
          <span className="streak-val">{streak}</span>
        </div>
      </div>

      <Award show={isAllDone} />

      <div className="glass-panel main-panel">

        <BodyWidget stats={currentStats} isAllDone={isAllDone} />


        <AddHabit onAdd={addHabit} />
        <HabitList
          habits={todayHabits}
          onToggle={toggleHabit}
          onEdit={editHabit}
          onDelete={deleteHabit}
        />

        <Calendar history={history} habits={habits} />
      </div>

      <div className="fixed-action-bar">
        <button className="share-btn-large" onClick={handleShare}>
          <span className="camera-icon">⚔️</span>
          <span className="action-text">SHARE DOMINANCE</span>
          <div className="btn-shine"></div>
        </button>
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ShareCard
          ref={shareRef}
          streak={streak}
          habits={habits}
          todayHabits={todayHabits}
          history={history}
        />
      </div>

      <KnowledgeCardModal
        show={showKnowledgeCard}
        onClose={() => setShowKnowledgeCard(false)}
      />
    </div>
  );
}

export default App;

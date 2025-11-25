import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import HabitList from './components/HabitList';
import AddHabit from './components/AddHabit';
import Calendar from './components/Calendar';
import Award from './components/Award';
import ShareCard from './components/ShareCard';
import ProofModal from './components/ProofModal';

function App() {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('habits_def');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('habit_history');
    return saved ? JSON.parse(saved) : {};
  });

  const shareRef = useRef(null);

  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [activeHabit, setActiveHabit] = useState(null);

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

  // Calculate Streak
  const calculateStreak = () => {
    let streak = 0;
    const todayDate = new Date();

    // Check yesterday backwards
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(todayDate.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const completedIds = history[dateStr] || [];
      // If we have habits and all are completed
      if (habits.length > 0 && completedIds.length === habits.length) {
        streak++;
      } else if (i === 0) {
        // If today is not done, don't break streak yet, just don't count it if it's 0
        continue;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  const addHabit = (text) => {
    setHabits([...habits, { id: Date.now(), text }]);
  };

  const editHabit = (id, newText) => {
    setHabits(habits.map(h => h.id === id ? { ...h, text: newText } : h));
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleHabit = (id) => {
    // Check if we are completing (not un-completing)
    const isCompleted = (history[today] || []).includes(id);

    if (!isCompleted) {
      // Open proof modal
      const habit = habits.find(h => h.id === id);
      setActiveHabit(habit);
      setProofModalOpen(true);
    } else {
      // Just toggle off
      updateHistory(id);
    }
  };

  const updateHistory = (id) => {
    setHistory(prev => {
      const todayCompleted = prev[today] || [];
      const isCompleted = todayCompleted.includes(id);

      let newTodayCompleted;
      if (isCompleted) {
        newTodayCompleted = todayCompleted.filter(hId => hId !== id);
      } else {
        newTodayCompleted = [...todayCompleted, id];
      }

      return {
        ...prev,
        [today]: newTodayCompleted
      };
    });
  };

  const handleProofConfirm = () => {
    if (activeHabit) {
      updateHistory(activeHabit.id);
    }
  };

  const handleShare = async () => {
    if (shareRef.current) {
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2 // High res
      });
      const image = canvas.toDataURL("image/png");

      // Create a link to download
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

  // Fix: Ensure we only count completed habits that still exist
  const completedCount = (history[today] || []).filter(id => habits.some(h => h.id === id)).length;
  const isAllDone = habits.length > 0 && completedCount === habits.length;

  return (
    <div className="app-container">
      <div className="glass-panel main-panel">
        <div className="header-row">
          <h1>Habit Tracker</h1>
          <div className="streak-display">
            🔥 {streak}
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
      </div>

      <div className="side-panel">
        <Award show={isAllDone} />
        <Calendar history={history} habits={habits} />
      </div>

      {/* Hidden Share Card */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ShareCard
          ref={shareRef}
          streak={streak}
          habits={habits}
          todayHabits={todayHabits}
        />
      </div>

      <ProofModal
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        onConfirm={handleProofConfirm}
        habit={activeHabit}
      />
    </div>
  );
}

export default App;

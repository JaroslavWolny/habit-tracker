import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Edit2, Trash2, Save, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const HabitItem = ({ habit, onToggle, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(habit.text);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(habit.id, editText);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (showConfirm) {
      onDelete(habit.id);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  const handleToggle = (e) => {
    if (!isEditing) {
      if (!habit.completed) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x, y },
          colors: ['#d946ef', '#8b5cf6', '#06b6d4', '#10b981'],
          disableForReducedMotion: true
        });
      }
      onToggle(habit.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`habit-item ${habit.completed ? 'completed' : ''}`}
    >
      <div className="habit-main" onClick={handleToggle}>
        <div className={`habit-checkbox ${habit.completed ? 'checked' : ''}`}>
          {habit.completed && <Check size={18} strokeWidth={4} color="white" />}
        </div>

        {isEditing ? (
          <input
            type="text"
            className="glass-input edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span className="habit-text">{habit.text}</span>
        )}

        <div className="habit-actions" onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <button className="icon-btn save-btn" onClick={handleSave}><Save size={18} /></button>
          ) : (
            <button className="icon-btn edit-btn" onClick={() => setIsEditing(true)}><Edit2 size={18} /></button>
          )}
          <button
            className={`icon-btn delete-btn ${showConfirm ? 'confirming' : ''}`}
            onClick={handleDelete}
          >
            {showConfirm ? <Trash2 size={18} color="#ef4444" /> : <X size={18} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HabitItem;

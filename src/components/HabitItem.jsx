import React, { useState } from 'react';

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

  const handleToggle = () => {
    if (!isEditing) {
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
        <motion.div
          className={`habit-checkbox ${habit.completed ? 'checked' : ''}`}
          whileTap={{ scale: 0.8 }}
          animate={{ scale: habit.completed ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {habit.completed && <Check size={18} strokeWidth={4} color="white" />}
        </motion.div>

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
          <div className="habit-info">
            <span className="habit-text">{habit.text}</span>
            {habit.streak > 0 && (
              <span className="habit-streak-badge">
                🔥 {habit.streak}
              </span>
            )}
          </div>
        )}

        <div className="habit-actions" onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <button className="icon-btn save-btn" onClick={handleSave} aria-label="Save habit"><Save size={18} /></button>
          ) : (
            <button className="icon-btn edit-btn" onClick={() => setIsEditing(true)} aria-label="Edit habit"><Edit2 size={18} /></button>
          )}
          <button
            className={`icon-btn delete-btn ${showConfirm ? 'confirming' : ''}`}
            onClick={handleDelete}
            aria-label="Delete habit"
          >
            {showConfirm ? <Trash2 size={18} color="#ef4444" /> : <X size={18} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HabitItem;

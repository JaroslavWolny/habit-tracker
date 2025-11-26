import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, Check, Dumbbell, Utensils, Moon, Brain } from 'lucide-react';
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

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'training': return <Dumbbell size={16} />;
      case 'nutrition': return <Utensils size={16} />;
      case 'recovery': return <Moon size={16} />;
      case 'knowledge': return <Brain size={16} />;
      default: return <Dumbbell size={16} />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`habit-item ${habit.completed ? 'completed' : ''} ${habit.category || 'training'}`}
    >
      <div className="habit-main" onClick={handleToggle}>
        <motion.div
          className={`habit-checkbox ${habit.completed ? 'checked' : ''}`}
          whileTap={{ scale: 0.8 }}
          animate={{ scale: habit.completed ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {habit.completed && <Check size={18} strokeWidth={4} color="black" />}
        </motion.div>

        <div className="habit-content-wrapper">
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
              <div className="habit-header">
                <span className={`category-icon ${habit.category || 'training'}`}>
                  {getCategoryIcon(habit.category)}
                </span>
                <span className="habit-text">{habit.text}</span>
              </div>
              {habit.streak > 0 && (
                <div className="habit-streak-badge">
                  <span className="fire-emoji">🔥</span>
                  <span className="streak-count">{habit.streak}</span>
                </div>
              )}
            </div>
          )}
        </div>

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

import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import './HabitItem.css';

const HabitItem = ({ habit, onToggle, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(habit.text);
  const [showConfirm, setShowConfirm] = useState(false);

  // Category Configuration (Same as AddHabit)
  const categoryConfig = {
    training: { label: 'Training', icon: '🏋️', color: '#39FF14' },
    nutrition: { label: 'Supplements', icon: '💊', color: '#FF39D1' },
    recovery: { label: 'Recovery', icon: '💤', color: '#39D1FF' },
    knowledge: { label: 'Knowledge', icon: '🧠', color: '#FFD139' },
    default: { label: 'General', icon: '⚡', color: '#FFFFFF' }
  };

  const getCategoryStyle = (cat) => {
    const normalizedCat = cat ? cat.toLowerCase() : 'training';
    return categoryConfig[normalizedCat] || categoryConfig.default;
  };

  const style = getCategoryStyle(habit.category);

  const handleSave = (e) => {
    e.stopPropagation();
    if (editText.trim()) {
      onEdit(habit.id, editText);
      setIsEditing(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
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
      className={`habit-item-v2 ${habit.completed ? 'completed' : ''}`}
      onClick={handleToggle}
      style={{
        '--item-color': style.color,
        '--item-glow': style.color + '66' // 40% opacity
      }}
    >
      {/* Icon Box */}
      <div className="habit-icon-box">
        {style.icon}
      </div>

      {/* Content */}
      <div className="habit-content">
        {isEditing ? (
          <input
            type="text"
            className="edit-input-v2"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave(e);
              if (e.key === 'Escape') setIsEditing(false);
            }}
          />
        ) : (
          <>
            <div className="habit-text-v2">{habit.text}</div>
            <div className="habit-meta">
              <span className="habit-category-label">{style.label}</span>
            </div>
          </>
        )}
      </div>

      {/* Actions (Visible on Hover/Edit) */}
      <div className="habit-actions-v2" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <button className="action-btn-v2 save" onClick={handleSave}>
            <Save size={16} />
          </button>
        ) : (
          <button className="action-btn-v2 edit" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
            <Edit2 size={16} />
          </button>
        )}

        <button className={`action-btn-v2 delete ${showConfirm ? 'confirm' : ''}`} onClick={handleDelete}>
          {showConfirm ? <Trash2 size={16} color="#ef4444" /> : <X size={16} />}
        </button>
      </div>

      {/* Checkbox Status */}
      <div className="habit-status-box">
        {habit.completed && <Check size={18} strokeWidth={4} />}
      </div>
    </motion.div>
  );
};

export default HabitItem;

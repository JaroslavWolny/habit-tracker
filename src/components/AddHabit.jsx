import React, { useState } from 'react';
import { Plus, Dumbbell, Utensils, Moon, Brain } from 'lucide-react';

const AddHabit = ({ onAdd }) => {
    const [text, setText] = useState('');
    const [category, setCategory] = useState('training'); // training, nutrition, recovery, knowledge

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text, category);
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-habit-form">
            <div className="category-select-wrapper">
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="glass-input category-select"
                    style={{
                        width: 'auto',
                        flex: '0 0 auto',
                        paddingRight: '1rem',
                        cursor: 'pointer',
                        appearance: 'none',
                        textAlign: 'center'
                    }}
                >
                    <option value="training">🏋️</option>
                    <option value="nutrition">🍗</option>
                    <option value="recovery">💤</option>
                    <option value="knowledge">🧠</option>
                </select>
            </div>
            <input
                type="text"
                className="glass-input"
                placeholder="Initialize protocol..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="glass-button" aria-label="Add habit">
                <Plus size={24} />
            </button>
        </form>
    );
};

export default AddHabit;

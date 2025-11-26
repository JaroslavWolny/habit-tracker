import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import './AddHabit.css';

const AddHabit = ({ onAdd }) => {
    const [text, setText] = useState('');
    const [category, setCategory] = useState('training');

    const categories = [
        { id: 'training', label: 'Training', icon: '🏋️', color: '#39FF14' },
        { id: 'nutrition', label: 'Supplements', icon: '💊', color: '#FF39D1' },
        { id: 'recovery', label: 'Recovery', icon: '💤', color: '#39D1FF' },
        { id: 'knowledge', label: 'Knowledge', icon: '🧠', color: '#FFD139' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text, category);
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-habit-container-v2">
            <div className="category-pills">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        className={`category-pill ${category === cat.id ? 'active' : ''}`}
                        onClick={() => setCategory(cat.id)}
                        style={{
                            '--pill-color': cat.color,
                            '--pill-glow': cat.color + '40' // 25% opacity
                        }}
                    >
                        <span className="pill-icon">{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="input-area">
                <input
                    type="text"
                    className="habit-input-v2"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What is your mission?"
                />
                <button type="submit" className="add-btn-v2" aria-label="Add habit">
                    <Plus />
                </button>
            </div>
        </form>
    );
};

export default AddHabit;

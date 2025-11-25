import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddHabit = ({ onAdd }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text);
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-habit-form">
            <input
                type="text"
                className="glass-input"
                placeholder="Add a new habit..."
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

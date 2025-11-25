import React, { useState } from 'react';

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
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
            <input
                type="text"
                className="glass-input"
                placeholder="Add a new habit..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="glass-button">
                Add
            </button>
        </form>
    );
};

export default AddHabit;

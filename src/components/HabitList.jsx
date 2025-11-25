import React from 'react';
import HabitItem from './HabitItem';

const HabitList = ({ habits, onToggle, onEdit, onDelete }) => {
    if (habits.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                <p>No habits yet. Add one to get started!</p>
            </div>
        );
    }

    return (
        <div className="habit-list">
            {habits.map(habit => (
                <HabitItem
                    key={habit.id}
                    habit={habit}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default HabitList;

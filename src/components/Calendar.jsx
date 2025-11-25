import React from 'react';

const Calendar = ({ history, habits }) => {
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const today = date.getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getDayStatus = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const completedIds = history[dateStr] || [];

        if (completedIds.length === 0) return 'empty';
        if (habits.length > 0 && completedIds.length === habits.length) return 'perfect';
        return 'partial';
    };

    return (
        <div className="glass-panel calendar-container">
            <h2>Streak Calendar</h2>
            <div className="calendar-grid">
                {days.map(day => {
                    const status = getDayStatus(day);
                    const isToday = day === today;
                    return (
                        <div
                            key={day}
                            className={`calendar-day ${status} ${isToday ? 'today' : ''}`}
                            title={`${status === 'perfect' ? 'All done!' : status === 'partial' ? 'Some done' : 'None done'}`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
            <div className="calendar-legend">
                <div className="legend-item"><span className="dot perfect"></span> Perfect</div>
                <div className="legend-item"><span className="dot partial"></span> Partial</div>
            </div>
        </div>
    );
};

export default Calendar;

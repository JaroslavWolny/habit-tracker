import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const Calendar = ({ history, habits }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay(); // 0 = Sunday

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Adjust for Monday start (optional, but common in EU)
    // 0 (Sun) -> 6, 1 (Mon) -> 0, ...
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const empties = Array.from({ length: startOffset }, (_, i) => i);

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDay(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDay(null);
    };

    const getDayData = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const completedIds = history[dateStr] || [];

        const currentDayDate = new Date(year, month, day);
        const endOfDay = new Date(currentDayDate);
        endOfDay.setHours(23, 59, 59, 999);

        const relevantHabits = habits.filter(h => {
            if (typeof h.id !== 'number') return true;
            return h.id <= endOfDay.getTime();
        });

        const total = relevantHabits.length;
        const completed = completedIds.length;
        const percentage = total === 0 ? 0 : (completed / total);

        let status = 'empty';
        if (total > 0) {
            if (completed === total) status = 'perfect';
            else if (completed > 0) status = 'partial';
        }

        return { status, percentage, completed, total, relevantHabits, completedIds, dateStr };
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="glass-panel calendar-container" style={{ overflow: 'hidden', position: 'relative' }}>
            <div className="calendar-header-row">
                <button onClick={prevMonth} className="icon-btn"><ChevronLeft size={20} /></button>
                <h3>{monthNames[month]} {year}</h3>
                <button onClick={nextMonth} className="icon-btn"><ChevronRight size={20} /></button>
            </div>

            <div className="calendar-weekdays">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                    <div key={d} className="weekday-label">{d}</div>
                ))}
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentDate.toISOString()}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="calendar-grid"
                >
                    {empties.map(e => <div key={`empty-${e}`} />)}
                    {days.map(day => {
                        const { status, percentage } = getDayData(day);
                        const isToday =
                            new Date().getDate() === day &&
                            new Date().getMonth() === month &&
                            new Date().getFullYear() === year;

                        return (
                            <motion.div
                                key={day}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDay(day)}
                                className={`calendar-day ${status} ${isToday ? 'today' : ''}`}
                                style={{
                                    '--opacity': status === 'partial' ? 0.3 + (percentage * 0.5) : 1
                                }}
                            >
                                {day}
                            </motion.div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            <div className="calendar-legend">
                <div className="legend-item"><span className="dot perfect"></span> Perfect</div>
                <div className="legend-item"><span className="dot partial"></span> Partial</div>
            </div>

            {/* Day Detail Modal */}
            <AnimatePresence>
                {selectedDay && (
                    <motion.div
                        className="calendar-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedDay(null)}
                    >
                        <motion.div
                            className="calendar-modal"
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h4>{monthNames[month]} {selectedDay}</h4>
                                <button onClick={() => setSelectedDay(null)} className="icon-btn"><X size={16} /></button>
                            </div>

                            <div className="modal-content">
                                {(() => {
                                    const data = getDayData(selectedDay);
                                    if (data.relevantHabits.length === 0) {
                                        return <p className="empty-text">No habits set for this day.</p>;
                                    }
                                    return (
                                        <div className="modal-habit-list">
                                            {data.relevantHabits.map(h => {
                                                const isDone = data.completedIds.includes(h.id);
                                                return (
                                                    <div key={h.id} className={`modal-habit-item ${isDone ? 'done' : ''}`}>
                                                        <span className="status-icon">{isDone ? '✅' : '⭕️'}</span>
                                                        <span>{h.text}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Calendar;

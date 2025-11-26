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
        // Only count completed habits that are still relevant (exist in habits list)
        const completed = completedIds.filter(id => relevantHabits.some(h => h.id === id)).length;
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
            <div className="calendar-bg-grid" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: 'linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px)',
                backgroundSize: '20px 20px', pointerEvents: 'none', zIndex: 0
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="calendar-header-row">
                    <button onClick={prevMonth} className="icon-btn"><ChevronLeft size={20} /></button>
                    <h3 style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{monthNames[month].toUpperCase()} {year}</h3>
                    <button onClick={nextMonth} className="icon-btn"><ChevronRight size={20} /></button>
                </div>

                <div className="calendar-weekdays">
                    {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(d => (
                        <div key={d} className="weekday-label" style={{ color: 'var(--primary)', opacity: 0.7 }}>{d}</div>
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
                                <div
                                    key={day}
                                    className={`calendar-day ${status} ${isToday ? 'today' : ''}`}
                                    style={{
                                        '--opacity': status === 'partial' ? 0.3 + (percentage * 0.5) : 1,
                                        boxShadow: status === 'perfect' ? '0 0 10px var(--primary)' : 'none',
                                        border: isToday ? '1px solid var(--primary)' : 'none'
                                    }}
                                    title={`${status === 'perfect' ? 'All done!' : status === 'partial' ? 'Some done' : 'None done'}`}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                <div className="calendar-legend" style={{ marginTop: '1.5rem' }}>
                    <div className="legend-item"><span className="dot perfect" style={{ boxShadow: '0 0 8px var(--primary)' }}></span> PERFECT</div>
                    <div className="legend-item"><span className="dot partial"></span> PARTIAL</div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;

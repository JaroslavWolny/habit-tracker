import React, { forwardRef } from 'react';
import './ShareCard.css';

const ShareCard = forwardRef(({ streak, habits, todayHabits }, ref) => {
    const completedCount = todayHabits.filter(h => h.completed).length;
    const totalCount = todayHabits.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Calculate stats for the graph
    const categories = {
        training: { total: 0, done: 0 },
        nutrition: { total: 0, done: 0 },
        recovery: { total: 0, done: 0 }
    };

    todayHabits.forEach(h => {
        const cat = h.category || 'training';
        if (categories[cat]) {
            categories[cat].total++;
            if (h.completed) categories[cat].done++;
        }
    });

    const getPercent = (cat) => {
        return categories[cat].total > 0
            ? (categories[cat].done / categories[cat].total) * 100
            : 0;
    };

    return (
        <div ref={ref} className="share-card-container">
            <div className="share-card-content">
                <div className="share-header">
                    <div className="share-logo">
                        <span className="logo-icon">⚡</span>
                        <span>OPTIMAL JARO</span>
                    </div>
                    <div className="share-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}</div>
                </div>

                <div className="share-main-stat">
                    <div className="stat-circle">
                        <svg viewBox="0 0 100 100" className="progress-ring">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1a1a" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke="#39FF14"
                                strokeWidth="8"
                                strokeDasharray={`${percentage * 2.83} 283`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="stat-inner">
                            <span className="stat-value">{percentage}%</span>
                            <span className="stat-label">OPTIMAL</span>
                        </div>
                    </div>
                    <div className="streak-badge">
                        🔥 {streak} DAY STREAK
                    </div>
                </div>

                <div className="share-pillars">
                    <div className="pillar-row">
                        <span className="pillar-label">TRAINING</span>
                        <div className="pillar-track">
                            <div className="pillar-fill" style={{ width: `${getPercent('training')}%` }}></div>
                        </div>
                    </div>
                    <div className="pillar-row">
                        <span className="pillar-label">NUTRITION</span>
                        <div className="pillar-track">
                            <div className="pillar-fill" style={{ width: `${getPercent('nutrition')}%` }}></div>
                        </div>
                    </div>
                    <div className="pillar-row">
                        <span className="pillar-label">RECOVERY</span>
                        <div className="pillar-track">
                            <div className="pillar-fill" style={{ width: `${getPercent('recovery')}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="share-footer">
                    <p>OPTIMIZED VIA @OPTIMALJARO</p>
                </div>
            </div>
        </div>
    );
});

export default ShareCard;

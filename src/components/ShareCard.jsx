import React, { forwardRef } from 'react';
import './ShareCard.css';

const ShareCard = forwardRef(({ streak, habits, todayHabits }, ref) => {
    const completedCount = todayHabits.filter(h => h.completed).length;
    const totalCount = habits.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Determine Rank
    let rank = "Novice";
    let rankColor = "#a1a1aa";
    if (streak >= 3) { rank = "Apprentice"; rankColor = "#06b6d4"; }
    if (streak >= 7) { rank = "Warrior"; rankColor = "#8b5cf6"; }
    if (streak >= 14) { rank = "Master"; rankColor = "#d946ef"; }
    if (streak >= 30) { rank = "Legend"; rankColor = "#f59e0b"; }

    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    return (
        <div ref={ref} className="share-card-container">
            <div className="share-card-bg"></div>
            <div className="share-content">
                <div className="share-header">
                    <div className="brand-pill">
                        <span className="brand-icon">✨</span>
                        <span>Habit Tracker</span>
                    </div>
                    <div className="date-badge">{todayStr}</div>
                </div>

                <div className="main-stats-grid">
                    <div className="stat-card streak-card">
                        <span className="stat-label">Current Streak</span>
                        <div className="stat-value-large">
                            <span className="fire-icon">🔥</span>
                            {streak}
                        </div>
                        <div className="stat-sub">Days on fire</div>
                    </div>

                    <div className="stat-card rank-card" style={{ '--rank-color': rankColor }}>
                        <span className="stat-label">Daily Rank</span>
                        <div className="rank-value">{rank}</div>
                        <div className="rank-progress">
                            <div className="rank-bar" style={{ width: `${percentage}%`, background: rankColor }}></div>
                        </div>
                    </div>
                </div>

                <div className="habits-preview-card">
                    <h3>Today's Focus</h3>
                    <div className="preview-list">
                        {todayHabits.slice(0, 5).map((habit, index) => (
                            <div key={index} className={`preview-item ${habit.completed ? 'done' : ''}`}>
                                <div className="preview-checkbox">
                                    {habit.completed && <span className="check-mark">✓</span>}
                                </div>
                                <span className="preview-text">{habit.text}</span>
                            </div>
                        ))}
                        {todayHabits.length > 5 && (
                            <div className="more-habits">+{todayHabits.length - 5} more</div>
                        )}
                    </div>
                </div>

                <div className="share-footer">
                    <div className="footer-line"></div>
                    <p>Building better habits, one day at a time.</p>
                </div>
            </div>
        </div>
    );
});

export default ShareCard;

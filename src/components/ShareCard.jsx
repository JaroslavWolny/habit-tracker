import React, { forwardRef } from 'react';

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
        <div ref={ref} className="share-card">
            <div className="share-content">
                <div className="share-header">
                    <div className="date-badge">{todayStr}</div>
                    <h2>Daily Grind</h2>
                </div>

                <div className="stats-row">
                    <div className="stat-box">
                        <span className="stat-label">Streak</span>
                        <span className="stat-value fire-text">🔥 {streak}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Rank</span>
                        <span className="stat-value" style={{ color: rankColor }}>{rank}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Done</span>
                        <span className="stat-value">{percentage}%</span>
                    </div>
                </div>

                <div className="habits-preview">
                    <h3>Today's Mission</h3>
                    <div className="preview-list">
                        {todayHabits.map((habit, index) => (
                            <div key={index} className={`preview-item ${habit.completed ? 'done' : ''}`}>
                                <div className="preview-checkbox">
                                    {habit.completed && "✓"}
                                </div>
                                <span className="preview-text">{habit.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="share-footer">
                    <p>Built with #HabitTracker</p>
                </div>
            </div>
        </div>
    );
});

export default ShareCard;

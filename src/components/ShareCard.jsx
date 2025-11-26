import React, { forwardRef } from 'react';
import './ShareCard.css';

const ShareCard = forwardRef(({ streak, habits, todayHabits }, ref) => {
    const completedCount = todayHabits.filter(h => h.completed).length;
    const totalCount = todayHabits.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Map categories to icons/labels/colors
    const categoryConfig = {
        training: { label: 'TRAINING', icon: '🏋️', color: '#39FF14' },
        nutrition: { label: 'NUTRITION', icon: '🥑', color: '#FF39D1' },
        recovery: { label: 'RECOVERY', icon: '💤', color: '#39D1FF' },
        knowledge: { label: 'KNOWLEDGE', icon: '🧠', color: '#FFD139' },
        default: { label: 'GENERAL', icon: '⚡', color: '#FFFFFF' }
    };

    const getCategoryStyle = (cat) => {
        const normalizedCat = cat ? cat.toLowerCase() : 'default';
        return categoryConfig[normalizedCat] || categoryConfig.default;
    };

    return (
        <div ref={ref} className="share-card-container-v3">
            {/* Background Elements */}
            <div className="bg-grid"></div>
            <div className="bg-glow-orb orb-top"></div>
            <div className="bg-glow-orb orb-bottom"></div>
            <div className="glass-surface"></div>

            <div className="card-content">
                {/* Header */}
                <div className="card-header">
                    <div className="brand-badge">
                        <span className="brand-icon">⚡</span>
                        <span className="brand-text">OPTIMAL PROTOCOL</span>
                    </div>
                    <div className="date-badge">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                    </div>
                </div>

                {/* Main Stats - Hero Section */}
                <div className="hero-stats">
                    <div className="progress-container">
                        <svg viewBox="0 0 100 100" className="progress-ring-hero">
                            <circle cx="50" cy="50" r="45" className="ring-bg" />
                            <circle
                                cx="50" cy="50" r="45"
                                className="ring-fill"
                                strokeDasharray={`${percentage * 2.83} 283`}
                                style={{ stroke: percentage === 100 ? '#39FF14' : '#ffffff' }}
                            />
                        </svg>
                        <div className="progress-content">
                            <span className="progress-percent">{percentage}%</span>
                            <span className="progress-label">COMPLETE</span>
                        </div>
                    </div>

                    <div className="streak-container">
                        <div className="streak-value">
                            <span className="fire-icon">🔥</span>
                            <span>{streak}</span>
                        </div>
                        <div className="streak-label">DAY STREAK</div>
                    </div>
                </div>

                {/* Habits List */}
                <div className="habits-section">
                    <div className="section-title">TODAY'S MISSIONS</div>
                    <div className="habits-list">
                        {todayHabits.map((h, i) => {
                            const style = getCategoryStyle(h.category);
                            return (
                                <div key={i} className={`habit-item ${h.completed ? 'completed' : 'pending'}`}>
                                    <div className="habit-icon-wrapper" style={{
                                        backgroundColor: h.completed ? style.color : 'rgba(255,255,255,0.05)',
                                        color: h.completed ? '#000' : '#fff'
                                    }}>
                                        {style.icon}
                                    </div>
                                    <div className="habit-info">
                                        <span className="habit-text">{h.text}</span>
                                        <span className="habit-category" style={{ color: style.color }}>{style.label}</span>
                                    </div>
                                    <div className="habit-status-icon">
                                        {h.completed ? '✓' : '•'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="card-footer">
                    <div className="footer-handle">@OPTIMALJARO</div>
                    <div className="footer-tag">#BECOMEOPTIMAL</div>
                </div>
            </div>
        </div>
    );
});

export default ShareCard;

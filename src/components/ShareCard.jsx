import React, { forwardRef } from 'react';
import './ShareCard.css';
import { QRCodeSVG } from 'qrcode.react';

const ShareCard = forwardRef(({ streak, habits, todayHabits, history }, ref) => {
    // 1. Calculate Rank & Stats
    const totalHabits = todayHabits.length;
    const completedHabits = todayHabits.filter(h => h.completed).length;
    const completionRate = totalHabits > 0 ? completedHabits / totalHabits : 0;

    let rank = { label: 'UNSTABLE', grade: 'C', color: 'var(--danger)', glow: 'rgba(239, 68, 68, 0.5)' };
    if (completionRate >= 1) {
        rank = { label: 'OPTIMAL STATE', grade: 'S', color: 'var(--neon-green)', glow: 'rgba(57, 255, 20, 0.5)' };
    } else if (completionRate >= 0.8) {
        rank = { label: 'SYSTEM STABLE', grade: 'A', color: 'var(--cyber-blue)', glow: 'rgba(57, 209, 255, 0.5)' };
    } else if (completionRate >= 0.5) {
        rank = { label: 'ACCEPTABLE', grade: 'B', color: 'var(--gold)', glow: 'rgba(255, 209, 57, 0.5)' };
    }

    // 2. Determine Focus (Dominant Category)
    const catCounts = {};
    todayHabits.forEach(h => {
        const cat = h.category || 'general';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    const focusCategory = sortedCats.length > 0 ? sortedCats[0][0].toUpperCase() : 'GENERAL';

    const categoryIcons = {
        TRAINING: '🏋️',
        NUTRITION: '💊',
        RECOVERY: '💤',
        KNOWLEDGE: '🧠',
        GENERAL: '⚡'
    };

    // 3. Date Formatting
    const dateObj = new Date();
    const dateStr = `${dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${dateObj.getDate()} // ${dateObj.getFullYear()}`;

    return (
        <div ref={ref} className="share-card-hud">
            {/* A. Background & Atmosphere */}
            <div className="hud-grid-overlay"></div>
            <div className="hud-glow-top-left"></div>
            <div className="hud-glow-bottom-right"></div>
            <div className="hud-scanline"></div>

            <div className="hud-content">
                {/* B. Header */}
                <div className="hud-header">
                    <div className="brand-pill">
                        <span className="brand-icon">⚡</span>
                        <span className="brand-text">OPTIMAL PROTOCOL</span>
                    </div>
                    <div className="hud-date">{dateStr}</div>
                </div>

                {/* C. Hero Section: Daily Rank */}
                <div className="hud-hero">
                    <div className="rank-circle-container">
                        <div className="rank-circle-glow" style={{ boxShadow: `0 0 60px ${rank.glow}, inset 0 0 30px ${rank.glow}` }}></div>
                        <div className="rank-circle-border" style={{ borderColor: rank.color }}></div>
                        <div className="rank-grade" style={{ color: rank.color, textShadow: `0 0 20px ${rank.color}` }}>
                            {rank.grade}
                        </div>
                    </div>
                    <div className="rank-label" style={{ color: rank.color }}>
                        {rank.label}
                    </div>
                    <div className="rank-sub">
                        /// SYNC RATE: {Math.round(completionRate * 100)}% ///
                    </div>
                </div>

                {/* D. Stats Grid (Bento) */}
                <div className="hud-stats-grid">
                    <div className="hud-stat-box">
                        <div className="stat-label">CURRENT STREAK</div>
                        <div className="stat-value">
                            {streak} <span className="stat-unit">DAYS</span>
                            {streak > 7 && <span className="stat-flame">🔥</span>}
                        </div>
                    </div>
                    <div className="hud-stat-box">
                        <div className="stat-label">PRIMARY FOCUS</div>
                        <div className="stat-value-icon">
                            {categoryIcons[focusCategory] || '⚡'} {focusCategory}
                        </div>
                    </div>
                </div>

                {/* E. Protocol Log */}
                <div className="hud-log-section">
                    <div className="log-header">{">>"} PROTOCOL LOG_</div>
                    <div className="log-list">
                        {todayHabits.slice(0, 6).map((habit, i) => (
                            <div key={habit.id || i} className={`log-item ${habit.completed ? 'completed' : 'pending'}`}>
                                <span className="log-prefix">{habit.completed ? '[x]' : '[ ]'}</span>
                                <span className="log-text">{habit.text}</span>
                            </div>
                        ))}
                        {todayHabits.length > 6 && (
                            <div className="log-more">...and {todayHabits.length - 6} more modules</div>
                        )}
                    </div>
                </div>

                {/* F. Footer (Acquisition) */}
                <div className="hud-footer">
                    <div className="footer-cta">
                        <div className="cta-title">INITIALIZE YOUR TWIN</div>
                        <div className="cta-sub">Available on iOS & Android</div>
                    </div>
                    <div className="footer-qr">
                        <QRCodeSVG
                            value="https://optimalapp.com/download"
                            size={100}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="L"
                            includeMargin={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ShareCard;

import React, { forwardRef } from 'react';
import './ShareCard.css';
import { QRCodeSVG } from 'qrcode.react';

const ShareCard = forwardRef(({ streak, habits, todayHabits, history }, ref) => {
    // Determine dominant category for dynamic background
    const categories = todayHabits.map(h => h.category || 'training');
    const dominantCategory = categories.sort((a, b) =>
        categories.filter(v => v === a).length - categories.filter(v => v === b).length
    ).pop() || 'training';

    const categoryColors = {
        training: { from: '#0f380f', to: '#000000', accent: '#39FF14' },
        nutrition: { from: '#380f2e', to: '#000000', accent: '#FF39D1' },
        recovery: { from: '#0f2e38', to: '#000000', accent: '#39D1FF' },
        knowledge: { from: '#382e0f', to: '#000000', accent: '#FFD139' },
        default: { from: '#1a1a1a', to: '#000000', accent: '#ffffff' }
    };

    const theme = categoryColors[dominantCategory] || categoryColors.default;

    // Generate last 30 days heatmap data
    const getHeatmapData = () => {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            // Calculate completion for this day
            // Note: history needs to be passed to ShareCard. If not available, mock or use partial data.
            // Assuming history is passed or we use a simplified version for now.
            // For this implementation, we'll simulate "perfect" days based on streak logic if history isn't fully available in props yet,
            // but ideally 'history' prop should be passed from App.jsx.
            // Let's assume history IS passed.

            const completedIds = history?.[dateStr] || [];
            // Simple logic: if at least one habit done, it's active. If all, it's perfect.
            // For visual simplicity: 0 = empty, 1 = partial, 2 = perfect
            let status = 0;
            if (completedIds.length > 0) status = 1;
            if (habits.length > 0 && completedIds.length >= habits.length) status = 2;

            days.push({ date: dateStr, status });
        }
        return days;
    };

    const heatmapData = getHeatmapData();

    return (
        <div ref={ref} className="share-card-bento" style={{
            background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`
        }}>
            {/* Noise Texture Overlay */}
            <div className="noise-overlay"></div>

            <div className="bento-content">
                {/* Header */}
                <div className="bento-header">
                    <div className="app-badge">
                        <span className="app-icon">⚡</span>
                        <span className="app-name">OPTIMAL APP</span>
                    </div>
                    <div className="date-display">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                    </div>
                </div>

                {/* Hero Streak Section */}
                <div className="bento-hero">
                    <div className="hero-ring-bg"></div>
                    <div className="hero-value" style={{ textShadow: `0 0 40px ${theme.accent}66` }}>
                        {streak}
                    </div>
                    <div className="hero-label">DAY STREAK</div>
                    {streak > 30 && <div className="hero-flame">🔥 UNSTOPPABLE</div>}
                </div>

                {/* Heatmap Visualization */}
                <div className="bento-grid-item heatmap-section">
                    <div className="section-label">CONSISTENCY (30 DAYS)</div>
                    <div className="heatmap-grid">
                        {heatmapData.map((day, i) => (
                            <div
                                key={i}
                                className={`heatmap-cell status-${day.status}`}
                                style={{
                                    backgroundColor: day.status === 2 ? theme.accent :
                                        day.status === 1 ? `${theme.accent}40` :
                                            'rgba(255,255,255,0.1)'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Habits List */}
                <div className="bento-grid-item habits-section-bento">
                    <div className="section-label">TODAY'S PROTOCOL</div>
                    <div className="habits-list-bento">
                        {todayHabits.map((h, i) => (
                            <div key={i} className="habit-row-bento">
                                <span className="habit-icon-bento">{
                                    h.category === 'training' ? '🏋️' :
                                        h.category === 'nutrition' ? '💊' :
                                            h.category === 'recovery' ? '💤' :
                                                h.category === 'knowledge' ? '🧠' : '⚡'
                                }</span>
                                <span className="habit-text-bento">{h.text}</span>
                                <div className="habit-check-bento" style={{
                                    borderColor: h.completed ? theme.accent : 'rgba(255,255,255,0.2)',
                                    backgroundColor: h.completed ? theme.accent : 'transparent',
                                    color: h.completed ? '#000' : 'transparent'
                                }}>✓</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Viral Footer */}
                <div className="bento-footer">
                    <div className="footer-left">
                        <div className="viral-hook">
                            BEAT MY STREAK ON<br />
                            <span style={{ color: theme.accent }}>OPTIMAL APP</span>
                        </div>
                        <div className="download-cta">
                            Available on iOS & Android
                        </div>
                    </div>
                    <div className="footer-right">
                        <div className="qr-code-wrapper">
                            <QRCodeSVG
                                value="https://optimalapp.com/download"
                                size={80}
                                bgColor="transparent"
                                fgColor="#ffffff"
                                level="L"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ShareCard;

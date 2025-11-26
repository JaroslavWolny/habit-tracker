import React, { forwardRef } from 'react';
import './ShareCard.css';
import { QRCodeSVG } from 'qrcode.react';

const ShareCard = forwardRef(({ streak, habits, todayHabits, history }, ref) => {
    // Determine dominant category for dynamic background
    const catList = todayHabits.map(h => h.category || 'training');
    const dominantCategory = catList.sort((a, b) =>
        catList.filter(v => v === a).length - catList.filter(v => v === b).length
    ).pop() || 'training';

    const categoryColors = {
        training: { from: '#0f380f', to: '#000000', accent: '#39FF14', icon: '🏋️', label: 'TRAINING' },
        nutrition: { from: '#380f2e', to: '#000000', accent: '#FF39D1', icon: '💊', label: 'SUPPLEMENTS' },
        recovery: { from: '#0f2e38', to: '#000000', accent: '#39D1FF', icon: '💤', label: 'RECOVERY' },
        knowledge: { from: '#382e0f', to: '#000000', accent: '#FFD139', icon: '🧠', label: 'KNOWLEDGE' },
        default: { from: '#1a1a1a', to: '#000000', accent: '#ffffff', icon: '⚡', label: 'GENERAL' }
    };

    const theme = categoryColors[dominantCategory] || categoryColors.default;

    // Calculate Pillar Stats
    const pillars = {
        training: { ...categoryColors.training, total: 0, done: 0 },
        nutrition: { ...categoryColors.nutrition, total: 0, done: 0 },
        recovery: { ...categoryColors.recovery, total: 0, done: 0 },
        knowledge: { ...categoryColors.knowledge, total: 0, done: 0 }
    };

    todayHabits.forEach(h => {
        const cat = h.category || 'training';
        if (pillars[cat]) {
            pillars[cat].total++;
            if (h.completed) pillars[cat].done++;
        }
    });

    // Generate last 30 days heatmap data
    const getHeatmapData = () => {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const completedIds = history?.[dateStr] || [];
            // Check if ALL habits active on that day were done. 
            // Simplified: If > 0 done, partial. If count matches habits length (approx), perfect.
            // Ideally we'd check historical habit count, but for viz this is okay.
            let status = 0;
            if (completedIds.length > 0) status = 1;
            // Heuristic for perfect day in history without full historical snapshot:
            if (completedIds.length >= habits.length && habits.length > 0) status = 2;

            days.push({ date: dateStr, status });
        }
        return days;
    };

    const heatmapData = getHeatmapData();

    return (
        <div ref={ref} className="share-card-bento" style={{
            background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`
        }}>
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

                {/* Hero Streak */}
                <div className="bento-hero">
                    <div className="hero-ring-bg"></div>
                    <div className="hero-value" style={{ textShadow: `0 0 40px ${theme.accent}66` }}>
                        {streak}
                    </div>
                    <div className="hero-label">DAY STREAK</div>
                    {streak > 30 && <div className="hero-flame">🔥 UNSTOPPABLE</div>}
                </div>

                {/* Pillars Grid (Replaces Habit List) */}
                <div className="pillars-grid-section">
                    <div className="section-label">DAILY PROTOCOL</div>
                    <div className="pillars-grid">
                        {Object.entries(pillars).map(([key, data]) => {
                            const percent = data.total > 0 ? (data.done / data.total) * 100 : 0;
                            const isDone = data.total > 0 && data.done === data.total;

                            return (
                                <div key={key} className="pillar-card" style={{
                                    borderColor: isDone ? data.accent : 'rgba(255,255,255,0.1)',
                                    background: isDone ? `${data.accent}15` : 'rgba(255,255,255,0.03)'
                                }}>
                                    <div className="pillar-icon">{data.icon}</div>
                                    <div className="pillar-info">
                                        <div className="pillar-name" style={{ color: isDone ? data.accent : 'white' }}>{data.label}</div>
                                        <div className="pillar-stat">
                                            {data.total === 0 ? 'REST' : `${data.done}/${data.total} DONE`}
                                        </div>
                                    </div>
                                    {isDone && <div className="pillar-check" style={{ color: data.accent }}>✓</div>}

                                    {/* Progress Bar */}
                                    <div className="pillar-progress-bg">
                                        <div className="pillar-progress-fill" style={{
                                            width: `${percent}%`,
                                            backgroundColor: data.accent
                                        }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Heatmap (Calendar) */}
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

                {/* Footer */}
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

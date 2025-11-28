import React, { forwardRef } from 'react';
import './ShareCard.css';

const ShareCard = forwardRef(({ streak, habits, todayHabits, history }, ref) => {
    // 1. Výpočet skóre
    const totalHabits = habits.length;
    const completedToday = todayHabits.filter(h => h.completed).length;
    const completionRate = totalHabits > 0 ? (completedToday / totalHabits) : 0;

    // 2. Nová logika STATUSŮ (Identity System)
    let statusTitle = 'ROOKIE';
    let statusColor = '#94a3b8'; // Grey
    let statusGlow = '0 0 0 transparent';
    let subMessage = 'SYSTEM OFFLINE';

    if (completionRate === 1) {
        statusTitle = 'GODLIKE';
        statusColor = '#39FF14'; // Neon Green
        statusGlow = '0 0 40px rgba(57, 255, 20, 0.6)';
        subMessage = 'MAXIMUM EFFICIENCY';
    } else if (completionRate >= 0.8) {
        statusTitle = 'VANGUARD';
        statusColor = '#39D1FF'; // Cyan
        statusGlow = '0 0 30px rgba(57, 209, 255, 0.4)';
        subMessage = 'HIGH PERFORMANCE';
    } else if (completionRate >= 0.4) {
        statusTitle = 'OPERATIVE';
        statusColor = '#FFD139'; // Gold
        statusGlow = '0 0 20px rgba(255, 209, 57, 0.3)';
        subMessage = 'SYSTEM STABLE';
    } else if (completionRate > 0) {
        statusTitle = 'DRIFTER';
        statusColor = '#ff6b6b'; // Red
        subMessage = 'LOW ENERGY';
    }

    // Kategorizace pro vizuál (s opravou Nutrition -> Supplements)
    const categories = {
        training: { label: 'TRAINING', count: 0, done: 0, color: '#39FF14' },
        nutrition: { label: 'SUPPLEMENTS', count: 0, done: 0, color: '#FF39D1' }, // RENAMED
        recovery: { label: 'RECOVERY', count: 0, done: 0, color: '#39D1FF' },
        knowledge: { label: 'KNOWLEDGE', count: 0, done: 0, color: '#FFD139' }
    };

    todayHabits.forEach(h => {
        const cat = (h.category || 'training').toLowerCase();
        // Map old nutrition category to new structure if needed, or assume data is clean
        const targetCat = cat === 'nutrition' ? 'nutrition' : cat;

        if (categories[targetCat]) {
            categories[targetCat].count++;
            if (h.completed) categories[targetCat].done++;
        }
    });

    return (
        <div ref={ref} className="share-card-v2">
            {/* Ambient Background */}
            <div className="bg-noise"></div>
            <div className="bg-gradient"></div>
            <div className="corner-accent top-left" style={{ borderColor: statusColor }}></div>
            <div className="corner-accent bottom-right" style={{ borderColor: statusColor }}></div>

            <div className="card-inner">
                {/* --- HEADER --- */}
                <header className="card-header">
                    <div className="brand-tag">
                        <span className="bolt">⚡</span> OPTIMAL PROTOCOL
                    </div>
                    <div className="date-tag">
                        {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()}
                    </div>
                </header>

                {/* --- MAIN REACTOR (Identity) --- */}
                <section className="status-core">
                    <div className="core-ring-outer" style={{ borderColor: `${statusColor}33` }}>
                        <div className="core-ring-inner" style={{ borderColor: statusColor, boxShadow: statusGlow }}>
                            <div className="streak-val">{streak}</div>
                            <div className="streak-label">DAY STREAK</div>
                        </div>
                    </div>

                    <div className="status-title-group">
                        <div className="status-label">CURRENT DESIGNATION</div>
                        <h1 className="status-main" style={{ color: statusColor, textShadow: statusGlow }}>
                            {statusTitle}
                        </h1>
                        <div className="status-sub">/// {subMessage} ///</div>
                    </div>
                </section>

                {/* --- TACTICAL READOUT (Stats) --- */}
                <section className="tactical-grid">
                    {Object.values(categories).map((cat) => (
                        cat.count > 0 && (
                            <div key={cat.label} className="tactical-row">
                                <div className="tactical-info">
                                    <span className="t-label">{cat.label}</span>
                                    <span className="t-val" style={{ color: cat.done === cat.count ? cat.color : '#666' }}>
                                        {cat.done}/{cat.count}
                                    </span>
                                </div>
                                <div className="tactical-bar-bg">
                                    <div
                                        className="tactical-bar-fill"
                                        style={{
                                            width: `${(cat.done / cat.count) * 100}%`,
                                            backgroundColor: cat.color,
                                            boxShadow: cat.done === cat.count ? `0 0 10px ${cat.color}` : 'none'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )
                    ))}
                </section>

                {/* --- VIRAL FOOTER --- */}
                <footer className="card-footer">
                    <div className="footer-content">
                        <div className="cta-text">
                            <h2>INITIALIZE<br />YOUR TWIN</h2>
                            <p>Available on iOS & Android</p>
                        </div>
                        <div className="qr-box">
                            {/* Static QR for stability */}
                            <img
                                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://optimalapp.com/download&color=000000&bgcolor=ffffff&margin=0"
                                alt="Get App"
                            />
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
});

export default ShareCard;

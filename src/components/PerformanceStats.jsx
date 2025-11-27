import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- SUB-COMPONENTS ---

const SegmentedBar = ({ value, color }) => {
    // Value is 0-100. Split into 20 segments (each = 5%).
    const segments = Array.from({ length: 20 }, (_, i) => {
        const threshold = (i + 1) * 5;
        const isActive = value >= threshold;

        // Determine color based on value tier
        let segmentColor = color;
        if (value < 30) segmentColor = '#ff003c'; // Critical Red
        else if (value < 70) segmentColor = '#facc15'; // Stabilizing Yellow
        else segmentColor = '#39FF14'; // Optimal Green

        return (
            <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{
                    opacity: isActive ? 1 : 0.2,
                    backgroundColor: isActive ? segmentColor : '#333',
                    boxShadow: isActive ? `0 0 5px ${segmentColor}` : 'none'
                }}
                transition={{ delay: i * 0.02 }} // Domino effect
                style={{
                    width: '6px',
                    height: '100%',
                    borderRadius: '1px',
                    marginRight: '2px' // Gap between segments
                }}
            />
        );
    });

    return <div style={{ display: 'flex', height: '12px', width: '100%', alignItems: 'center' }}>{segments}</div>;
};

const ScrambleNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let steps = 0;
        const maxSteps = 20;
        const interval = setInterval(() => {
            if (steps >= maxSteps) {
                setDisplayValue(Math.round(value));
                clearInterval(interval);
            } else {
                setDisplayValue(Math.floor(Math.random() * 100));
                steps++;
            }
        }, 50);

        return () => clearInterval(interval);
    }, [value]);

    return <span className="stat-value-mono">{displayValue.toString().padStart(3, '0')}%</span>;
};

const PerformanceStats = ({ stats }) => {
    // stats: { str: number, rec: number, know: number } (0-100)

    const categories = [
        { id: 'str', label: 'STR', name: 'STRENGTH', value: stats.str },
        { id: 'rec', label: 'REC', name: 'RECOVERY', value: stats.rec },
        { id: 'know', label: 'KNOW', name: 'KNOWLEDGE', value: stats.know }
    ];

    return (
        <div className="performance-stats-container" style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '16px',
            border: '1px solid rgba(57, 255, 20, 0.1)'
        }}>
            {categories.map(cat => (
                <div key={cat.id} className="stat-bar-row" style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    fontFamily: "'Courier New', monospace" // Fallback mono
                }}>
                    <div className="stat-label-group" style={{
                        width: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        marginRight: '1rem',
                        color: 'var(--text-secondary)'
                    }}>
                        <span className="stat-code" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                            [{cat.label}]
                        </span>
                    </div>

                    <div className="stat-track" style={{ flex: 1, marginRight: '1rem' }}>
                        <SegmentedBar value={cat.value} color="var(--primary)" />
                    </div>

                    <ScrambleNumber value={cat.value} />
                </div>
            ))}

            <style>{`
                .stat-value-mono {
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    color: white;
                    width: 50px;
                    text-align: right;
                }
            `}</style>
        </div>
    );
};

export default PerformanceStats;

import React from 'react';
import { motion } from 'framer-motion';

const PerformanceStats = ({ stats }) => {
    // stats: { str: number, rec: number, know: number } (Levels or Cumulative Score)
    // For daily view, we might want percentages of daily goals.
    // Let's assume input is 0-100% for daily progress.

    const categories = [
        { id: 'str', label: 'STR', name: 'STRENGTH', value: stats.str, color: 'var(--primary)' },
        { id: 'rec', label: 'REC', name: 'RECOVERY', value: stats.rec, color: 'var(--primary)' },
        { id: 'know', label: 'KNOW', name: 'KNOWLEDGE', value: stats.know, color: 'var(--primary)' }
    ];

    return (
        <div className="performance-stats-container">
            {categories.map(cat => (
                <div key={cat.id} className="stat-bar-row">
                    <div className="stat-label-group">
                        <span className="stat-code">{cat.label}</span>
                        <span className="stat-name">{cat.name}</span>
                    </div>
                    <div className="stat-track">
                        <motion.div
                            className="stat-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.value}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ background: cat.color }}
                        />
                    </div>
                    <span className="stat-value-text">{Math.round(cat.value)}%</span>
                </div>
            ))}
        </div>
    );
};

export default PerformanceStats;

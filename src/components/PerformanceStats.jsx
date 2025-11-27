import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- SUB-COMPONENTS ---

const StatModule = ({ label, value, color }) => (
    <div className="stat-module">
        <div className="stat-ring-wrapper">
            <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <motion.path
                    className="circle"
                    strokeDasharray={`${value}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    style={{ stroke: color }}
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${value}, 100` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="stat-number">{Math.round(value)}%</div>
        </div>
        <div className="stat-label-tech">{label}</div>
    </div>
);

const PerformanceStats = ({ stats }) => {
    // stats: { str: number, rec: number, know: number } (0-100)

    return (
        <div className="performance-stats-container" style={{ marginTop: '0.5rem' }}>
            <div className="power-grid-container">
                <StatModule label="STR" value={stats.str} color="#39FF14" />
                <StatModule label="REC" value={stats.rec} color="#39D1FF" />
                <StatModule label="KNOW" value={stats.know} color="#FFD139" />
            </div>

            <style>{`
                .power-grid-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 10px;
                    width: 100%;
                }

                .stat-module {
                    background: rgba(10, 10, 10, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 10px 5px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(5px);
                }

                .stat-ring-wrapper {
                    position: relative;
                    width: 60px;
                    height: 60px;
                    margin-bottom: 5px;
                }

                .circular-chart {
                    display: block;
                    margin: 0 auto;
                    max-width: 100%;
                    max-height: 100%;
                }

                .circle-bg {
                    fill: none;
                    stroke: #222;
                    stroke-width: 3.8;
                }

                .circle {
                    fill: none;
                    stroke-width: 2.8;
                    stroke-linecap: round;
                }

                .stat-number {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    font-size: 12px;
                    color: white;
                }

                .stat-label-tech {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    font-weight: bold;
                    color: #888;
                    letter-spacing: 1px;
                }
            `}</style>
        </div>
    );
};

export default PerformanceStats;

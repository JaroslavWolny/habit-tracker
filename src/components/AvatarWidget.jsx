import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap } from 'lucide-react';

const AvatarWidget = ({ avatar, onRevive }) => {
    const [animationState, setAnimationState] = useState('idle'); // idle, happy, hurt

    // Determine avatar image/emoji based on stage and health
    const getAvatarEmoji = () => {
        if (avatar.isDead) return '🪦';
        if (avatar.health <= 0) return '💀';
        if (avatar.health < 30) return '🤒';

        switch (avatar.stage) {
            case 1: return '🥚';
            case 2: return '🐣';
            case 3: return '🦅'; // Or maybe a dragon 🐉
            default: return '🥚';
        }
    };

    // Listen for mood changes passed via props or context if we were using it
    // For now, we rely on parent triggering re-renders or we could expose a method
    // But simpler: The parent App.jsx will handle the logic, we just visualize data.

    // Animation variants
    const variants = {
        idle: {
            scale: [1, 1.05, 1],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        },
        happy: {
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
            transition: { duration: 0.5 }
        },
        hurt: {
            x: [-5, 5, -5, 5, 0],
            rotate: [-5, 5, -5, 5, 0],
            filter: ["hue-rotate(0deg)", "hue-rotate(90deg)", "hue-rotate(0deg)"], // Reddish tint simulation
            transition: { duration: 0.4 }
        },
        dead: {
            rotate: 180,
            y: 10,
            opacity: 0.8
        }
    };

    const currentVariant = avatar.isDead ? 'dead' : animationState;

    // Calculate progress bars
    const healthPercent = Math.max(0, Math.min(100, avatar.health));

    // XP Thresholds
    const getNextLevelXp = (stage) => {
        if (stage === 1) return 500;
        if (stage === 2) return 1500;
        return 3000; // Cap or next stage
    };

    const nextLevelXp = getNextLevelXp(avatar.stage);
    const xpPercent = Math.min(100, (avatar.xp / nextLevelXp) * 100);

    return (
        <div className="glass-panel avatar-widget">
            <div className="avatar-display">
                <motion.div
                    className="avatar-emoji"
                    variants={variants}
                    animate={currentVariant}
                    key={avatar.isDead ? 'dead' : 'alive'} // Force re-render on death
                >
                    {getAvatarEmoji()}
                </motion.div>

                {avatar.isDead && (
                    <button className="revive-btn" onClick={onRevive}>
                        Revive 🧪
                    </button>
                )}
            </div>

            <div className="avatar-stats">
                <div className="stat-row">
                    <Heart size={16} className="stat-icon health-icon" fill={healthPercent < 30 ? "#ef4444" : "#ec4899"} />
                    <div className="progress-bar-bg">
                        <motion.div
                            className="progress-bar-fill health-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${healthPercent}%` }}
                            style={{ backgroundColor: healthPercent < 30 ? '#ef4444' : '#ec4899' }}
                        />
                    </div>
                    <span className="stat-value">{Math.round(avatar.health)}%</span>
                </div>

                <div className="stat-row">
                    <Zap size={16} className="stat-icon xp-icon" fill="#eab308" />
                    <div className="progress-bar-bg">
                        <motion.div
                            className="progress-bar-fill xp-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${xpPercent}%` }}
                        />
                    </div>
                    <span className="stat-value">Lvl {avatar.stage}</span>
                </div>
            </div>
        </div>
    );
};

export default AvatarWidget;

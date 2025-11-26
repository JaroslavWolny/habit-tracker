import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MysteryBoxModal = ({ show, onClose, onRewardClaimed }) => {
    const [stage, setStage] = useState('closed'); // closed, shaking, open, revealed
    const [reward, setReward] = useState(null);

    useEffect(() => {
        if (show) {
            setStage('closed');
            setReward(null);
        }
    }, [show]);

    const handleOpen = () => {
        if (stage !== 'closed') return;

        setStage('shaking');

        // Determine reward
        const roll = Math.random();
        let selectedReward;

        if (roll < 0.1) {
            // 10% Rare Achievement
            const achievements = [
                { id: 'rare_gem', name: 'Rare Gem', icon: '🦄', type: 'achievement' },
                { id: 'week_warrior', name: 'Week Warrior', icon: '🔥', type: 'achievement' },
                { id: 'zen_master', name: 'Zen Master', icon: '🧘', type: 'achievement' }
            ];
            const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];
            selectedReward = randomAchievement;
        } else if (roll < 0.4) {
            // 30% Big XP
            selectedReward = { type: 'xp', amount: 50, icon: '✨', name: 'Big XP Boost' };
        } else {
            // 60% Standard
            selectedReward = { type: 'xp', amount: 10, icon: '⭐', name: 'XP Boost' };
        }

        setTimeout(() => {
            setStage('open');
            setTimeout(() => {
                setStage('revealed');
                setReward(selectedReward);
            }, 500);
        }, 1000);
    };

    const handleClaim = () => {
        onRewardClaimed(reward);
        onClose();
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="mystery-box-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="mystery-box-card"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                    >
                        <div className="mystery-content">
                            {stage === 'revealed' && reward ? (
                                <motion.div
                                    className="reward-reveal"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', damping: 12 }}
                                >
                                    <div className="reward-icon">{reward.icon}</div>
                                    <h3>{reward.name}</h3>
                                    {reward.type === 'xp' && <p>+{reward.amount} XP</p>}
                                    {reward.type === 'achievement' && <p>New Sticker Unlocked!</p>}

                                    <button className="glass-button claim-btn" onClick={handleClaim}>
                                        Awesome!
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="box-container" onClick={handleOpen}>
                                    <motion.div
                                        className="mystery-box"
                                        animate={stage === 'shaking' ? {
                                            x: [-5, 5, -5, 5, 0],
                                            rotate: [-5, 5, -5, 5, 0]
                                        } : {}}
                                        transition={{ duration: 0.5 }}
                                    >
                                        🎁
                                    </motion.div>
                                    <p>{stage === 'shaking' ? 'Opening...' : 'Tap to Open!'}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MysteryBoxModal;

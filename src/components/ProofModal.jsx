import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const ProofModal = ({ isOpen, onClose, onConfirm, habit }) => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [verifying, setVerifying] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        verifyProof();
    }, [webcamRef]);

    const verifyProof = () => {
        setVerifying(true);
        // Simulate AI verification
        setTimeout(() => {
            setVerifying(false);
            triggerSuccess();
        }, 2000);
    };

    const triggerSuccess = () => {
        try {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#d946ef', '#8b5cf6', '#06b6d4', '#10b981']
            });
        } catch (e) {
            console.error("Confetti error:", e);
        }

        // Call onConfirm immediately to update state
        console.log("Verifying habit completion for:", habit?.id);
        onConfirm(habit?.id);

        // Close modal after a short delay to show success state
        setTimeout(() => {
            onClose();
            setImgSrc(null);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="proof-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="proof-container">
                    <button className="close-proof-btn" onClick={onClose}>
                        <X size={32} />
                    </button>

                    {!imgSrc ? (
                        <div className="camera-view">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="webcam-feed"
                                videoConstraints={{ facingMode: "environment" }}
                            />
                            <div className="camera-overlay">
                                <h2>Prove it!</h2>
                                <p>Take a photo to verify "{habit?.text}"</p>
                                <button className="capture-btn" onClick={capture}>
                                    <div className="capture-inner"></div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="verification-view">
                            <img src={imgSrc} alt="Proof" className="proof-image" />
                            <div className="verification-overlay">
                                {verifying ? (
                                    <div className="verifying-status">
                                        <Loader2 className="spin-icon" size={48} />
                                        <h3>Verifying Proof...</h3>
                                        <p>Analyzing context...</p>
                                    </div>
                                ) : (
                                    <div className="success-status">
                                        <CheckCircle className="success-icon" size={64} />
                                        <h3>Verified!</h3>
                                        <p>Habit Completed</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProofModal;

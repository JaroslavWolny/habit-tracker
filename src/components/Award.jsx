import React from 'react';

const Award = ({ show }) => {
    if (!show) return null;

    return (
        <div className="award-container animate-pop-in">
            <div className="trophy">🏆</div>
            <h3>Daily Champion!</h3>
            <p>All habits completed today.</p>
            <div className="glow-effect"></div>
        </div>
    );
};

export default Award;

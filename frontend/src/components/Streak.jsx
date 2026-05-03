import React from 'react';

const Streak = ({ dayCount }) => {
    return (
        <div className="flex items-center space-x-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-bold shadow-sm">
            <span className="text-2xl">🔥</span>
            <span>{dayCount} Day Streak!</span>
        </div>
    );
};

export default Streak;

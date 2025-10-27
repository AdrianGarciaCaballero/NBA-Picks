
import React from 'react';

interface ProgressBarProps {
    value: number;
    colorClass: string;
    label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, colorClass, label }) => {
    const displayValue = Math.max(0, Math.min(100, value));

    return (
        <div className="w-full">
            {label && <span className="text-xs font-medium text-gray-400">{label}</span>}
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                <div
                    className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${displayValue}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;

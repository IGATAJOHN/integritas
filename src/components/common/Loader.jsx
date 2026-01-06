import React from 'react';

const Loader = ({ size = 'medium', text = 'Loading...' }) => {
    const sizeStyles = {
        small: 'loader-sm',
        medium: 'loader-md',
        large: 'loader-lg'
    };

    return (
        <div className={`loader-container ${sizeStyles[size]}`}>
            <div className="loader-spinner"></div>
            {text && <p className="loader-text">{text}</p>}
        </div>
    );
};

export default Loader;

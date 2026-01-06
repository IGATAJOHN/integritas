import React from 'react';

const Card = ({
    children,
    title,
    subtitle,
    className = '',
    padding = true
}) => {
    return (
        <div className={`card ${padding ? 'card-padded' : ''} ${className}`}>
            {(title || subtitle) && (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            )}
            <div className="card-body">
                {children}
            </div>
        </div>
    );
};

export default Card;

import { useState } from 'react';

const StarRating = ({ rating, onRate = null, size = 20, color = "#f59e0b" }) => {
    const [hover, setHover] = useState(0);
    const displayRating = hover || rating;

    // Interactive mode if onRate provided
    if (onRate) {
        return (
            <div style={{ display: 'flex' }}>
                {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                        <span
                            key={index}
                            style={{
                                cursor: 'pointer',
                                fontSize: `${size}px`,
                                color: ratingValue <= displayRating ? color : '#e4e5e9',
                                transition: 'color 0.2s',
                                marginRight: '2px'
                            }}
                            onClick={() => onRate(ratingValue)}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(0)}
                        >
                            ★
                        </span>
                    );
                })}
            </div>
        );
    }

    // Read-only mode
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                // Calculate fill percentage for partial stars
                let percent = 0;
                if (rating >= ratingValue) {
                    percent = 100;
                } else if (rating > index) {
                    percent = (rating - index) * 100;
                }

                return (
                    <div key={index} style={{ position: 'relative', display: 'inline-block', marginRight: '2px' }}>
                        {/* Background Star */}
                        <span style={{ fontSize: `${size}px`, color: '#e4e5e9' }}>★</span>

                        {/* Foreground Star (Clipped) */}
                        <span style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            fontSize: `${size}px`,
                            color: color,
                            width: `${percent}%`,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap'
                        }}>★</span>
                    </div>
                );
            })}
        </div>
    );
};

export default StarRating;

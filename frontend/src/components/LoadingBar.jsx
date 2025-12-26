/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

// Medical-grade loading bar component
// Thin progress bar with smooth animation

export default function LoadingBar({ progress = null, className = "" }) {
    return (
        <div className={`progress-bar-container ${className}`}>
            <div
                className={`progress-bar ${progress === null ? 'progress-bar-animated' : ''}`}
                style={progress !== null ? { width: `${progress}%` } : { width: '30%' }}
            />
        </div>
    );
}

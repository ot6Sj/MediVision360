/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

// Result badge component (pill-shaped status indicators)

export default function ResultBadge({ type = "info", children, icon }) {
    const badgeClass = `badge badge-${type}`;

    return (
        <span className={badgeClass}>
            {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
            {children}
        </span>
    );
}

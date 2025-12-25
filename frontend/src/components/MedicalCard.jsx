// Professional medical card wrapper
// Clean slate-800 background with subtle shadow

export default function MedicalCard({
    children,
    title,
    subtitle,
    className = "",
    headerActions
}) {
    return (
        <div className={`medical-card ${className}`}>
            {(title || headerActions) && (
                <div className="medical-card-header">
                    <div>
                        {title && <h3 className="medical-card-title">{title}</h3>}
                        {subtitle && <p className="medical-card-subtitle">{subtitle}</p>}
                    </div>
                    {headerActions && <div>{headerActions}</div>}
                </div>
            )}
            {children}
        </div>
    );
}

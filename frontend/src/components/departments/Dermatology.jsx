/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { useState } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';
import Icon from '../Icon';
import MedicalCard from '../MedicalCard';
import LoadingBar from '../LoadingBar';
import ResultBadge from '../ResultBadge';

export default function Dermatology() {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleImageUpload = async (file, preview) => {
        console.log('=== DERMA UPLOAD STARTED ===');
        setUploadedImage(preview);
        setAnalyzing(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            console.log('Making API call to /api/scan/derma...');
            const response = await axios.post('/api/scan/derma', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('=== API SUCCESS ===');
            console.log('Response:', response.data);

            setResult(response.data);
            setAnalyzing(false);

        } catch (error) {
            console.error('=== API FAILED ===');
            console.error('Error:', error.message);
            alert(`API Error: ${error.message}`);
            setAnalyzing(false);
            setUploadedImage(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleImageUpload(file, reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetScan = () => {
        setUploadedImage(null);
        setAnalyzing(false);
        setResult(null);
    };

    // Helper to determine badge type based on alert color
    const getBadgeType = (color) => {
        if (color === 'red') return 'danger';
        if (color === 'orange') return 'warning';
        return 'success';
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--slate-50)',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Icon name="dna" className="w-8 h-8" />
                    Dermatologie - Analyse Intelligente
                </h1>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--slate-400)',
                    fontFamily: 'var(--font-mono)'
                }}>
                    Détection Cancer (MobileNetV2) | Mesure Géométrique | Calibration Pièce 23mm
                </p>
            </div>

            {/* Upload or Results */}
            {!uploadedImage ? (
                <MedicalCard title="Téléverser Photo de Lésion" subtitle="Incluez une pièce de monnaie pour l'échelle">
                    {/* Coin Instruction Banner */}
                    <div style={{
                        padding: '12px',
                        background: 'rgba(14, 165, 233, 0.1)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(14, 165, 233, 0.2)',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px'
                        }}>
                            <Icon name="info" className="w-4 h-4" />
                            <strong style={{ fontSize: '0.875rem', color: 'var(--sky-500)' }}>
                                Conseil: Placer une pièce à côté de la lésion
                            </strong>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--slate-400)', margin: 0 }}>
                            L'IA utilisera la pièce (23mm) pour calculer la taille réelle en mm/cm².
                            Sans pièce, les mesures seront approximatives.
                        </p>
                    </div>

                    <label
                        className="upload-zone"
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('drag-over');
                        }}
                        onDragLeave={(e) => {
                            e.currentTarget.classList.remove('drag-over');
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('drag-over');
                            const file = e.dataTransfer.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => handleImageUpload(file, reader.result);
                                reader.readAsDataURL(file);
                            }
                        }}
                    >
                        <Icon name="upload" className="w-10 h-10" />
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--slate-400)',
                            marginBottom: '8px'
                        }}>
                            Glisser-déposer ou cliquer pour parcourir
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--slate-500)',
                            fontFamily: 'var(--font-mono)'
                        }}>
                            Format: JPEG, PNG | Recommandé: Lumière naturelle
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </label>
                </MedicalCard>
            ) : (
                <>
                    {/* Analysis Status */}
                    {analyzing && (
                        <MedicalCard className="reveal">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div className="pulse-analyzing" style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: 'var(--sky-500)'
                                }} />
                                <span style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                                    Analyse triple couche (IA + Géométrie + Calibration)...
                                </span>
                            </div>
                            <LoadingBar />
                        </MedicalCard>
                    )}

                    {result && !analyzing && (
                        <div className="reveal">
                            {/* Image Display */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <MedicalCard title="Image Analysée">
                                    <img
                                        src={uploadedImage}
                                        alt="Lésion cutanée"
                                        style={{
                                            width: '100%',
                                            maxWidth: '500px',
                                            height: 'auto',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--slate-700)',
                                            display: 'block',
                                            margin: '0 auto'
                                        }}
                                    />
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '8px 12px',
                                        background: 'rgba(100, 116, 139, 0.1)',
                                        borderRadius: '6px',
                                        textAlign: 'center'
                                    }}>
                                        <span style={{
                                            fontSize: '0.8125rem',
                                            color: 'var(--slate-400)',
                                            fontFamily: 'var(--font-mono)'
                                        }}>
                                            {result.calibration}
                                        </span>
                                    </div>
                                </MedicalCard>
                            </div>

                            {/* Diagnosis Card */}
                            <MedicalCard className="reveal-delay-1">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <ResultBadge type={getBadgeType(result.couleur_alerte)}>
                                            {result.diagnostic}
                                        </ResultBadge>
                                        {result.cancer_score && (
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--slate-500)',
                                                marginTop: '6px',
                                                fontFamily: 'var(--font-mono)'
                                            }}>
                                                Score cancer: {result.cancer_score}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontSize: '2.5rem',
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-mono)',
                                            color: result.couleur_alerte === 'green' ? 'var(--emerald-500)'
                                                : result.couleur_alerte === 'orange' ? 'var(--amber-500)'
                                                    : 'var(--red-500)',
                                            lineHeight: 1
                                        }}>
                                            <CountUp
                                                start={0}
                                                end={result.confidence || 0}
                                                duration={2}
                                                decimals={1}
                                                suffix="%"
                                            />
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--slate-400)',
                                            marginTop: '4px',
                                            fontFamily: 'var(--font-mono)'
                                        }}>
                                            {result.couleur_alerte === 'red' ? 'Risque' : 'Confiance'}
                                        </div>
                                    </div>
                                </div>

                                {/* Severity/Alert Bar */}
                                <div style={{
                                    padding: '12px',
                                    background: result.couleur_alerte === 'red' ? 'rgba(239, 68, 68, 0.1)'
                                        : result.couleur_alerte === 'orange' ? 'rgba(245, 158, 11, 0.1)'
                                            : 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: `1px solid ${result.couleur_alerte === 'red' ? 'rgba(239, 68, 68, 0.2)'
                                        : result.couleur_alerte === 'orange' ? 'rgba(245, 158, 11, 0.2)'
                                            : 'rgba(16, 185, 129, 0.2)'
                                        }`,
                                    marginBottom: '1.5rem'
                                }}>
                                    <h4 style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: result.couleur_alerte === 'red' ? 'var(--red-500)'
                                            : result.couleur_alerte === 'orange' ? 'var(--amber-500)'
                                                : 'var(--emerald-500)',
                                        marginBottom: '6px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {result.gravite_globale}
                                    </h4>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--slate-300)',
                                        margin: 0
                                    }}>
                                        {result.conseil}
                                    </p>
                                </div>

                                {/* Details Section */}
                                {result.details_visuels && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: 'var(--slate-300)',
                                            marginBottom: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            Mesures Physiques
                                        </h4>

                                        {typeof result.details_visuels === 'string' ? (
                                            // Cancer case - just show text
                                            <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                                                {result.details_visuels}
                                            </p>
                                        ) : (
                                            // Trauma case - show measurements
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                                gap: '1rem'
                                            }}>
                                                {result.details_visuels.surface && (
                                                    <div style={{
                                                        padding: '12px',
                                                        background: 'rgba(15, 23, 42, 0.5)',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--slate-700)'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--slate-500)',
                                                            marginBottom: '4px'
                                                        }}>
                                                            Surface
                                                        </div>
                                                        <div style={{
                                                            fontSize: '1.25rem',
                                                            fontWeight: 700,
                                                            color: 'var(--sky-500)',
                                                            fontFamily: 'var(--font-mono)'
                                                        }}>
                                                            {result.details_visuels.surface}
                                                        </div>
                                                    </div>
                                                )}
                                                {result.details_visuels.longueur && (
                                                    <div style={{
                                                        padding: '12px',
                                                        background: 'rgba(15, 23, 42, 0.5)',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--slate-700)'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--slate-500)',
                                                            marginBottom: '4px'
                                                        }}>
                                                            Longueur
                                                        </div>
                                                        <div style={{
                                                            fontSize: '1.25rem',
                                                            fontWeight: 700,
                                                            color: 'var(--emerald-500)',
                                                            fontFamily: 'var(--font-mono)'
                                                        }}>
                                                            {result.details_visuels.longueur}
                                                        </div>
                                                    </div>
                                                )}
                                                {result.details_visuels.type && (
                                                    <div style={{
                                                        padding: '12px',
                                                        background: 'rgba(15, 23, 42, 0.5)',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--slate-700)'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: 'var(--slate-500)',
                                                            marginBottom: '4px'
                                                        }}>
                                                            Type
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.875rem',
                                                            fontWeight: 600,
                                                            color: 'var(--slate-200)'
                                                        }}>
                                                            {result.details_visuels.type}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ marginTop: '1.5rem' }}>
                                    <button className="btn btn-secondary" onClick={resetScan} style={{ width: '100%' }}>
                                        Nouvelle Analyse
                                    </button>
                                </div>
                            </MedicalCard>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

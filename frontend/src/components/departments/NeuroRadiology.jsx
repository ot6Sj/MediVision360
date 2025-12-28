/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { useState } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';
import Icon from '../Icon';
import MedicalCard from '../MedicalCard';
import LoadingBar from '../LoadingBar';
import ResultBadge from '../ResultBadge';

export default function NeuroRadiology() {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [heatmapImage, setHeatmapImage] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [scanMode, setScanMode] = useState(null); // 'fast' or 'precision'
    const [rotation, setRotation] = useState(0); // Image rotation in degrees

    const handleImageUpload = async (file, preview) => {
        console.log('=== UPLOAD STARTED ===');
        setUploadedImage(preview);
        setAnalyzing(true);
        setResult(null);
        setHeatmapImage(null);
        setShowDetails(false);

        try {
            const formData = new FormData();
            formData.append('file', file);

            console.log('Making API call to /api/scan/neuro with mode:', scanMode);
            const response = await axios.post(`/api/scan/neuro?mode=${scanMode}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('=== API SUCCESS ===');
            console.log('Response:', response.data);

            setResult(response.data);
            setHeatmapImage(response.data.heatmap || preview);
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
        setHeatmapImage(null);
        setShowDetails(false);
        setScanMode(null);
        setRotation(0);
    };

    const rotateLeft = () => setRotation(prev => (prev - 90) % 360);
    const rotateRight = () => setRotation(prev => (prev + 90) % 360);

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
                    <Icon name="brain" className="w-8 h-8 text-sky-500" />
                    Neuro-Radiology Analysis
                </h1>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--slate-400)',
                    fontFamily: 'var(--font-mono)'
                }}>
                    Brain Tumor Detection | ResNet50 | 224×224×3 RGB | Threshold: 70%
                </p>
            </div>



            {/* Upload or Results */}
            {!uploadedImage ? (
                <>
                    {/* Mode Selection */}
                    {!scanMode ? (
                        <MedicalCard title="Select Analysis Mode" subtitle="Choose the appropriate mode for your diagnostic needs">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                                {/* Fast Mode Card */}
                                <div
                                    onClick={() => setScanMode('fast')}
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(6, 182, 212, 0.1))',
                                        border: '2px solid rgba(14, 165, 233, 0.3)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        textAlign: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.borderColor = 'var(--sky-500)';
                                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(14, 165, 233, 0.25)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--sky-500), var(--cyan-500))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem',
                                        fontSize: '1.75rem'
                                    }}>
                                        👁️
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: 700,
                                        color: 'var(--sky-400)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Rapid Screening
                                    </h3>
                                    <p style={{
                                        fontSize: '0.8125rem',
                                        color: 'var(--slate-400)',
                                        marginBottom: '0.75rem',
                                        lineHeight: 1.5
                                    }}>
                                        Quick triage for large volumes of scans
                                    </p>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontFamily: 'var(--font-mono)',
                                        color: 'var(--slate-500)',
                                        padding: '0.5rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: 'var(--radius-sm)'
                                    }}>
                                        ResNet50 • ~0.1s • Oui/Non
                                    </div>
                                </div>

                                {/* Precision Mode Card */}
                                <div
                                    onClick={() => setScanMode('precision')}
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.1))',
                                        border: '2px solid rgba(139, 92, 246, 0.3)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        textAlign: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.borderColor = 'var(--violet-500)';
                                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.25)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--violet-500), var(--purple-500))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem',
                                        fontSize: '1.75rem'
                                    }}>
                                        📐
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: 700,
                                        color: 'var(--violet-400)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Surgical Planning
                                    </h3>
                                    <p style={{
                                        fontSize: '0.8125rem',
                                        color: 'var(--slate-400)',
                                        marginBottom: '0.75rem',
                                        lineHeight: 1.5
                                    }}>
                                        Detailed measurements for surgery prep
                                    </p>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontFamily: 'var(--font-mono)',
                                        color: 'var(--slate-500)',
                                        padding: '0.5rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: 'var(--radius-sm)'
                                    }}>
                                        U-Net • ~1.5s • Mesures
                                    </div>
                                </div>
                            </div>
                        </MedicalCard>
                    ) : (
                        /* Upload Zone - shown after mode selection */
                        <MedicalCard
                            title={`Upload MRI Scan`}
                            subtitle={`Mode: ${scanMode === 'fast' ? 'Rapid Screening (ResNet50)' : 'Surgical Planning (Segmentation)'}`}
                        >
                            <div style={{ marginBottom: '1rem' }}>
                                <button
                                    onClick={() => setScanMode(null)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--slate-400)',
                                        fontSize: '0.8125rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 0'
                                    }}
                                >
                                    ← Change Mode
                                </button>
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
                                <Icon name="upload" className="upload-zone-icon" />
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--slate-400)',
                                    marginBottom: '8px'
                                }}>
                                    Drag and drop MRI scan here, or click to browse
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--slate-500)',
                                    fontFamily: 'var(--font-mono)'
                                }}>
                                    Supported: JPEG, PNG, DICOM
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </MedicalCard>
                    )}
                </>
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
                                    background: scanMode === 'fast' ? 'var(--sky-500)' : 'var(--violet-500)'
                                }} />
                                <span style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                                    {scanMode === 'fast' ? 'Quick screening in progress...' : 'Running morphometric analysis...'}
                                </span>
                            </div>
                            <LoadingBar />
                        </MedicalCard>
                    )}

                    {/* Results */}
                    {result && !analyzing && (
                        <div className="reveal">
                            {/* Mode Badge */}
                            <div style={{
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-mono)',
                                    background: scanMode === 'fast'
                                        ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(6, 182, 212, 0.15))'
                                        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.15))',
                                    color: scanMode === 'fast' ? 'var(--sky-400)' : 'var(--violet-400)',
                                    border: `1px solid ${scanMode === 'fast' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`
                                }}>
                                    {result.mode || (scanMode === 'fast' ? 'RAPID SCREENING' : 'SURGICAL PLANNING')}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--slate-500)',
                                    fontFamily: 'var(--font-mono)'
                                }}>
                                    {result.temps_calcul || '~1s'}
                                </span>
                            </div>

                            {/* Rotation Controls */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <button
                                    onClick={rotateLeft}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    title="Rotate Left"
                                >
                                    ↺ Rotate Left
                                </button>
                                <span style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(14, 165, 233, 0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    color: 'var(--sky-400)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {rotation}°
                                </span>
                                <button
                                    onClick={rotateRight}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    title="Rotate Right"
                                >
                                    Rotate Right ↻
                                </button>
                            </div>

                            {/* Images Grid */}
                            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                                <MedicalCard title="Original MRI">
                                    <img
                                        src={uploadedImage}
                                        alt="Original MRI"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--slate-700)',
                                            transform: `rotate(${rotation}deg)`,
                                            transition: 'transform 0.3s ease'
                                        }}
                                    />
                                </MedicalCard>

                                <MedicalCard title={scanMode === 'precision' ? 'Annotated Analysis' : 'AI Heatmap'}>
                                    <img
                                        src={scanMode === 'precision' && result.annotated_image ? result.annotated_image : heatmapImage}
                                        alt="AI Analysis"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--slate-700)',
                                            transform: `rotate(${rotation}deg)`,
                                            transition: 'transform 0.3s ease'
                                        }}
                                    />
                                </MedicalCard>
                            </div>

                            {/* ============ FAST MODE RESULTS ============ */}
                            {scanMode === 'fast' && (
                                <MedicalCard className="reveal-delay-1">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                        <div>
                                            <ResultBadge type={result.diagnostic?.includes('Tumor') ? 'danger' : 'success'}>
                                                {result.diagnostic || 'Analysis Complete'}
                                            </ResultBadge>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '2.5rem',
                                                fontWeight: 700,
                                                fontFamily: 'var(--font-mono)',
                                                color: result.confidence > 70 ? 'var(--red-500)' : 'var(--emerald-500)',
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
                                                Tumor Probability
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confidence Meter */}
                                    <div className="confidence-meter" style={{ marginBottom: '1.5rem' }}>
                                        <div
                                            className={result.confidence <= 70 ? 'confidence-fill-success' : 'confidence-fill-danger'}
                                            style={{ width: `${result.confidence || 0}%` }}
                                        />
                                    </div>

                                    {/* Action Recommendation */}
                                    <div style={{
                                        padding: '1rem',
                                        background: result.threshold_met
                                            ? 'rgba(239, 68, 68, 0.1)'
                                            : 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: `1px solid ${result.threshold_met ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                                    }}>
                                        <h4 style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: result.threshold_met ? 'var(--red-400)' : 'var(--emerald-400)',
                                            marginBottom: '4px',
                                            textTransform: 'uppercase'
                                        }}>
                                            Recommended Action
                                        </h4>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--slate-300)' }}>
                                            {result.action || (result.threshold_met
                                                ? 'Switch to Precision mode for detailed measurements.'
                                                : 'No further action required.')}
                                        </p>
                                    </div>

                                    {/* Switch to Precision Mode Button */}
                                    {result.threshold_met && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setScanMode('precision');
                                                setResult(null);
                                                setAnalyzing(true);
                                                // Re-trigger analysis with precision mode
                                                const file = document.querySelector('input[type="file"]')?.files?.[0];
                                                if (file) {
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    axios.post('/api/scan/neuro?mode=precision', formData, {
                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                    }).then(response => {
                                                        setResult(response.data);
                                                        setHeatmapImage(response.data.heatmap || uploadedImage);
                                                        setAnalyzing(false);
                                                    }).catch(() => setAnalyzing(false));
                                                }
                                            }}
                                            style={{
                                                width: '100%',
                                                marginTop: '1rem',
                                                background: 'linear-gradient(135deg, var(--violet-600), var(--purple-600))'
                                            }}
                                        >
                                            📐 Run Precision Analysis
                                        </button>
                                    )}

                                    <button className="btn btn-secondary" onClick={resetScan} style={{ width: '100%', marginTop: '0.75rem' }}>
                                        New Scan
                                    </button>
                                </MedicalCard>
                            )}

                            {/* ============ PRECISION MODE RESULTS ============ */}
                            {scanMode === 'precision' && (
                                <>
                                    {/* Morphometric Measurements */}
                                    {result.data && (
                                        <MedicalCard title="Morphometric Measurements" className="reveal-delay-1">
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(3, 1fr)',
                                                gap: '1rem',
                                                marginBottom: '1.5rem'
                                            }}>
                                                <div style={{
                                                    padding: '1rem',
                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    textAlign: 'center'
                                                }}>
                                                    <div style={{
                                                        fontSize: '1.5rem',
                                                        fontWeight: 700,
                                                        color: 'var(--violet-400)',
                                                        fontFamily: 'var(--font-mono)'
                                                    }}>
                                                        {result.data.surface_cm2 || '—'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                                        Surface (cm²)
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '1rem',
                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    textAlign: 'center'
                                                }}>
                                                    <div style={{
                                                        fontSize: '1.5rem',
                                                        fontWeight: 700,
                                                        color: 'var(--violet-400)',
                                                        fontFamily: 'var(--font-mono)'
                                                    }}>
                                                        {result.data.diametre_mm || '—'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                                        Diameter (mm)
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '1rem',
                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    textAlign: 'center'
                                                }}>
                                                    <div style={{
                                                        fontSize: '1.5rem',
                                                        fontWeight: 700,
                                                        color: 'var(--violet-400)',
                                                        fontFamily: 'var(--font-mono)'
                                                    }}>
                                                        {result.data.volume_cm3 || '—'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                                        Volume (cm³)
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Additional Metrics */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '0.75rem',
                                                padding: '1rem',
                                                background: 'rgba(15, 23, 42, 0.5)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.8125rem'
                                            }}>
                                                <div>
                                                    <span style={{ color: 'var(--slate-500)' }}>Location: </span>
                                                    <span style={{ color: 'var(--slate-300)' }}>{result.data.localisation || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--slate-500)' }}>Min. Margin: </span>
                                                    <span style={{ color: 'var(--slate-300)' }}>{result.data.marge_min_mm || '—'} mm</span>
                                                </div>
                                                {result.data.dimensions_mm && (
                                                    <>
                                                        <div>
                                                            <span style={{ color: 'var(--slate-500)' }}>Width: </span>
                                                            <span style={{ color: 'var(--slate-300)' }}>{result.data.dimensions_mm.largeur} mm</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: 'var(--slate-500)' }}>Height: </span>
                                                            <span style={{ color: 'var(--slate-300)' }}>{result.data.dimensions_mm.hauteur} mm</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </MedicalCard>
                                    )}

                                    {/* Risk Assessment */}
                                    {result.risk && (
                                        <MedicalCard title="Risk Assessment" className="reveal-delay-2" style={{ marginTop: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                                <div style={{
                                                    padding: '0.75rem 1.5rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: result.risk.level === 'HIGH'
                                                        ? 'rgba(239, 68, 68, 0.2)'
                                                        : result.risk.level === 'MODERATE'
                                                            ? 'rgba(245, 158, 11, 0.2)'
                                                            : 'rgba(16, 185, 129, 0.2)',
                                                    border: `2px solid ${result.risk.level === 'HIGH'
                                                        ? 'var(--red-500)'
                                                        : result.risk.level === 'MODERATE'
                                                            ? 'var(--amber-500)'
                                                            : 'var(--emerald-500)'
                                                        }`
                                                }}>
                                                    <div style={{
                                                        fontSize: '1.25rem',
                                                        fontWeight: 700,
                                                        color: result.risk.level === 'HIGH'
                                                            ? 'var(--red-400)'
                                                            : result.risk.level === 'MODERATE'
                                                                ? 'var(--amber-400)'
                                                                : 'var(--emerald-400)'
                                                    }}>
                                                        {result.risk.level}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                                        Score: {result.risk.score}/100
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: 'var(--slate-300)'
                                                }}>
                                                    {result.risk.priority}
                                                </div>
                                            </div>

                                            {/* Risk Factors */}
                                            {result.risk.factors && result.risk.factors.length > 0 && (
                                                <div style={{ marginTop: '1rem' }}>
                                                    <h5 style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--slate-500)',
                                                        marginBottom: '0.5rem',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        Contributing Factors
                                                    </h5>
                                                    <ul style={{
                                                        listStyle: 'none',
                                                        padding: 0,
                                                        margin: 0,
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '0.5rem'
                                                    }}>
                                                        {result.risk.factors.map((factor, i) => (
                                                            <li key={i} style={{
                                                                padding: '0.375rem 0.75rem',
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                borderRadius: 'var(--radius-sm)',
                                                                fontSize: '0.8125rem',
                                                                color: 'var(--red-300)'
                                                            }}>
                                                                {factor}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </MedicalCard>
                                    )}

                                    {/* Recommendations */}
                                    {result.recommendations && result.recommendations.length > 0 && (
                                        <MedicalCard title="Clinical Recommendations" className="reveal-delay-3" style={{ marginTop: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {result.recommendations.map((rec, i) => (
                                                    <div key={i} style={{
                                                        padding: '1rem',
                                                        background: 'rgba(139, 92, 246, 0.05)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        borderLeft: '3px solid var(--violet-500)',
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr auto',
                                                        gap: '1rem',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: 'var(--slate-200)', marginBottom: '0.25rem' }}>
                                                                {rec.action}
                                                            </div>
                                                            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                                                                {rec.raison}
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            padding: '0.375rem 0.75rem',
                                                            background: 'rgba(139, 92, 246, 0.15)',
                                                            borderRadius: 'var(--radius-sm)',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            color: 'var(--violet-400)'
                                                        }}>
                                                            {rec.delai}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </MedicalCard>
                                    )}

                                    {/* Binary Mask Image */}
                                    {result.image_masque && (
                                        <MedicalCard title="Segmentation Mask" className="reveal-delay-4" style={{ marginTop: '1rem' }}>
                                            <img
                                                src={result.image_masque}
                                                alt="Binary Mask"
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '300px',
                                                    height: 'auto',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '1px solid var(--slate-700)',
                                                    filter: 'invert(1)',
                                                    margin: '0 auto',
                                                    display: 'block'
                                                }}
                                            />
                                            <p style={{
                                                textAlign: 'center',
                                                fontSize: '0.75rem',
                                                color: 'var(--slate-500)',
                                                marginTop: '0.75rem'
                                            }}>
                                                Binary mask showing detected lesion boundaries
                                            </p>
                                        </MedicalCard>
                                    )}

                                    <button className="btn btn-secondary" onClick={resetScan} style={{ width: '100%', marginTop: '1.5rem' }}>
                                        New Scan
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

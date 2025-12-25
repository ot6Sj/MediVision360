import { useState, useRef } from 'react';
import axios from 'axios';
import Icon from '../Icon';
import MedicalCard from '../MedicalCard';
import LoadingBar from '../LoadingBar';

export default function Pharmacy() {
    const [mode, setMode] = useState('scan'); // 'scan' or 'manual'

    // Manual mode
    const [medName, setMedName] = useState('');

    // Scan mode
    const [uploadedImage, setUploadedImage] = useState(null);
    const [usingCamera, setUsingCamera] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);

    // Common
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);

    // Manual search
    const handleManualSearch = async () => {
        if (!medName.trim()) {
            alert('Entrez un nom de médicament');
            return;
        }

        setProcessing(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('medication_name', medName);

            const response = await axios.post('/api/scan/pharma-manual', formData);
            setProcessing(false);
            setResult(response.data);
        } catch (error) {
            console.error('Error:', error);
            setProcessing(false);
            alert(`Erreur: ${error.message}`);
        }
    };

    // Camera functions
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setUsingCamera(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Camera error:', error);
            alert('Impossible d\'accéder à la caméra');
        }
    };

    const capturePhoto = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

        canvas.toBlob((blob) => {
            const file = new File([blob], 'medication.jpg', { type: 'image/jpeg' });
            const preview = canvas.toDataURL('image/jpeg');
            stopCamera();
            handleImageUpload(file, preview);
        }, 'image/jpeg', 0.95);
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setUsingCamera(false);
    };

    const handleImageUpload = async (file, preview) => {
        setUploadedImage(preview);
        setProcessing(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('/api/scan/pharma', formData);
            setProcessing(false);
            setResult(response.data);
        } catch (error) {
            console.error('Error:', error);
            setProcessing(false);
            alert(`Erreur: ${error.message}`);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => handleImageUpload(file, reader.result);
            reader.readAsDataURL(file);
        }
    };

    const resetScan = () => {
        setUploadedImage(null);
        setProcessing(false);
        setResult(null);
        setMedName('');
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
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
                    <Icon name="pill" className="w-8 h-8" />
                    Pharmacie
                </h1>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--slate-400)',
                    fontFamily: 'var(--font-mono)'
                }}>
                    OCR + API Gouv.fr | Recherche Manuelle | Temps Réel
                </p>
            </div>

            {!result && !uploadedImage && !usingCamera && (
                <>
                    {/* Mode Toggle */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        justifyContent: 'center'
                    }}>
                        <button
                            className={mode === 'scan' ? 'btn' : 'btn btn-secondary'}
                            onClick={() => setMode('scan')}
                            style={{ minWidth: '150px' }}
                        >
                            📷 Scanner
                        </button>
                        <button
                            className={mode === 'manual' ? 'btn' : 'btn btn-secondary'}
                            onClick={() => setMode('manual')}
                            style={{ minWidth: '150px' }}
                        >
                            ⌨️ Taper
                        </button>
                    </div>

                    {/* Manual Mode */}
                    {mode === 'manual' && (
                        <MedicalCard title="Recherche Manuelle">
                            <input
                                type="text"
                                value={medName}
                                onChange={(e) => setMedName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                                placeholder="Ex: DOLIPRANE, AMOXICILLINE..."
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    fontSize: '1.1rem',
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    border: '2px solid var(--slate-700)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--slate-50)',
                                    outline: 'none',
                                    marginBottom: '1rem'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--sky-500)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--slate-700)'}
                            />

                            <button
                                className="btn"
                                onClick={handleManualSearch}
                                disabled={processing}
                                style={{ width: '100%' }}
                            >
                                {processing ? '🔍 Recherche...' : '🔍 Rechercher'}
                            </button>
                        </MedicalCard>
                    )}

                    {/* Scan Mode */}
                    {mode === 'scan' && (
                        <MedicalCard title="Scanner avec OCR" subtitle="Photo ou Caméra">
                            <div style={{
                                padding: '12px',
                                background: 'rgba(14, 165, 233, 0.1)',
                                borderRadius: '8px',
                                border: '1px solid rgba(14, 165, 233, 0.2)',
                                marginBottom: '1.5rem'
                            }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--slate-300)', margin: 0 }}>
                                    💡 Photographiez la boîte avec le nom visible
                                </p>
                            </div>

                            <label className="upload-zone"
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                                onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
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
                                <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)', marginBottom: '8px' }}>
                                    Glisser-déposer ou cliquer
                                </div>
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>

                            <button className="btn btn-secondary" onClick={startCamera} style={{ width: '100%', marginTop: '1rem' }}>
                                📷 Utiliser la Caméra
                            </button>
                        </MedicalCard>
                    )}
                </>
            )}

            {usingCamera && (
                <MedicalCard className="reveal">
                    <video ref={videoRef} autoPlay playsInline style={{
                        width: '100%',
                        maxWidth: '500px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--slate-700)',
                        display: 'block',
                        margin: '0 auto 1rem'
                    }} />
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn" onClick={capturePhoto}>📸 Capturer</button>
                        <button className="btn btn-secondary" onClick={stopCamera}>❌ Annuler</button>
                    </div>
                </MedicalCard>
            )}

            {processing && (
                <MedicalCard className="reveal">
                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                        <div className="pulse-analyzing" style={{
                            width: '12px', height: '12px', borderRadius: '50%',
                            background: 'var(--sky-500)', margin: '0 auto 12px'
                        }} />
                        <span style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                            {mode === 'scan' ? 'OCR + API...' : 'Recherche API...'}
                        </span>
                    </div>
                    <LoadingBar />
                </MedicalCard>
            )}

            {result && !processing && (
                <div className="reveal">
                    {result.status === 'SUCCESS' ? (
                        <>
                            {uploadedImage && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <MedicalCard title="Image">
                                        <img src={uploadedImage} alt="Médicament" style={{
                                            width: '100%', maxWidth: '400px', height: 'auto',
                                            borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-700)',
                                            display: 'block', margin: '0 auto'
                                        }} />
                                    </MedicalCard>
                                </div>
                            )}

                            <MedicalCard>
                                <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--sky-500)' }}>
                                    {result.medicament}
                                </h3>

                                <div style={{
                                    padding: '12px',
                                    background: 'rgba(14, 165, 233, 0.1)',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    border: '1px solid rgba(14, 165, 233, 0.3)'
                                }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-200)', margin: 0 }}>
                                        {result.info_web.titre}
                                    </h4>
                                </div>

                                {result.info_web.usage && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{
                                            fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald-500)',
                                            marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em'
                                        }}>
                                            💊 Indications
                                        </h4>
                                        <div style={{
                                            padding: '12px', background: 'rgba(16, 185, 129, 0.05)',
                                            borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)'
                                        }}>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--slate-300)', margin: 0, lineHeight: 1.6 }}>
                                                {result.info_web.usage}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {result.info_web.side_effects && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{
                                            fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber-500)',
                                            marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em'
                                        }}>
                                            ⚠️ Effets Secondaires
                                        </h4>
                                        <div style={{
                                            padding: '12px', background: 'rgba(251, 191, 36, 0.05)',
                                            borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.2)'
                                        }}>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--slate-300)', margin: 0, lineHeight: 1.6 }}>
                                                {result.info_web.side_effects}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    padding: '14px',
                                    background: result.securite.niveau === 'ATTENTION' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: `2px solid ${result.securite.niveau === 'ATTENTION' ? 'var(--red-500)' : 'var(--emerald-500)'}`,
                                    marginBottom: '1.5rem'
                                }}>
                                    <h4 style={{
                                        fontSize: '0.8rem', fontWeight: 700,
                                        color: result.securite.niveau === 'ATTENTION' ? 'var(--red-500)' : 'var(--emerald-500)',
                                        marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>
                                        {result.securite.niveau === 'ATTENTION' ? '🚨 AVERTISSEMENTS' : '✅ INFORMATIONS'}
                                    </h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                        {result.securite.alertes.map((alerte, idx) => (
                                            <li key={idx} style={{
                                                fontSize: '0.85rem', color: 'var(--slate-200)',
                                                marginBottom: '4px', lineHeight: 1.5
                                            }}>
                                                {alerte}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                    <a href={result.info_web.source} target="_blank" rel="noopener noreferrer" style={{
                                        fontSize: '0.75rem', color: 'var(--sky-400)', textDecoration: 'underline',
                                        fontFamily: 'var(--font-mono)'
                                    }}>
                                        📄 Source: {result.info_web.source.includes('gouv') ? 'Gouv.fr' : 'Database'}
                                    </a>
                                </div>

                                <button className="btn btn-secondary" onClick={resetScan} style={{ width: '100%' }}>
                                    Nouvelle Recherche
                                </button>
                            </MedicalCard>
                        </>
                    ) : (
                        <MedicalCard>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--red-500)', fontSize: '1rem', marginBottom: '1rem' }}>
                                    ❌ {result.message}
                                </p>
                                {result.ocr_raw && result.ocr_raw.length > 0 && (
                                    <div style={{
                                        padding: '8px', background: 'rgba(100, 116, 139, 0.1)',
                                        borderRadius: '6px', marginBottom: '1rem'
                                    }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', margin: 0 }}>
                                            OCR: {result.ocr_raw.join(', ')}
                                        </p>
                                    </div>
                                )}
                                <button className="btn" onClick={resetScan}>Réessayer</button>
                            </div>
                        </MedicalCard>
                    )}
                </div>
            )}
        </div>
    );
}

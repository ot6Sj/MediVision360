import { useState, useRef } from 'react';
import axios from 'axios';
import Icon from '../Icon';
import MedicalCard from '../MedicalCard';
import LoadingBar from '../LoadingBar';

export default function Surgery() {
    const [mode, setMode] = useState('image'); // 'image' or 'video'
    const [uploadedFile, setUploadedFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [videoResults, setVideoResults] = useState(null);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [usingCamera, setUsingCamera] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);

    const ALERT_COLORS = {
        red: { bg: 'rgba(239, 68, 68, 0.1)', border: 'var(--red-500)', text: 'var(--red-500)' },
        orange: { bg: 'rgba(251, 191, 36, 0.1)', border: 'var(--amber-500)', text: 'var(--amber-500)' },
        green: { bg: 'rgba(16, 185, 129, 0.1)', border: 'var(--emerald-500)', text: 'var(--emerald-500)' },
        gray: { bg: 'rgba(100, 116, 139, 0.1)', border: 'var(--slate-500)', text: 'var(--slate-400)' }
    };

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
            const file = new File([blob], 'surgery.jpg', { type: 'image/jpeg' });
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
        setUploadedFile(preview);
        setProcessing(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('/api/scan/surgery', formData);
            setProcessing(false);
            setResult(response.data);
        } catch (error) {
            console.error('Error:', error);
            setProcessing(false);
            alert(`Erreur: ${error.message}`);
        }
    };

    const handleVideoUpload = async (file) => {
        setUploadedFile(URL.createObjectURL(file));
        setProcessing(true);
        setVideoResults(null);
        setCurrentFrame(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('/api/scan/surgery-video', formData);
            setProcessing(false);
            setVideoResults(response.data);
        } catch (error) {
            console.error('Error:', error);
            setProcessing(false);
            alert(`Erreur: ${error.message}`);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (mode === 'video') {
                handleVideoUpload(file);
            } else {
                const reader = new FileReader();
                reader.onloadend = () => handleImageUpload(file, reader.result);
                reader.readAsDataURL(file);
            }
        }
    };

    const resetScan = () => {
        setUploadedFile(null);
        setProcessing(false);
        setResult(null);
        setVideoResults(null);
        setCurrentFrame(0);
    };

    const currentFrameData = videoResults?.frames?.[currentFrame];

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
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
                    <Icon name="surgery" className="w-8 h-8" />
                    Chirurgie
                </h1>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--slate-400)',
                    fontFamily: 'var(--font-mono)'
                }}>
                    YOLO + HSV + Laplacian | Image & Vidéo | Temps Réel
                </p>
            </div>

            {!uploadedFile && !usingCamera && (
                <>
                    {/* Mode Toggle */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        justifyContent: 'center'
                    }}>
                        <button
                            className={mode === 'image' ? 'btn' : 'btn btn-secondary'}
                            onClick={() => setMode('image')}
                            style={{ minWidth: '150px' }}
                        >
                            📸 Image
                        </button>
                        <button
                            className={mode === 'video' ? 'btn' : 'btn btn-secondary'}
                            onClick={() => setMode('video')}
                            style={{ minWidth: '150px' }}
                        >
                            🎥 Vidéo
                        </button>
                    </div>

                    <MedicalCard title={mode === 'image' ? "Image Chirurgicale" : "Vidéo Chirurgicale"}>
                        <div style={{
                            padding: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--slate-300)', margin: 0 }}>
                                {mode === 'image'
                                    ? '💡 Analyse instantanée: Outils, Hémorragie, Visibilité'
                                    : '💡 Vidéo: Analyse frame-by-frame (30 frames @ 5fps)'}
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
                                    if (mode === 'video') {
                                        handleVideoUpload(file);
                                    } else {
                                        const reader = new FileReader();
                                        reader.onloadend = () => handleImageUpload(file, reader.result);
                                        reader.readAsDataURL(file);
                                    }
                                }
                            }}
                        >
                            <Icon name="upload" className="w-10 h-10" />
                            <div style={{ fontSize: '0.875rem', color: 'var(--slate-400)', marginBottom: '8px' }}>
                                {mode === 'image' ? 'Image (JPG, PNG)' : 'Vidéo (MP4, MOV)'}
                            </div>
                            <input
                                type="file"
                                accept={mode === 'image' ? 'image/*' : 'video/*'}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>

                        {mode === 'image' && (
                            <button className="btn btn-secondary" onClick={startCamera} style={{ width: '100%', marginTop: '1rem' }}>
                                📷 Caméra
                            </button>
                        )}
                    </MedicalCard>
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
                            background: 'var(--red-500)', margin: '0 auto 12px'
                        }} />
                        <span style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                            {mode === 'video' ? 'Traitement vidéo...' : 'Analyse en cours...'}
                        </span>
                    </div>
                    <LoadingBar />
                </MedicalCard>
            )}

            {/* Single Image Result */}
            {result && !processing && mode === 'image' && (
                <div className="reveal">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <MedicalCard title="Image Annotée">
                            <img src={result.image} alt="Analyzed" style={{
                                width: '100%',
                                maxWidth: '800px',
                                height: 'auto',
                                borderRadius: 'var(--radius-sm)',
                                border: `3px solid ${ALERT_COLORS[result.level].border}`,
                                display: 'block',
                                margin: '0 auto'
                            }} />
                        </MedicalCard>
                    </div>

                    <MedicalCard>
                        <div style={{
                            padding: '1.5rem',
                            background: ALERT_COLORS[result.level].bg,
                            borderRadius: 'var(--radius-sm)',
                            border: `3px solid ${ALERT_COLORS[result.level].border}`,
                            marginBottom: '1.5rem',
                            textAlign: 'center'
                        }}>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: ALERT_COLORS[result.level].text,
                                marginBottom: '0.5rem',
                                fontFamily: 'var(--font-mono)'
                            }}>
                                {result.status}
                            </h3>
                            <p style={{ fontSize: '1rem', color: 'var(--slate-200)', margin: 0 }}>
                                {result.message}
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <MetricCard title="Ciseaux" value={result.data.ciseaux_visibles} color="sky" />
                            <MetricCard title="Mains" value={result.data.mains_visibles} color="purple" />
                            <MetricCard title="Taux Sang" value={result.data.taux_sang} color="red" />
                            <MetricCard title="Visibilité" value={result.data.visibilite} color="emerald" />
                        </div>

                        <button className="btn btn-secondary" onClick={resetScan} style={{ width: '100%' }}>
                            Nouvelle Analyse
                        </button>
                    </MedicalCard>
                </div>
            )}

            {/* Video Results */}
            {videoResults && !processing && mode === 'video' && (
                <div className="reveal">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <MedicalCard title={`Frame ${currentFrame + 1}/${videoResults.total_frames}`}>
                            <img src={currentFrameData.image} alt="Frame" style={{
                                width: '100%',
                                maxWidth: '800px',
                                height: 'auto',
                                borderRadius: 'var(--radius-sm)',
                                border: `3px solid ${ALERT_COLORS[currentFrameData.level].border}`,
                                display: 'block',
                                margin: '0 auto 1rem'
                            }} />

                            {/* Frame Navigation */}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                                    disabled={currentFrame === 0}
                                    style={{ minWidth: '100px' }}
                                >
                                    ← Précédent
                                </button>
                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate-400)' }}>
                                    {currentFrame + 1} / {videoResults.total_frames}
                                </span>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setCurrentFrame(Math.min(videoResults.total_frames - 1, currentFrame + 1))}
                                    disabled={currentFrame === videoResults.total_frames - 1}
                                    style={{ minWidth: '100px' }}
                                >
                                    Suivant →
                                </button>
                            </div>
                        </MedicalCard>
                    </div>

                    <MedicalCard>
                        {/* Summary */}
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(14, 165, 233, 0.1)',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-around'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--red-500)' }}>
                                    {videoResults.critical_frames}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                    CRITIQUES
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--amber-500)' }}>
                                    {videoResults.warning_frames}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                    ALERTES
                                </div>
                            </div>
                        </div>

                        {/* Current Frame Data */}
                        <div style={{
                            padding: '1.5rem',
                            background: ALERT_COLORS[currentFrameData.level].bg,
                            borderRadius: 'var(--radius-sm)',
                            border: `2px solid ${ALERT_COLORS[currentFrameData.level].border}`,
                            marginBottom: '1.5rem',
                            textAlign: 'center'
                        }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: ALERT_COLORS[currentFrameData.level].text,
                                marginBottom: '0.5rem'
                            }}>
                                {currentFrameData.status}
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--slate-200)', margin: 0 }}>
                                {currentFrameData.message}
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <MetricCard title="Ciseaux" value={currentFrameData.data.ciseaux_visibles} color="sky" />
                            <MetricCard title="Mains" value={currentFrameData.data.mains_visibles} color="purple" />
                            <MetricCard title="Sang" value={currentFrameData.data.taux_sang} color="red" />
                            <MetricCard title="Visibilité" value={currentFrameData.data.visibilite} color="emerald" />
                        </div>

                        <button className="btn btn-secondary" onClick={resetScan} style={{ width: '100%' }}>
                            Nouvelle Vidéo
                        </button>
                    </MedicalCard>
                </div>
            )}
        </div>
    );
}

function MetricCard({ title, value, color }) {
    const colors = {
        sky: { bg: 'rgba(14, 165, 233, 0.1)', border: 'rgba(14, 165, 233, 0.3)', text: 'var(--sky-500)' },
        purple: { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: 'var(--purple-500)' },
        red: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: 'var(--red-500)' },
        emerald: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: 'var(--emerald-500)' }
    };

    return (
        <div style={{
            padding: '1rem',
            background: colors[color].bg,
            borderRadius: '8px',
            border: `1px solid ${colors[color].border}`
        }}>
            <div style={{
                fontSize: '0.75rem',
                color: colors[color].text,
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase'
            }}>
                {title}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {value}
            </div>
        </div>
    );
}

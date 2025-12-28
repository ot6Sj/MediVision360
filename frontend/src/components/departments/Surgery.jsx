/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Icon from '../Icon';
import MedicalCard from '../MedicalCard';
import LoadingBar from '../LoadingBar';

export default function Surgery() {
    const [mode, setMode] = useState('image'); // 'image' or 'video'
    const [uploadedFile, setUploadedFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [result, setResult] = useState(null);

    // Video states
    const [videoData, setVideoData] = useState(null);
    const [currentSecond, setCurrentSecond] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);

    // Camera states
    const [usingCamera, setUsingCamera] = useState(false);
    const [stream, setStream] = useState(null);
    const cameraRef = useRef(null);

    const ALERT_COLORS = {
        red: { bg: 'rgba(239, 68, 68, 0.1)', border: 'var(--red-500)', text: 'var(--red-500)' },
        orange: { bg: 'rgba(251, 191, 36, 0.1)', border: 'var(--amber-500)', text: 'var(--amber-500)' },
        green: { bg: 'rgba(16, 185, 129, 0.1)', border: 'var(--emerald-500)', text: 'var(--emerald-500)' },
        gray: { bg: 'rgba(100, 116, 139, 0.1)', border: 'var(--slate-500)', text: 'var(--slate-400)' }
    };

    // Get current stats based on video time
    const getCurrentStats = () => {
        if (!videoData?.timeline) return null;
        return videoData.timeline.find(t => t.time === currentSecond) || videoData.timeline[0];
    };

    const currentStats = getCurrentStats();

    // Sync stats with video playback
    useEffect(() => {
        if (videoRef.current && videoData) {
            const video = videoRef.current;

            const handleTimeUpdate = () => {
                const second = Math.floor(video.currentTime);
                setCurrentSecond(second);
            };

            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);

            video.addEventListener('timeupdate', handleTimeUpdate);
            video.addEventListener('play', handlePlay);
            video.addEventListener('pause', handlePause);

            return () => {
                video.removeEventListener('timeupdate', handleTimeUpdate);
                video.removeEventListener('play', handlePlay);
                video.removeEventListener('pause', handlePause);
            };
        }
    }, [videoData]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setUsingCamera(true);
            if (cameraRef.current) {
                cameraRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Camera error:', error);
            alert('Impossible d\'accéder à la caméra');
        }
    };

    const capturePhoto = () => {
        const canvas = document.createElement('canvas');
        canvas.width = cameraRef.current.videoWidth;
        canvas.height = cameraRef.current.videoHeight;
        canvas.getContext('2d').drawImage(cameraRef.current, 0, 0);

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
        setProcessingProgress(0);
        setVideoData(null);
        setCurrentSecond(0);

        const progressInterval = setInterval(() => {
            setProcessingProgress(prev => Math.min(prev + 2, 90));
        }, 500);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('/api/scan/surgery-video-realtime', formData);

            clearInterval(progressInterval);
            setProcessingProgress(100);

            setTimeout(() => {
                setProcessing(false);
                setVideoData(response.data);
            }, 300);

        } catch (error) {
            clearInterval(progressInterval);
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
        setVideoData(null);
        setCurrentSecond(0);
        setIsPlaying(false);
        setProcessingProgress(0);
    };

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
                    YOLOv8s + HSV + Laplacian | Image & Vidéo | Temps Réel
                </p>
            </div>

            {!uploadedFile && !usingCamera && (
                <>
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
                            background: mode === 'video' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            border: `1px solid ${mode === 'video' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--slate-300)', margin: 0 }}>
                                {mode === 'image'
                                    ? '💡 Analyse instantanée: Outils, Hémorragie, Visibilité'
                                    : '🎬 Vidéo annotée avec stats synchronisées en temps réel'}
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
                    <video ref={cameraRef} autoPlay playsInline style={{
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
                            background: mode === 'video' ? 'var(--violet-500)' : 'var(--red-500)',
                            margin: '0 auto 12px'
                        }} />
                        <span style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                            {mode === 'video'
                                ? `Traitement YOLO frame par frame... ${processingProgress}%`
                                : 'Analyse en cours...'}
                        </span>
                    </div>
                    <LoadingBar />
                    {mode === 'video' && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            color: 'var(--slate-400)'
                        }}>
                            ⏱️ Encodage H.264 pour lecture fluide...
                        </div>
                    )}
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
                            <MetricCard title="Outils" value={result.data.ciseaux_visibles} color="sky" />
                            <MetricCard title="Mains" value={result.data.mains_visibles} color="purple" />
                            <MetricCard title="Taux Sang" value={result.data.taux_sang} color="red" />
                            <MetricCard title="Visibilité" value={result.data.visibilite} color="emerald" />
                        </div>

                        {result.detections && result.detections.length > 0 && (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(14, 165, 233, 0.05)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid rgba(14, 165, 233, 0.2)',
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: 'var(--sky-400)',
                                    marginBottom: '0.75rem'
                                }}>
                                    🔍 Objets Détectés ({result.total_objects})
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {result.detections.map((det, idx) => (
                                        <span key={idx} style={{
                                            padding: '0.375rem 0.75rem',
                                            background: 'rgba(14, 165, 233, 0.15)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.8125rem',
                                            color: 'var(--slate-200)',
                                            fontFamily: 'var(--font-mono)',
                                            border: '1px solid rgba(14, 165, 233, 0.3)'
                                        }}>
                                            {det.label} <span style={{ color: 'var(--sky-400)' }}>{det.confidence}%</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button className="btn btn-secondary" onClick={resetScan} style={{ width: '100%' }}>
                            Nouvelle Analyse
                        </button>
                    </MedicalCard>
                </div>
            )}

            {/* ========== VIDEO WITH SYNCHRONIZED STATS ========== */}
            {videoData && !processing && mode === 'video' && (
                <div className="reveal">
                    {/* Video Player */}
                    <MedicalCard title="Vidéo Annotée YOLO">
                        <video
                            ref={videoRef}
                            src={videoData.video}
                            controls
                            autoPlay
                            style={{
                                width: '100%',
                                maxWidth: '900px',
                                borderRadius: 'var(--radius-sm)',
                                border: `3px solid ${currentStats ? ALERT_COLORS[currentStats.level]?.border : 'var(--slate-600)'}`,
                                display: 'block',
                                margin: '0 auto',
                                transition: 'border-color 0.3s ease'
                            }}
                        />

                        {/* Playback indicator */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1rem',
                            marginTop: '1rem'
                        }}>
                            <span style={{
                                padding: '0.375rem 0.75rem',
                                background: isPlaying ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                color: isPlaying ? 'var(--emerald-400)' : 'var(--slate-400)',
                                fontFamily: 'var(--font-mono)'
                            }}>
                                {isPlaying ? '▶ LECTURE' : '⏸ PAUSE'}
                            </span>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.875rem',
                                color: 'var(--slate-300)'
                            }}>
                                {currentSecond}s / {videoData.duration}s
                            </span>
                        </div>
                    </MedicalCard>

                    {/* Real-time Stats */}
                    {currentStats && (
                        <MedicalCard title="Stats Temps Réel" style={{ marginTop: '1.5rem' }}>
                            <div style={{
                                padding: '1rem',
                                background: ALERT_COLORS[currentStats.level]?.bg || ALERT_COLORS.gray.bg,
                                borderRadius: 'var(--radius-sm)',
                                border: `2px solid ${ALERT_COLORS[currentStats.level]?.border || ALERT_COLORS.gray.border}`,
                                marginBottom: '1.5rem',
                                textAlign: 'center',
                                transition: 'all 0.3s ease'
                            }}>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: ALERT_COLORS[currentStats.level]?.text || 'var(--slate-300)',
                                    marginBottom: '0.25rem',
                                    fontFamily: 'var(--font-mono)'
                                }}>
                                    {currentStats.status}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--slate-300)', margin: 0 }}>
                                    {currentStats.message}
                                </p>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <MetricCard title="Outils" value={currentStats.tools} color="sky" live={isPlaying} />
                                <MetricCard title="Mains" value={currentStats.hands} color="purple" live={isPlaying} />
                                <MetricCard title="Sang" value={`${currentStats.blood_pct}%`} color="red" live={isPlaying} />
                                <MetricCard title="Netteté" value={Math.round(currentStats.sharpness)} color="emerald" live={isPlaying} />
                            </div>

                            {currentStats.detections?.length > 0 && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(139, 92, 246, 0.05)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    marginBottom: '1.5rem'
                                }}>
                                    <h4 style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: 'var(--violet-400)',
                                        marginBottom: '0.5rem',
                                        textTransform: 'uppercase'
                                    }}>
                                        Détections @ {currentSecond}s
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {currentStats.detections.map((det, idx) => (
                                            <span key={idx} style={{
                                                padding: '0.25rem 0.5rem',
                                                background: 'rgba(139, 92, 246, 0.15)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.75rem',
                                                color: 'var(--slate-200)',
                                                fontFamily: 'var(--font-mono)'
                                            }}>
                                                {det.label} {det.confidence}%
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </MedicalCard>
                    )}

                    {/* Summary */}
                    <MedicalCard title="Résumé" style={{ marginTop: '1.5rem' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--red-500)' }}>{videoData.summary.critical_seconds}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Critiques</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--amber-500)' }}>{videoData.summary.warning_seconds}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Alertes</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--emerald-500)' }}>{videoData.summary.stable_seconds}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Stables</div>
                            </div>
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

function MetricCard({ title, value, color, live }) {
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
            border: `1px solid ${colors[color].border}`,
            transition: 'all 0.2s ease'
        }}>
            <div style={{
                fontSize: '0.75rem',
                color: colors[color].text,
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                {title}
                {live && (
                    <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--emerald-500)',
                        animation: 'pulse 1s infinite'
                    }} />
                )}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                {value}
            </div>
        </div>
    );
}

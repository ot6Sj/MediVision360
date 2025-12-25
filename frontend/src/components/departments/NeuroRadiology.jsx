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

            console.log('Making API call to /api/scan/neuro...');
            const response = await axios.post('/api/scan/neuro', formData, {
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
                <MedicalCard title="Upload MRI Scan" subtitle="DICOM, JPEG, or PNG format">
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
                                    Analyzing brain MRI...
                                </span>
                            </div>
                            <LoadingBar />
                        </MedicalCard>
                    )}

                    {/* Results */}
                    {result && !analyzing && (
                        <div className="reveal">
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
                                            border: '1px solid var(--slate-700)'
                                        }}
                                    />
                                </MedicalCard>

                                <MedicalCard title="AI Heatmap">
                                    <img
                                        src={heatmapImage}
                                        alt="AI Heatmap"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--slate-700)'
                                        }}
                                    />
                                </MedicalCard>
                            </div>

                            {/* Diagnosis Card */}
                            <MedicalCard className="reveal-delay-1">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <ResultBadge type={result.diagnosis?.toLowerCase().includes('tumor') ? 'danger' : 'success'}>
                                            {result.diagnosis || 'Analysis Complete'}
                                        </ResultBadge>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontSize: '2.5rem',
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-mono)',
                                            color: result.confidence > 80 ? 'var(--emerald-500)' : 'var(--amber-500)',
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
                                            Confidence
                                        </div>
                                    </div>
                                </div>

                                {/* Confidence Meter */}
                                <div className="confidence-meter" style={{ marginBottom: '1.5rem' }}>
                                    <div
                                        className={result.confidence > 80 ? 'confidence-fill-success' : 'confidence-fill-danger'}
                                        style={{ width: `${result.confidence || 0}%` }}
                                    />
                                </div>

                                {/* Diagnosis Text */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: 'var(--slate-300)',
                                        marginBottom: '0.5rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Analysis Results
                                    </h4>
                                    <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                        {result.analysis || 'Model prediction completed successfully.'}
                                    </p>
                                </div>

                                {/* Recommendation */}
                                {result.recommendation && (
                                    <div style={{
                                        padding: '12px',
                                        background: 'rgba(14, 165, 233, 0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid rgba(14, 165, 233, 0.2)'
                                    }}>
                                        <h4 style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: 'var(--sky-500)',
                                            marginBottom: '4px',
                                            textTransform: 'uppercase'
                                        }}>
                                            Recommendation
                                        </h4>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--slate-300)' }}>
                                            {result.recommendation}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <button
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="btn btn-secondary"
                                        style={{ width: '100%' }}
                                    >
                                        <Icon name="document" className="w-4 h-4" />
                                        {showDetails ? 'Hide Details' : 'More Details'}
                                    </button>

                                    {/* Detailed Explanation Panel */}
                                    {showDetails && (
                                        <div className="fade-in" style={{
                                            padding: '1.5rem',
                                            background: 'rgba(15, 23, 42, 0.5)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--slate-700)'
                                        }}>
                                            <h4 style={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: 'var(--sky-400)',
                                                marginBottom: '1rem'
                                            }}>
                                                AI Analysis Breakdown
                                            </h4>

                                            {/* Model Architecture */}
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h5 style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: 'var(--slate-200)',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    Neural Network Architecture
                                                </h5>
                                                <p style={{
                                                    fontSize: '0.8125rem',
                                                    color: 'var(--slate-400)',
                                                    lineHeight: '1.6',
                                                    fontFamily: 'var(--font-mono)'
                                                }}>
                                                    Model: <span style={{ color: 'var(--sky-400)' }}>ResNet50</span> (Residual Neural Network, 50 layers)<br />
                                                    Input: 224×224×3 RGB MRI scan<br />
                                                    Classes: Binary (Healthy=0, Tumor=1)<br />
                                                    Activation: Softmax (probabilities)<br />
                                                    Probabilities: Healthy {((1 - result.confidence / 100) * 100).toFixed(1)}% | Tumor {result.confidence}%
                                                </p>
                                            </div>

                                            {/* Detection Methodology */}
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h5 style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: 'var(--slate-200)',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    Detection Methodology
                                                </h5>
                                                <p style={{
                                                    fontSize: '0.8125rem',
                                                    color: 'var(--slate-400)',
                                                    lineHeight: '1.6'
                                                }}>
                                                    The model analyzes MRI scans using deep convolutional layers to extract hierarchical features:
                                                </p>
                                                <ul style={{
                                                    fontSize: '0.8125rem',
                                                    color: 'var(--slate-400)',
                                                    lineHeight: '1.8',
                                                    marginTop: '0.5rem',
                                                    paddingLeft: '1.5rem'
                                                }}>
                                                    <li><strong>Low-level features:</strong> Edges, textures, intensity gradients</li>
                                                    <li><strong>Mid-level features:</strong> Tissue patterns, anatomical structures</li>
                                                    <li><strong>High-level features:</strong> Tumor-specific morphology, location patterns</li>
                                                </ul>
                                            </div>

                                            {/* Heatmap Explanation */}
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h5 style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: 'var(--slate-200)',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    Segmentation Heatmap
                                                </h5>
                                                <p style={{
                                                    fontSize: '0.8125rem',
                                                    color: 'var(--slate-400)',
                                                    lineHeight: '1.6'
                                                }}>
                                                    The red overlay shows <strong>intensity-based segmentation</strong> of hyper-intense regions:
                                                </p>
                                                <ul style={{
                                                    fontSize: '0.8125rem',
                                                    color: 'var(--slate-400)',
                                                    lineHeight: '1.8',
                                                    marginTop: '0.5rem',
                                                    paddingLeft: '1.5rem'
                                                }}>
                                                    <li><strong>CLAHE Enhancement:</strong> Adaptive histogram equalization for contrast</li>
                                                    <li><strong>Threshold: 70%</strong> of maximum pixel intensity</li>
                                                    <li><strong>Morphological filtering:</strong> Noise removal, region smoothing</li>
                                                    <li><strong>Gaussian blur (σ=41):</strong> Creates diffuse visualization</li>
                                                    <li><strong>Colormap:</strong> Jet (Blue=low, Red=high activation)</li>
                                                </ul>
                                                <p style={{
                                                    fontSize: '0.8125rem',
                                                    color: 'var(--amber-400)',
                                                    lineHeight: '1.6',
                                                    marginTop: '0.75rem',
                                                    fontStyle: 'italic'
                                                }}>
                                                    Note: In T2-weighted MRI, tumors typically appear hyper-intense (bright). The heatmap highlights these regions for clinical review.
                                                </p>
                                            </div>

                                            {/* Clinical Context */}
                                            <div>
                                                <h5 style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: 'var(--slate-200)',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    Clinical Interpretation
                                                </h5>
                                                <p style={{
                                                    fontSize: '0.8125rem',
                                                    color: 'var(--slate-400)',
                                                    lineHeight: '1.6'
                                                }}>
                                                    {result.confidence >= 70 ? (
                                                        <>
                                                            <strong style={{ color: 'var(--red-400)' }}>High confidence detection ({result.confidence}%)</strong> indicates significant probability of tumor presence.
                                                            The model identified abnormal tissue patterns consistent with neoplastic growth.
                                                            Immediate consultation with a neurosurgeon is recommended for biopsy confirmation and treatment planning.
                                                        </>
                                                    ) : (
                                                        <>
                                                            <strong style={{ color: 'var(--emerald-400)' }}>Low tumor probability ({result.confidence}%)</strong> suggests healthy brain tissue.
                                                            The model found no significant abnormalities in tissue density, structure, or morphology.
                                                            Regular monitoring and follow-up scans are advised as per standard protocols.
                                                        </>
                                                    )}
                                                </p>
                                                <p style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--slate-500)',
                                                    lineHeight: '1.6',
                                                    marginTop: '1rem',
                                                    padding: '0.75rem',
                                                    background: 'rgba(251, 191, 36, 0.1)',
                                                    borderLeft: '3px solid var(--amber-500)',
                                                    borderRadius: '4px'
                                                }}>
                                                    ⚠️ <strong>Disclaimer:</strong> This AI analysis is a diagnostic aid only and must not replace professional medical judgment.
                                                    All findings require confirmation by qualified radiologists and clinical correlation.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <button className="btn btn-secondary" onClick={resetScan} style={{ width: '100%', marginTop: '0.5rem' }}>
                                        New Scan
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

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const ScannerInterface = ({ onImageUpload, acceptedFormats = ['image/jpeg', 'image/png'] }) => {
    const [preview, setPreview] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
                if (onImageUpload) {
                    onImageUpload(file, e.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    }, [onImageUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFormats.reduce((acc, format) => ({ ...acc, [format]: [] }), {}),
        maxFiles: 1
    });

    return (
        <GlassCard className="text-center" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }} neon={isDragActive}>
            <div
                {...getRootProps()}
                style={{
                    padding: '3rem',
                    border: `3px dashed ${isDragActive ? '#00F0FF' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: isDragActive ? 'rgba(0, 240, 255, 0.1)' : 'transparent'
                }}
            >
                <input {...getInputProps()} />

                <motion.div
                    animate={{
                        scale: isDragActive ? 1.05 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 10px #00F0FF)' }}>
                        📁
                    </div>

                    <h3 className="neon-text" style={{
                        fontSize: '1.5rem',
                        marginBottom: '1rem',
                        fontFamily: 'Orbitron, sans-serif'
                    }}>
                        {isDragActive ? 'DROP IMAGE HERE' : 'UPLOAD MEDICAL IMAGE'}
                    </h3>

                    <p style={{
                        opacity: 0.7,
                        fontFamily: 'Share Tech Mono, monospace',
                        fontSize: '0.875rem',
                        color: '#E0E6ED'
                    }}>
                        Drag & drop or click to browse
                    </p>

                    <p style={{
                        marginTop: '1rem',
                        opacity: 0.5,
                        fontSize: '0.75rem',
                        fontFamily: 'Share Tech Mono, monospace',
                        color: '#E0E6ED'
                    }}>
                        ACCEPTED: JPEG, PNG, DICOM
                    </p>
                </motion.div>
            </div>

            {preview && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '2rem' }}
                >
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: '100%',
                            maxHeight: '300px',
                            objectFit: 'contain',
                            borderRadius: '12px',
                            border: '2px solid #00F0FF',
                            boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
                        }}
                    />
                </motion.div>
            )}
        </GlassCard>
    );
};

export default ScannerInterface;

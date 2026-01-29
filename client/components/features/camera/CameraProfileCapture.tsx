import React, { useState, useRef } from 'react';

/**
 * CameraProfileCapture.tsx
 * 
 * Componente para capturar foto de corpo inteiro do usuário via câmera
 * Integrado em ProfilePage para captura de foto de perfil
 */

interface CameraProfileCaptureProps {
    onPhotoCapture: (base64: string) => Promise<void>;
    isLoading?: boolean;
}

export default function CameraProfileCapture({ onPhotoCapture, isLoading }: CameraProfileCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [preview, setPreview] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [capturing, setCapturing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            console.log('🎥 [CameraProfileCapture] Iniciando câmera...');
            setError('');

            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Seu navegador não suporta acesso à câmera');
            }

            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            console.log('📹 [CameraProfileCapture] Solicitando permissão...');
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ [CameraProfileCapture] Stream obtido:', mediaStream.getTracks());

            if (videoRef.current) {
                console.log('📺 [CameraProfileCapture] Atribuindo stream ao video element...');
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                console.log('🎬 [CameraProfileCapture] Ativando câmera...');
                setCameraActive(true);
            } else {
                console.error('❌ [CameraProfileCapture] videoRef.current é null!');
                setError('Erro: câmera não pôde ser inicializada');
            }
        } catch (err: any) {
            console.error('❌ [CameraProfileCapture] Erro ao acessar câmera:', err);
            setError(`❌ ${err.message || 'Não foi possível acessar a câmera'}`);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
        setPreview('');
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const base64Image = canvas.toDataURL('image/jpeg', 0.9);
        setPreview(base64Image);
    };

    const handleConfirm = async () => {
        if (!preview) return;

        try {
            setCapturing(true);
            await onPhotoCapture(preview);
            stopCamera();
            setPreview('');
        } catch (err: any) {
            setError('Erro ao enviar foto para análise');
            console.error(err);
        } finally {
            setCapturing(false);
        }
    };

    const handleRetake = () => {
        setPreview('');
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            {console.log('🎥 [CameraProfileCapture] Renderizando:', { cameraActive, preview, isLoading })}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {!cameraActive && !preview && (
                <button
                    type="button"
                    onClick={(e) => {
                        console.log('🎥 [Button] Clicado em Usar Câmera');
                        e.preventDefault();
                        e.stopPropagation();
                        startCamera();
                    }}
                    disabled={isLoading}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2 w-full"
                >
                    📷 Usar Câmera
                </button>
            )}

            {/* VIDEO DA CÂMERA - SEMPRE RENDERIZADO */}
            <video
                ref={videoRef}
                className={`w-full h-auto aspect-video object-cover rounded-lg bg-black ${cameraActive && !preview ? 'block' : 'hidden'
                    }`}
                playsInline
                muted
                autoPlay
            />

            {/* OVERLAY DA CÂMERA */}
            {cameraActive && !preview && (
                <div className="relative bg-black rounded-lg overflow-hidden mt-2">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <svg
                            className="w-32 h-32 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                capturePhoto();
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium shadow-lg text-sm"
                        >
                            📸 Capturar
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                stopCamera();
                            }}
                            className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition font-medium shadow-lg text-sm"
                        >
                            ✕ Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* PREVIEW DA FOTO CAPTURADA */}
            {preview && (
                <div className="space-y-4">
                    <div className="bg-gray-100 rounded-lg overflow-hidden">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRetake();
                            }}
                            disabled={capturing || isLoading}
                            className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 font-medium text-sm"
                        >
                            🔄 Tirar Outra
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleConfirm();
                            }}
                            disabled={capturing || isLoading}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium text-sm"
                        >
                            {capturing ? '⏳ Enviando...' : '✅ Confirmar'}
                        </button>
                    </div>
                </div>
            )}

            {/* CANVAS OCULTO */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}

import React, { useState, useRef, useCallback } from 'react';

/**
 * CameraCapture.tsx
 * 
 * Componente genérico e reutilizável para captura de fotos via câmera
 * Centraliza toda a lógica de câmera em um lugar só
 * 
 * Uso:
 * - Captura de foto de perfil (ProfilePage)
 * - Captura de foto de produtos (CameraProdutoCapture)
 * - Captura de body (CameraCaptureScreen)
 */

export interface CameraCaptureProps {
    onPhotoCapture: (base64: string) => Promise<void> | void;
    onCancel?: () => void;
    buttonText?: string;
    facingMode?: 'user' | 'environment';
    isLoading?: boolean;
    showPreview?: boolean; // Se false, captura direta sem preview
}

type CameraState = 'idle' | 'active' | 'preview' | 'capturing';

export default function CameraCapture({
    onPhotoCapture,
    onCancel,
    buttonText = '📷 Usar Câmera',
    facingMode = 'user',
    isLoading = false,
    showPreview = true
}: CameraCaptureProps) {
    const [state, setState] = useState<CameraState>('idle');
    const [error, setError] = useState<string>('');
    const [preview, setPreview] = useState<string>('');
    const [capturing, setCapturing] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const facingModeRef = useRef<'user' | 'environment'>(facingMode);

    // ═══════════════════════════════════════════════════════════
    // INICIAR CÂMERA
    // ═══════════════════════════════════════════════════════════
    const startCamera = useCallback(async () => {
        try {
            console.log('📹 [CameraCapture] Iniciando câmera...');
            setError('');

            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Seu navegador não suporta acesso à câmera');
            }

            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: { ideal: facingModeRef.current },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            console.log('📹 [CameraCapture] Solicitando permissão...');
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ [CameraCapture] Stream obtido');

            streamRef.current = mediaStream;

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                console.log('📺 [CameraCapture] Stream atribuído ao vídeo');

                return new Promise<void>((resolve) => {
                    const timeout = setTimeout(() => {
                        console.warn('⏱️ [CameraCapture] Timeout aguardando metadata');
                        resolve();
                    }, 5000);

                    const handleLoadedMetadata = () => {
                        clearTimeout(timeout);
                        console.log('✅ [CameraCapture] Vídeo carregado');
                        videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
                        setState('active');
                        resolve();
                    };

                    videoRef.current!.addEventListener('loadedmetadata', handleLoadedMetadata);
                });
            }
        } catch (err: any) {
            console.error('❌ [CameraCapture] Erro:', err);
            const message =
                err.name === 'NotAllowedError' ? 'Acesso à câmera foi recusado' :
                    err.name === 'NotFoundError' ? 'Nenhuma câmera encontrada' :
                        err.message || 'Erro ao acessar câmera';

            setError(message);
        }
    }, []);

    // ═══════════════════════════════════════════════════════════
    // PARAR CÂMERA
    // ═══════════════════════════════════════════════════════════
    const stopCamera = useCallback(() => {
        console.log('🛑 [CameraCapture] Parando câmera...');
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setState('idle');
        setPreview('');
    }, []);

    // ═══════════════════════════════════════════════════════════
    // CAPTURAR FOTO
    // ═══════════════════════════════════════════════════════════
    const capturePhoto = useCallback(() => {
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
        setState('preview');
        console.log('📸 [CameraCapture] Foto capturada');
    }, []);

    // ═══════════════════════════════════════════════════════════
    // CONFIRMAR FOTO
    // ═══════════════════════════════════════════════════════════
    const handleConfirm = useCallback(async () => {
        try {
            setCapturing(true);
            console.log('📤 [CameraCapture] Enviando foto...');
            await onPhotoCapture(preview);
            stopCamera();
        } catch (err: any) {
            console.error('❌ [CameraCapture] Erro ao enviar:', err);
            setError('Erro ao processar foto');
        } finally {
            setCapturing(false);
        }
    }, [preview, onPhotoCapture, stopCamera]);

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════
    return (
        <div className="w-full">
            {/* ════════════════════════════════════════════════════════════
                ESTADO: INATIVO (Botão inicial)
            ════════════════════════════════════════════════════════════ */}
            {state === 'idle' && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startCamera();
                    }}
                    disabled={isLoading}
                    className="w-full group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                >
                    <span className="text-lg">📷</span>
                    <span>{buttonText}</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </button>
            )}

            {/* ════════════════════════════════════════════════════════════
                ESTADO: ATIVO (Câmera ligada)
            ════════════════════════════════════════════════════════════ */}
            {state === 'active' && (
                <div className="space-y-4">
                    {/* Container da câmera com borda elegante */}
                    <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl" style={{ aspectRatio: '4/3' }}>
                        {/* Vídeo */}
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            playsInline
                            muted
                            autoPlay
                        />

                        {/* Overlay com grid e círculo para foco */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* Grid de composição (Rule of thirds) */}
                            <div className="absolute inset-0 opacity-30">
                                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                                    {[...Array(9)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="border border-white"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Círculo de foco central */}
                            <div className="absolute w-32 h-32 border-2 border-yellow-300 rounded-full opacity-50 animate-pulse" />

                            {/* Cantos decorativos */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white opacity-50" />
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white opacity-50" />
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white opacity-50" />
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white opacity-50" />
                        </div>

                        {/* Badge de status */}
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            AO VIVO
                        </div>
                    </div>

                    {/* Mensagem de instrução */}
                    <p className="text-center text-gray-600 text-sm">
                        Posicione o produto bem centrado e com boa iluminação
                    </p>

                    {/* Botões de controle */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                stopCamera();
                            }}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                            <span>✕</span> Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                capturePhoto();
                            }}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">📸</span> Capturar
                        </button>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                ESTADO: PREVIEW
            ════════════════════════════════════════════════════════════ */}
            {state === 'preview' && showPreview && (
                <div className="space-y-4 animate-fadeIn">
                    {/* Container da imagem com borda elegante */}
                    <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-lg" style={{ aspectRatio: '4/3' }}>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay com checkmark */}
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />

                        {/* Badge de confirmação */}
                        <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <span>✓</span> Foto Capturada
                        </div>
                    </div>

                    {/* Mensagem de orientação */}
                    <p className="text-center text-gray-600 text-sm">
                        {capturing ? '⏳ Processando sua foto...' : 'A foto parece boa?'}
                    </p>

                    {/* Botões de ação */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setState('active');
                            }}
                            disabled={capturing || isLoading}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span>🔄</span> Tirar Outra
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleConfirm();
                            }}
                            disabled={capturing || isLoading}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {capturing ? (
                                <>
                                    <span className="animate-spin">⏳</span> Enviando...
                                </>
                            ) : (
                                <>
                                    <span>✅</span> Confirmar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                MENSAGEM DE ERRO
            ════════════════════════════════════════════════════════════ */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm font-medium flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Canvas oculto */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}

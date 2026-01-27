import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * CameraProdutoCapture.tsx
 * 
 * Componente de câmera simplificado para captura de fotos de produtos
 * Fluxo:
 * 1. Capturar foto do produto
 * 2. Enviar para Cloudinary
 * 3. Passar para análise IA (Gemini)
 * 4. Gerar SKU automaticamente
 */

interface CameraProdutoCaptureProps {
    lojaId: string;
    onProdutosCriados?: (produtos: any[]) => void;
    onCancelar?: () => void;
}

export default function CameraProdutoCapture({
    lojaId,
    onProdutosCriados,
    onCancelar
}: CameraProdutoCaptureProps) {
    const [step, setStep] = useState<'camera' | 'preview' | 'enviando'>('camera');
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [processError, setProcessError] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState<string | null>(null);
    const [photoData, setPhotoData] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const facingModeRef = useRef<'user' | 'environment'>('environment');

    // ═══════════════════════════════════════════════════════════
    // INICIAR CÂMERA
    // ═══════════════════════════════════════════════════════════
    const startCamera = useCallback(async () => {
        setCameraError(null);
        setProcessError(null);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setCameraError('Seu navegador não suporta acesso à câmera.');
                return;
            }

            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: { ideal: facingModeRef.current },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                return new Promise<void>((resolve) => {
                    if (!videoRef.current) {
                        resolve();
                        return;
                    }

                    const onLoadedMetadata = () => {
                        videoRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
                        resolve();
                    };

                    videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);

                    setTimeout(() => {
                        videoRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
                        resolve();
                    }, 3000);
                });
            }
        } catch (error: any) {
            console.error('Erro ao acessar câmera:', error);
            let mensagem = 'Erro ao acessar a câmera.';

            if (error.name === 'NotAllowedError') {
                mensagem = 'Acesso à câmera foi recusado. Verifique as permissões do navegador.';
            } else if (error.name === 'NotFoundError') {
                mensagem = 'Nenhuma câmera encontrada no dispositivo.';
            }

            setCameraError(mensagem);
        }
    }, []);

    // ═══════════════════════════════════════════════════════════
    // PARAR CÂMERA
    // ═══════════════════════════════════════════════════════════
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    // ═══════════════════════════════════════════════════════════
    // CAPTURAR FOTO
    // ═══════════════════════════════════════════════════════════
    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
        setPhotoData(dataUrl);
        setStep('preview');
    }, []);

    // ═══════════════════════════════════════════════════════════
    // ENVIAR PARA ANÁLISE
    // ═══════════════════════════════════════════════════════════
    const handleEnviarParaAnalise = async () => {
        if (!photoData) {
            setProcessError('Nenhuma foto foi capturada.');
            return;
        }

        try {
            setEnviando(true);
            setProcessError(null);

            // Converter data URL para Blob
            const response = await fetch(photoData);
            const blob = await response.blob();

            // Criar FormData com a imagem
            const formData = new FormData();
            formData.append('imagens', blob, 'produto.jpg');
            formData.append('lojaId', lojaId);

            // Enviar para o mesmo endpoint de lotes (reutilizar lógica de IA)
            const resultado = await fetch('/api/produtos/lotes/imagens', {
                method: 'POST',
                body: formData
            });

            const data = await resultado.json();

            if (!resultado.ok) {
                setProcessError(data.message || 'Erro ao processar imagem');
                return;
            }

            // Sucesso
            setSucesso('✅ Produto analisado e criado com sucesso!');

            if (onProdutosCriados) {
                onProdutosCriados(data.produtos || []);
            }

            // Limpar e fechar
            setTimeout(() => {
                setPhotoData(null);
                setStep('camera');
                setSucesso(null);
                if (onCancelar) onCancelar();
            }, 2000);
        } catch (error) {
            console.error('Erro ao enviar para análise:', error);
            setProcessError('Erro ao processar imagem. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // USAR CAMERA
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (step === 'camera') {
            startCamera();
        }

        return () => {
            if (step === 'camera') {
                stopCamera();
            }
        };
    }, [step, startCamera, stopCamera]);

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════

    if (step === 'camera') {
        return (
            <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    📸 Capturar Foto do Produto
                </h2>

                {cameraError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-medium">❌ Erro:</p>
                        <p className="text-red-600 text-sm mt-1">{cameraError}</p>
                    </div>
                )}

                <div className="relative bg-black rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '4/3' }}>
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                    />
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => {
                            stopCamera();
                            if (onCancelar) onCancelar();
                        }}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                        ❌ Cancelar
                    </button>
                    <button
                        onClick={capturePhoto}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-lg"
                    >
                        📷 Capturar Foto
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'preview') {
        return (
            <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    👀 Preview da Foto
                </h2>

                {processError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-medium">❌ Erro:</p>
                        <p className="text-red-600 text-sm mt-1">{processError}</p>
                    </div>
                )}

                {sucesso && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 font-medium">{sucesso}</p>
                    </div>
                )}

                <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '4/3' }}>
                    {photoData && (
                        <img
                            src={photoData}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => {
                            setPhotoData(null);
                            setStep('camera');
                        }}
                        disabled={enviando}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                    >
                        ◀️ Retomar
                    </button>
                    <button
                        onClick={handleEnviarParaAnalise}
                        disabled={enviando}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold disabled:opacity-50"
                    >
                        {enviando ? '⏳ Analisando...' : '✅ Enviar para Análise'}
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

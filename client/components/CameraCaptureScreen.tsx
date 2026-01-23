import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from './Button';
import Alert from './Alert';
import { Profile, DetectedMeasurements } from '../types';

interface CameraCaptureScreenProps {
  profile: Profile;
  onMeasurementsCaptured: (measurements: DetectedMeasurements, photoBase64: string) => void;
  onClose: () => void;
  skipOnboarding?: boolean; // ✅ NOVO: Pular tela de onboarding
}

type CameraStep = 'camera' | 'preview' | 'processing' | 'done';

const CameraCaptureScreen: React.FC<CameraCaptureScreenProps> = ({ profile, onMeasurementsCaptured, onClose, skipOnboarding }) => {
  const [step, setStep] = useState<CameraStep>('camera'); // ✅ Sempre começar direto na câmera
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [detectedMeasurements, setDetectedMeasurements] = useState<DetectedMeasurements | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // ✅ Iniciar câmera - VERSÃO CORRIGIDA
  const startCamera = useCallback(async () => {
    console.log('[Camera] ✅ startCamera chamado - iniciando câmera');
    setCameraError(null);
    setErrorMessage(null);

    try {
      console.log('[Camera] ✅ Solicitando acesso à câmera...');
      // ✅ Constraints mais simples e compatíveis
      const constraints = {
        video: {
          facingMode: 'user'
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[Camera] ✅ Stream obtido:', stream);

      streamRef.current = stream;

      // Atribuir o stream ao video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('[Camera] ✅ Stream atribuído ao video element');

        // Aguardar o vídeo carregar
        return new Promise<void>((resolve) => {
          if (!videoRef.current) {
            setCameraError('Erro: elemento de vídeo não disponível');
            resolve();
            return;
          }

          const onLoadedMetadata = () => {
            console.log('[Camera] ✅ Vídeo carregado, começando a reproduzir');
            console.log('[Camera] Dimensões:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);

            videoRef.current?.play().catch(err => {
              console.error('[Camera] Erro ao fazer play:', err);
              setCameraError('Erro ao iniciar reprodução do vídeo');
            });

            videoRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
            resolve();
          };

          videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
        });
      } else {
        console.error('[Camera] ❌ videoRef.current é null!');
        setCameraError('Erro interno: referência de vídeo não disponível');
      }
    } catch (err: any) {
      console.error('[Camera] ❌ Erro ao acessar câmera:', err);
      const errorMsg = err.name === 'NotAllowedError'
        ? 'Permissão de câmera negada. Por favor, verifique as configurações de privacidade do navegador e tente novamente.'
        : err.name === 'NotFoundError'
          ? 'Nenhuma câmera encontrada no dispositivo.'
          : err.name === 'NotReadableError'
            ? 'Câmera indisponível (pode estar em uso por outro aplicativo). Tente fechar outros apps e recarregar a página.'
            : 'Erro ao acessar a câmera: ' + err.message;
      console.error('[Camera] Mensagem de erro:', errorMsg);
      setCameraError(errorMsg);
      setErrorMessage(errorMsg);
    }
  }, []);

  // ✅ Parar câmera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('[Camera] Parando track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // ✅ Capturar foto
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      setErrorMessage('Erro interno: referência de vídeo ou canvas não disponível');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    console.log('[Camera] Capturando foto - video dimensions:', video.videoWidth, 'x', video.videoHeight);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setErrorMessage('Erro ao obter contexto do canvas');
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.9);

    console.log('[Camera] Foto capturada, tamanho:', base64.length);

    setPhotoData(base64);
    stopCamera();
    setStep('preview');
  }, [stopCamera]);

  // ✅ Iniciar countdown
  const startCountdown = useCallback(() => {
    setCountdown(3);
    let count = 3;

    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        capturePhoto();
      }
    }, 1000);
  }, [capturePhoto]);

  // ✅ Processar foto (simular IA)
  const processPhoto = useCallback(async () => {
    if (!photoData) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      console.log('[Camera] Processando foto com IA...');

      // Simula processamento com visão computacional
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Gera medidas simuladas
      const measurements: DetectedMeasurements = {
        chest_cm: Math.round(85 + Math.random() * 20),
        waist_cm: Math.round(65 + Math.random() * 20),
        hips_cm: Math.round(90 + Math.random() * 20),
        height_cm: Math.round(160 + Math.random() * 15),
        confidence: 0.85 + Math.random() * 0.15
      };

      console.log('[Camera] Medidas detectadas:', measurements);

      setDetectedMeasurements(measurements);
      onMeasurementsCaptured(measurements, photoData);
      setStep('done');
    } catch (err: any) {
      console.error('[Camera] Erro ao processar:', err);
      setErrorMessage('Erro ao processar a foto: ' + err.message);
      setStep('preview');
    } finally {
      setProcessing(false);
    }
  }, [photoData, onMeasurementsCaptured]);

  // ✅ Retry foto
  const retakePhoto = useCallback(() => {
    setPhotoData(null);
    setDetectedMeasurements(null);
    setCountdown(null);
    startCamera();
  }, [startCamera]);

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [stopCamera]);

  // ✅ NOVO: Iniciar câmera automaticamente ao montar
  useEffect(() => {
    console.log('[Camera] Iniciando câmera no mount do componente');
    startCamera();
  }, [startCamera]);

  return (
    <div className="w-full h-full bg-black flex flex-col">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* CAMERA */}
      {step === 'camera' && (
        <div className="flex-1 flex flex-col relative bg-black">
          {cameraError && (
            <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 p-4 rounded z-20">
              {cameraError}
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />

          <div className="absolute inset-0 border-4 border-dashed border-blue-400 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-50 text-white text-center p-4 rounded-lg">
              <p className="text-lg font-semibold">Posicione seu corpo dentro do quadro</p>
            </div>
          </div>

          {/* Botões fixados no rodapé com padding para não sobrepor vídeo */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-8 pb-6 px-4 flex flex-col items-center gap-4 z-10">
            {countdown !== null ? (
              <div className="text-white text-6xl font-bold drop-shadow-lg">{countdown}</div>
            ) : (
              <div className="flex gap-4 w-full max-w-sm justify-center">
                <button
                  onClick={startCountdown}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg transition shadow-lg active:scale-95"
                >
                  Capturar
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-bold text-lg transition shadow-lg active:scale-95"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {step === 'preview' && photoData && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Sua Foto</h2>
          <img
            src={photoData}
            alt="Foto capturada"
            className="max-w-full max-h-96 object-contain mb-8 rounded-lg border-4 border-blue-200"
          />
          {errorMessage && (
            <div className="w-full max-w-md mb-4 bg-red-100 border border-red-400 text-red-700 p-4 rounded">
              {errorMessage}
            </div>
          )}
          <button
            onClick={processPhoto}
            disabled={processing}
            className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 mb-3"
          >
            {processing ? 'Processando...' : 'Usar Esta Foto'}
          </button>
          <button
            onClick={retakePhoto}
            disabled={processing}
            className="w-full max-w-sm bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition disabled:opacity-50"
          >
            Tirar Outra Foto
          </button>
        </div>
      )}

      {/* PROCESSING */}
      {step === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-6"></div>
          <p className="text-xl font-semibold text-gray-800">Analisando suas medidas...</p>
        </div>
      )}

      {/* DONE */}
      {step === 'done' && detectedMeasurements && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">✅ Sucesso!</h2>
          <p className="text-gray-600 mb-8">Suas medidas foram detectadas</p>

          <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">Busto</p>
              <p className="text-2xl font-bold text-blue-600">{detectedMeasurements.chest_cm}cm</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">Cintura</p>
              <p className="text-2xl font-bold text-blue-600">{detectedMeasurements.waist_cm}cm</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">Quadril</p>
              <p className="text-2xl font-bold text-blue-600">{detectedMeasurements.hips_cm}cm</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">Altura</p>
              <p className="text-2xl font-bold text-blue-600">{detectedMeasurements.height_cm}cm</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraCaptureScreen;
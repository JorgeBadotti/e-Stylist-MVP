import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from './Button';
import Alert from './Alert';
import { Profile, DetectedMeasurements } from '../types';

interface CameraCaptureScreenProps {
  profile: Profile;
  onMeasurementsCaptured: (measurements: DetectedMeasurements, photoBase64: string) => void;
  onClose: () => void;
}

type CameraStep = 'onboarding' | 'camera' | 'preview' | 'processing' | 'done';

const CameraCaptureScreen: React.FC<CameraCaptureScreenProps> = ({ profile, onMeasurementsCaptured, onClose }) => {
  const [step, setStep] = useState<CameraStep>('onboarding');
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
  // Usar useRef para armazenar a função para evitar ciclos infinitos
  const initializeStreamRef = useRef<((videoElement: HTMLVideoElement) => void) | null>(null);

  const startCamera = useCallback(async () => {
    console.log('[Camera] ✅ startCamera chamado - mudando para step "camera"');
    setCameraError(null);
    setErrorMessage(null);

    // PRIMEIRO: Mudar para 'camera' para renderizar o elemento de vídeo
    setStep('camera');

    // DEPOIS: Aguardar um pouco para garantir que o elemento foi renderizado
    await new Promise(resolve => setTimeout(resolve, 200));

    // AGORA tentar acessar o videoRef
    if (!videoRef.current) {
      console.error('[Camera] ❌ videoRef.current ainda está NULL após renderização!');
      setCameraError('Erro: elemento de vídeo não disponível. Tente novamente.');
      setStep('onboarding');
      return;
    }

    try {
      console.log('[Camera] ✅ Solicitando acesso à câmera...');
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[Camera] Stream obtido:', stream);

      streamRef.current = stream;

      // Agora sim, atribuir o stream ao video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('[Camera] ✅ Stream atribuído ao video element');

        // Aguardar o vídeo carregar
        videoRef.current.onloadedmetadata = () => {
          console.log('[Camera] ✅ Vídeo carregado, começando a reproduzir');
          console.log('[Camera] Dimensões:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          videoRef.current?.play().catch(err => {
            console.error('[Camera] Erro ao fazer play:', err);
            setCameraError('Erro ao iniciar reprodução do vídeo');
          });
        };

        videoRef.current.onerror = (err) => {
          console.error('[Camera] Erro no video element:', err);
          setCameraError('Erro no video element');
        };
      } else {
        console.error('[Camera] ❌ videoRef.current desapareceu após mudança de step!');
        setCameraError('Erro interno: referência de vídeo não disponível');
      }
    } catch (err: any) {
      console.error('[Camera] Erro ao acessar câmera:', err);
      const errorMsg = err.name === 'NotAllowedError'
        ? 'Permissão de câmera negada. Verifique as configurações do navegador.'
        : err.name === 'NotFoundError'
          ? 'Nenhuma câmera encontrada no dispositivo.'
          : 'Erro ao acessar a câmera: ' + err.message;
      setCameraError(errorMsg);
      setErrorMessage(errorMsg);
      setStep('onboarding');
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

  return (
    <div className="w-full h-full bg-black flex flex-col">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ONBOARDING */}
      {step === 'onboarding' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Capture Seu Corpo</h2>
          <div className="max-w-md space-y-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700"><strong>✓ Boa iluminação</strong> - Local bem iluminado</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700"><strong>✓ Corpo inteiro</strong> - Apareça da cabeça aos pés</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700"><strong>✓ Roupa colada</strong> - Destaque seu corpo</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700"><strong>✓ Postura reta</strong> - Costas retas, braços afastados</p>
            </div>
          </div>
          <button
            onClick={startCamera}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition mb-3"
          >
            Abrir Câmera
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* CAMERA */}
      {step === 'camera' && (
        <div className="flex-1 flex flex-col relative">
          {cameraError && (
            <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 p-4 rounded z-10">
              {cameraError}
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />

          <div className="absolute inset-0 border-4 border-dashed border-blue-400 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 text-white text-center p-4 rounded-lg">
              <p className="text-lg font-semibold">Posicione seu corpo dentro do quadro</p>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
            {countdown !== null ? (
              <div className="text-white text-6xl font-bold drop-shadow-lg">{countdown}</div>
            ) : (
              <>
                <button
                  onClick={startCountdown}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg transition shadow-lg"
                >
                  Capturar
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-bold text-lg transition shadow-lg"
                >
                  Cancelar
                </button>
              </>
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
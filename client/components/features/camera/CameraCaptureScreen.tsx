import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from '../../ui/Button';
import Alert from '../../ui/Alert';
import { Profile, DetectedMeasurements } from '../../../src/types/types';

interface CameraCaptureScreenProps {
  profile: Profile;
  onMeasurementsCaptured: (measurements: DetectedMeasurements, photoBase64: string) => void;
  onClose: () => void;
  skipOnboarding?: boolean; // ✅ NOVO: Pular tela de onboarding
}

type CameraStep = 'camera' | 'preview' | 'edit-measurements' | 'processing';

const CameraCaptureScreen: React.FC<CameraCaptureScreenProps> = ({ profile, onMeasurementsCaptured, onClose, skipOnboarding }) => {
  const [step, setStep] = useState<CameraStep>('camera'); // ✅ Sempre começar direto na câmera
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [detectedMeasurements, setDetectedMeasurements] = useState<DetectedMeasurements | null>(null);
  const [editedMeasurements, setEditedMeasurements] = useState<DetectedMeasurements | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const facingModeRef = useRef<'user' | 'environment'>('environment');
  const [countdown, setCountdown] = useState<number | null>(null);

  // ✅ Iniciar câmera - VERSÃO CORRIGIDA COM FALLBACKS PARA MOBILE
  const startCamera = useCallback(async () => {
    console.log('[Camera] ✅ startCamera chamado - iniciando câmera');
    setCameraError(null);
    setErrorMessage(null);

    try {
      console.log('[Camera] ✅ Solicitando acesso à câmera...');

      // ✅ VERIFICAR se o navegador suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = 'Seu navegador/dispositivo não suporta acesso à câmera. Tente usar Google Chrome ou Firefox no Android.';
        console.error('[Camera] ❌ mediaDevices não suportado:', errorMsg);
        setCameraError(errorMsg);
        setErrorMessage(errorMsg);
        return;
      }

      // ✅ Constraints otimizadas para MOBILE - CÂMERA TRASEIRA
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingModeRef.current },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      console.log('[Camera] ✅ Constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[Camera] ✅ Stream obtido:', stream);
      console.log('[Camera] Tracks:', stream.getTracks().map(t => ({ kind: t.kind, settings: t.getSettings() })));

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

          // ✅ TIMEOUT de 10 segundos para não travar
          const timeoutId = setTimeout(() => {
            console.error('[Camera] ❌ Timeout aguardando loadedmetadata');
            setCameraError('Timeout ao carregar câmera. Tente novamente.');
            stopCamera();
            resolve();
          }, 10000);

          const onLoadedMetadata = () => {
            console.log('[Camera] ✅ Vídeo carregado, começando a reproduzir');
            console.log('[Camera] Dimensões:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);

            clearTimeout(timeoutId);

            videoRef.current?.play().catch(err => {
              console.error('[Camera] Erro ao fazer play:', err);
              setCameraError('Erro ao iniciar reprodução do vídeo. Tente novamente.');
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
      console.error('[Camera] Error name:', err.name);
      console.error('[Camera] Error message:', err.message);

      let errorMsg = 'Erro ao acessar a câmera: ' + err.message;

      if (err.name === 'NotAllowedError') {
        errorMsg = '🔒 Permissão de câmera negada!\n\n1. Toque na âncora 🔒 ao lado da URL\n2. Permita acesso à câmera\n3. Recarregue a página';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = '📷 Nenhuma câmera encontrada no dispositivo. Verifique se seu aparelho tem câmera.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = '⚠️ Câmera indisponível (pode estar em uso por outro aplicativo).\n\nTente:\n1. Fechar outros apps que usam câmera\n2. Reiniciar o navegador\n3. Recarregar a página';
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = '⚙️ Seu dispositivo não suporta os requisitos de câmera. Tente com constraints básicas.';
        // ✅ FALLBACK: Tentar com constraints mais simples
        console.log('[Camera] Tentando com constraints mais simples...');
        setTimeout(() => startCamera(), 1000);
        return;
      } else if (err.message?.includes('getUserMedia')) {
        errorMsg = '📱 Câmera não suportada. Use Google Chrome ou Firefox.\n\nRequisitos:\n- HTTPS (em produção)\n- Permissão de câmera';
      }

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

  // ✅ Função para trocar câmera (frontal/traseira)
  const toggleCamera = () => {
    facingModeRef.current = facingModeRef.current === 'environment' ? 'user' : 'environment';
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 500);
  };

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
        weight_kg: Math.round(55 + Math.random() * 30),
        confidence: 0.85 + Math.random() * 0.15
      };

      console.log('[Camera] Medidas detectadas:', measurements);

      setDetectedMeasurements(measurements);
      setEditedMeasurements(measurements);
      setStep('edit-measurements');
    } catch (err: any) {
      console.error('[Camera] Erro ao processar:', err);
      setErrorMessage('Erro ao processar a foto: ' + err.message);
      setStep('preview');
    } finally {
      setProcessing(false);
    }
  }, [photoData]);

  // ✅ Retry foto
  const retakePhoto = () => {
    setPhotoData(null);
    setDetectedMeasurements(null);
    setEditedMeasurements(null);
    setCountdown(null);
    setStep('camera');
    startCamera();
  };

  // ✅ Confirmar medidas editadas
  const confirmMeasurements = () => {
    if (!editedMeasurements || !photoData) return;

    console.log('[Camera] Confirmando medidas:', editedMeasurements);
    onMeasurementsCaptured(editedMeasurements, photoData);
    onClose(); // Fechar o componente de câmera após confirmar
  };

  // ✅ Editar medida individual
  const updateMeasurement = (key: keyof DetectedMeasurements, value: string) => {
    if (!editedMeasurements) return;

    const numValue = parseFloat(value) || 0;
    setEditedMeasurements({
      ...editedMeasurements,
      [key]: numValue
    });
  };

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [stopCamera]);

  // ✅ NOVO: Iniciar câmera automaticamente ao montar
  useEffect(() => {
    console.log('[CameraCaptureScreen] Montando componente');
    console.log('[CameraCaptureScreen] Iniciando câmera no mount do componente');
    startCamera().then(() => {
      console.log('[CameraCaptureScreen] startCamera completado');
    }).catch(err => {
      console.error('[CameraCaptureScreen] Erro ao iniciar câmera:', err);
    });
  }, [startCamera]);

  return (
    <div className="w-full h-full bg-black flex flex-col" style={{ minHeight: '90vh' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* CAMERA */}
      {step === 'camera' && (
        <div className="flex-1 flex flex-col relative bg-black overflow-hidden">
          {cameraError && (
            <div className="absolute top-4 left-4 right-4 bg-red-100 border-2 border-red-500 text-red-900 p-4 rounded z-20 shadow-lg">
              <p className="font-bold mb-2">⚠️ Erro ao acessar câmera:</p>
              <p className="text-sm whitespace-pre-line mb-4">{cameraError}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCameraError(null);
                    startCamera();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition text-sm"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: '100%', height: '100%' }}
            onLoadedMetadata={() => {
              console.log('[Camera-Video] onLoadedMetadata disparado');
            }}
            onError={(e) => {
              console.error('[Camera-Video] Video error:', e);
              setCameraError('Erro ao carregar vídeo da câmera');
            }}
          />

          <div className="absolute inset-0 border-4 border-dashed border-blue-400 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-50 text-white text-center p-4 rounded-lg">
              <p className="text-lg font-semibold">Posicione seu corpo dentro do quadro</p>
            </div>
          </div>

          {/* Botões fixados no rodapé com altura reduzida */}
          <div className="pb-4 pt-6 px-4 flex flex-col items-center gap-2 z-10">
            {countdown !== null ? (
              <div className="text-white text-3xl font-bold drop-shadow-lg">{countdown}</div>
            ) : (
              <>
                <div className="flex gap-3 w-full max-w-sm justify-center">
                  <button
                    onClick={startCountdown}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-bold transition shadow-lg active:scale-95 text-xs sm:text-sm"
                  >
                    📸 Capturar
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold transition shadow-lg active:scale-95 text-xs sm:text-sm"
                  >
                    ✕ Cancelar
                  </button>
                </div>
                <button
                  onClick={toggleCamera}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full font-semibold transition shadow-lg active:scale-95 text-xs sm:text-sm"
                  title="Trocar entre câmera frontal e traseira"
                >
                  🔄 Câmera
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

      {/* EDITAR MEDIDAS */}
      {step === 'edit-measurements' && editedMeasurements && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white">
          <h2 className="text-xl font-bold mb-1 text-gray-900">Verifique Suas Medidas</h2>
          <p className="text-gray-600 mb-6 text-xs">Edite se necessário e confirme</p>

          <div className="w-full max-w-sm space-y-4">
            {/* LINHA 1: ALTURA E PESO */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <label className="text-xs font-semibold text-gray-600 block">Altura (cm)</label>
                <input
                  type="number"
                  value={editedMeasurements.height_cm}
                  onChange={(e) => updateMeasurement('height_cm', e.target.value)}
                  className="w-full border-2 border-green-300 rounded px-2 py-1 text-lg font-bold text-green-600 focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <label className="text-xs font-semibold text-gray-600 block">Peso (kg)</label>
                <input
                  type="number"
                  value={editedMeasurements.weight_kg}
                  onChange={(e) => updateMeasurement('weight_kg', e.target.value)}
                  className="w-full border-2 border-orange-300 rounded px-2 py-1 text-lg font-bold text-orange-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* LINHA 2: BUSTO, CINTURA E QUADRIL */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <label className="text-xs font-semibold text-gray-600 block">Busto</label>
                <input
                  type="number"
                  value={editedMeasurements.chest_cm}
                  onChange={(e) => updateMeasurement('chest_cm', e.target.value)}
                  className="w-full border-2 border-blue-300 rounded px-2 py-1 text-base font-bold text-blue-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <label className="text-xs font-semibold text-gray-600 block">Cintura</label>
                <input
                  type="number"
                  value={editedMeasurements.waist_cm}
                  onChange={(e) => updateMeasurement('waist_cm', e.target.value)}
                  className="w-full border-2 border-purple-300 rounded px-2 py-1 text-base font-bold text-purple-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                <label className="text-xs font-semibold text-gray-600 block">Quadril</label>
                <input
                  type="number"
                  value={editedMeasurements.hips_cm}
                  onChange={(e) => updateMeasurement('hips_cm', e.target.value)}
                  className="w-full border-2 border-pink-300 rounded px-2 py-1 text-base font-bold text-pink-600 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* BOTÕES */}
          <div className="w-full max-w-sm flex gap-2 mt-6">
            <button
              onClick={() => setStep('preview')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold text-sm transition"
            >
              Voltar
            </button>
            <button
              onClick={confirmMeasurements}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 rounded-lg font-semibold text-sm transition"
            >
              ✅ Confirmar
            </button>
          </div>
        </div>
      )}

      {/* PROCESSING */}
      {step === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-6"></div>
          <p className="text-xl font-semibold text-gray-800">Analisando suas medidas...</p>
        </div>
      )}
    </div>
  );
};

export default CameraCaptureScreen;
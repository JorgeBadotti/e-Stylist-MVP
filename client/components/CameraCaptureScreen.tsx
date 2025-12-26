import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from './Button';
import Alert from './Alert';
import { Profile, DetectedMeasurements } from '../types';

interface CameraCaptureScreenProps {
  profile: Profile;
  onMeasurementsCaptured: (measurements: DetectedMeasurements, photoBase64: string) => void;
  onClose: () => void;
}

type CameraStep = 'onboarding' | 'capture' | 'countdown' | 'preview' | 'processing' | 'results';

const CameraCaptureScreen: React.FC<CameraCaptureScreenProps> = ({ profile, onMeasurementsCaptured, onClose }) => {
  const [currentStep, setCurrentStep] = useState<CameraStep>('onboarding');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoTaken, setPhotoTaken] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedMeasurements, setDetectedMeasurements] = useState<DetectedMeasurements | null>(null);
  const [processingLoading, setProcessingLoading] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const startCamera = useCallback(async () => {
    setErrorMessage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setCurrentStep('capture');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setErrorMessage('Não foi possível acessar a câmera. Verifique as permissões.');
      setCurrentStep('onboarding'); // Volta para onboarding ou exibe erro permanente
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setPhotoTaken(dataUrl);
        stopCamera();
        setCurrentStep('preview');
      }
    }
  }, [stopCamera]);

  const startCountdown = useCallback(() => {
    setCurrentStep('countdown');
    setCountdown(3);
    countdownIntervalRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          takePhoto();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [takePhoto]);

  const simulateCVApi = useCallback(async (photoBase64: string): Promise<DetectedMeasurements> => {
    setProcessingLoading(true);
    // Simula uma chamada de API de visão computacional
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simula delay de rede

    // Lógica de simulação de confiança e medidas (pode ser ajustada)
    const randomConfidence = Math.random(); // Gera um valor de confiança aleatório
    if (randomConfidence < 0.8) {
      // Baixa confiança, forçar retake
      setProcessingLoading(false);
      setErrorMessage('Não conseguimos uma boa leitura. Por favor, tente novamente ajustando a postura.');
      throw new Error('Low confidence');
    }

    // Simula medidas baseadas em um perfil de exemplo e ajustadas aleatoriamente
    const baseMeasures = profile.body_measurements || { chest_cm: 90, waist_cm: 70, hips_cm: 95, height_cm: 160 };
    const adjust = (val: number) => Math.round(val + (Math.random() - 0.5) * 5); // Pequena variação

    const detected: DetectedMeasurements = {
      chest_cm: adjust(baseMeasures.chest_cm!),
      waist_cm: adjust(baseMeasures.waist_cm!),
      hips_cm: adjust(baseMeasures.hips_cm!),
      height_cm: adjust(baseMeasures.height_cm!),
      confidence: randomConfidence,
    };
    setProcessingLoading(false);
    return detected;
  }, [profile]);

  const handleConfirmPhoto = useCallback(async () => {
    if (!photoTaken) return;
    setCurrentStep('processing');
    setErrorMessage(null);
    try {
      const measures = await simulateCVApi(photoTaken);
      setDetectedMeasurements(measures);
      setCurrentStep('results');
      onMeasurementsCaptured(measures, photoTaken); // Chama o callback para atualizar o App.tsx
    } catch (err: any) {
      if (err.message === 'Low confidence') {
        // Já tratado dentro de simulateCVApi, volta para o capture
        setCurrentStep('capture');
      } else {
        console.error('Erro no processamento da foto:', err);
        setErrorMessage(`Falha ao processar a foto: ${err.message || 'Erro desconhecido'}.`);
        setCurrentStep('capture'); // Ou um step de erro dedicado
      }
    }
  }, [photoTaken, simulateCVApi, onMeasurementsCaptured]);

  const handleRetakePhoto = useCallback(() => {
    setPhotoTaken(null);
    setDetectedMeasurements(null);
    setErrorMessage(null);
    startCamera(); // Reinicia a câmera
  }, [startCamera]);

  useEffect(() => {
    // Limpar o stream da câmera ao desmontar o componente
    return () => {
      stopCamera();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [stopCamera]);

  // Renderização condicional dos passos
  const renderContent = () => {
    switch (currentStep) {
      case 'onboarding':
        return (
          <div className="flex flex-col items-center p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Prepare-se para Capturar Suas Medidas!</h2>
            <p className="text-gray-700 mb-4">Para as medições mais precisas, siga este guia:</p>
            <ul className="text-left text-gray-700 list-disc list-inside space-y-2 mb-6">
              <li><span className="font-semibold">Iluminação é tudo:</span> Escolha um local bem iluminado, sem sombras fortes.</li>
              <li><span className="font-semibold">Fundo Neutro:</span> Use uma parede de cor única, sem muitos objetos.</li>
              <li><span className="font-semibold">Corpo Inteiro:</span> Garanta que você apareça da cabeça aos pés.</li>
              <li><span className="font-semibold">Postura Natural:</span> Costas retas, braços levemente afastados, pés juntos.</li>
              <li><span className="font-semibold">Ângulo do Peito:</span> O celular deve estar na altura do seu peito, paralelo ao chão.</li>
              <li><span className="font-semibold">Roupas Ajustadas:</span> Use roupas que fiquem próximas ao corpo (legging, camiseta).</li>
            </ul>
            <Button onClick={startCamera} className="w-full">
              Entendi, vamos lá!
            </Button>
            <Button onClick={onClose} className="mt-2 w-full bg-gray-300 hover:bg-gray-400 text-gray-800">
              Cancelar
            </Button>
          </div>
        );

      case 'capture':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted></video>
            <div className="absolute inset-0 border-4 border-blue-500 border-dashed flex items-center justify-center p-4">
              <span className="text-white text-lg font-semibold text-center drop-shadow">
                Posicione seu corpo dentro do contorno.
              </span>
            </div>
            <Button onClick={startCountdown} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-600">
              Capturar Foto
            </Button>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </div>
        );

      case 'countdown':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted></video>
            <div className="absolute inset-0 border-4 border-blue-500 border-dashed flex items-center justify-center">
              <span className="text-white text-8xl font-bold drop-shadow-lg animate-pulse">{countdown}</span>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="flex flex-col items-center p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sua foto ficou ótima?</h2>
            {photoTaken && (
              <img src={photoTaken} alt="Preview da foto" className="max-w-full h-64 object-contain mb-4 rounded-lg shadow-md" />
            )}
            {errorMessage && <Alert type="error" message={errorMessage} className="mb-4 w-full" />}
            <Button onClick={handleConfirmPhoto} disabled={processingLoading} className="w-full">
              {processingLoading ? 'Processando...' : 'Sim, usar esta foto!'}
            </Button>
            <Button onClick={handleRetakePhoto} disabled={processingLoading} className="mt-2 w-full bg-gray-300 hover:bg-gray-400 text-gray-800">
              Tentar de novo
            </Button>
          </div>
        );

      case 'processing':
        return (
          <div className="flex flex-col items-center p-6 text-center h-full justify-center">
            <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-semibold text-gray-700">Analisando suas medidas com inteligência...</p>
          </div>
        );

      case 'results':
        return (
          <div className="flex flex-col items-center p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Medidas Detectadas!</h2>
            {detectedMeasurements && (
              <div className="bg-blue-50 p-4 rounded-lg text-left w-full max-w-sm mb-4">
                <p><strong>Busto:</strong> {detectedMeasurements.chest_cm} cm</p>
                <p><strong>Cintura:</strong> {detectedMeasurements.waist_cm} cm</p>
                <p><strong>Quadril:</strong> {detectedMeasurements.hips_cm} cm</p>
                <p><strong>Altura:</strong> {detectedMeasurements.height_cm} cm</p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold">Confiança:</span> {(detectedMeasurements.confidence * 100).toFixed(0)}%
                </p>
              </div>
            )}
            <p className="text-gray-700 mb-4">Suas novas medidas foram salvas no perfil.</p>
            <Button onClick={onClose} className="w-full">
              Concluir
            </Button>
            <Button onClick={handleRetakePhoto} className="mt-2 w-full bg-gray-300 hover:bg-gray-400 text-gray-800">
              Tirar outra foto
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center p-4 z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col relative overflow-hidden">
        {errorMessage && <Alert type="error" message={errorMessage} className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-11/12" />}
        {renderContent()}
      </div>
    </div>
  );
};

export default CameraCaptureScreen;
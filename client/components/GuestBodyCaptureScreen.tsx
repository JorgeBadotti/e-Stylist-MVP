import React, { useState, useCallback, useEffect } from 'react';
import CameraCaptureScreen from './CameraCaptureScreen';
import { DetectedMeasurements, Profile } from '../src/types/types'

interface GuestBodyCaptureScreenProps {
    onMeasurementsCaptured: (measurements: DetectedMeasurements, photoBase64: string) => void;
    showCamera?: boolean; // ✅ NOVO: Controlar câmera do pai
    onShowCameraChange?: (show: boolean) => void; // ✅ NOVO: Callback para mudar estado no pai
}

const GuestBodyCaptureScreen: React.FC<GuestBodyCaptureScreenProps> = ({
    onMeasurementsCaptured,
    showCamera = false, // ✅ NOVO: Receber do pai
    onShowCameraChange // ✅ NOVO: Callback para avisar pai
}) => {
    console.log('[GuestBodyCapture] Renderizado com showCamera=', showCamera); // ✅ DEBUG
    console.log('[GuestBodyCapture] onShowCameraChange é função?', typeof onShowCameraChange === 'function'); // ✅ DEBUG

    // ✅ NOVO: Debug useEffect para monitorar mudanças de prop
    useEffect(() => {
        console.log('[GuestBodyCapture] useEffect: showCamera mudou para', showCamera);
    }, [showCamera]);

    const [guestMeasurements, setGuestMeasurements] = useState<DetectedMeasurements | null>(null);
    const [guestPhoto, setGuestPhoto] = useState<string | null>(null);

    // ✅ Perfil fictício do visitante para passar ao CameraCaptureScreen
    const guestProfile: Profile = {
        name: 'Visitante',
        style_preferences: ['Casual'],
        body_shape: 'Não definido',
        body_measurements: {
            chest_cm: guestMeasurements?.chest_cm || 90,
            waist_cm: guestMeasurements?.waist_cm || 75,
            hips_cm: guestMeasurements?.hips_cm || 95,
            height_cm: guestMeasurements?.height_cm || 165,
        },
        photo_base64: guestPhoto || '',
    };

    const handleCameraMeasurements = useCallback(
        (measurements: DetectedMeasurements, photoBase64: string) => {
            console.log('[GuestBodyCapture] Medidas capturadas:', measurements);
            setGuestMeasurements(measurements);
            setGuestPhoto(photoBase64);
            // Passar para o pai (LooksPage)
            onMeasurementsCaptured(measurements, photoBase64);
        },
        [onMeasurementsCaptured]
    );

    const handleCancel = () => {
        console.log('[GuestBodyCapture] handleCancel executado'); // ✅ DEBUG
        console.log('[GuestBodyCapture] showCamera ANTES de chamar callback:', showCamera); // ✅ DEBUG
        if (onShowCameraChange) {
            console.log('[GuestBodyCapture] Chamando onShowCameraChange(false)'); // ✅ DEBUG
            onShowCameraChange(false); // ✅ NOVO: Avisar pai
            console.log('[GuestBodyCapture] onShowCameraChange foi chamado'); // ✅ DEBUG
        } else {
            console.error('[GuestBodyCapture] onShowCameraChange é undefined no handleCancel!'); // ✅ DEBUG
        }
    };

    // ✅ NOVO: Mostrar instruções + botão, depois câmera
    if (!showCamera) {
        console.log('[GuestBodyCapture] Renderizando tela de instruções'); // ✅ DEBUG
        return (
            <div className="w-full h-screen flex flex-col bg-gray-100">
                {/* Instruções */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-4 flex-shrink-0">
                    <h2 className="text-xl font-bold mb-3">📸 Tire uma Foto no Espelho</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-4">
                        <div className="flex items-start gap-2">
                            <span className="text-white font-bold flex-shrink-0">✓</span>
                            <span>Boa iluminação</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-white font-bold flex-shrink-0">✓</span>
                            <span>Corpo inteiro</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-white font-bold flex-shrink-0">✓</span>
                            <span>Celular no peito</span>
                        </div>
                        <div className="flex items-start gap-2 col-span-2 md:col-span-3">
                            <span className="text-white font-bold flex-shrink-0">💡</span>
                            <span>Melhor resultado: peça para o vendedor tirar a foto</span>
                        </div>
                    </div>
                </div>

                {/* Conteúdo central */}
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <p className="text-gray-700 mb-6 text-lg">Clique abaixo para abrir a câmera e capturar sua foto</p>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('[GuestBodyCapture] ===== BOTÃO CLICADO =====');
                                console.log('[GuestBodyCapture] showCamera no moment do click:', showCamera);
                                console.log('[GuestBodyCapture] onShowCameraChange type:', typeof onShowCameraChange);
                                if (onShowCameraChange) {
                                    console.log('[GuestBodyCapture] Executando onShowCameraChange(true)...');
                                    onShowCameraChange(true);
                                    console.log('[GuestBodyCapture] onShowCameraChange(true) foi executado');
                                } else {
                                    console.error('[GuestBodyCapture] ERRO: onShowCameraChange é undefined!');
                                }
                            }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-md text-lg mb-3 w-full"
                        >
                            📷 Abrir Câmera
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Câmera aberta
    console.log('[GuestBodyCapture] Renderizando câmera'); // ✅ DEBUG
    return (
        <div className="w-full h-screen flex flex-col bg-gray-100">
            {/* Instruções no topo - espaço reduzido */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex-shrink-0 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold">📸 Pronto para tirar a foto?</h2>
                </div>
                <button
                    onClick={handleCancel}
                    className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex-shrink-0 ml-4"
                    title="Cancelar captura de foto"
                >
                    ✕
                </button>
            </div>

            {/* Câmera */}
            <div className="flex-1 overflow-hidden">
                <CameraCaptureScreen
                    profile={guestProfile}
                    onMeasurementsCaptured={handleCameraMeasurements}
                    onClose={handleCancel}
                    skipOnboarding={true}
                />
            </div>
        </div>
    );
};

export default GuestBodyCaptureScreen;

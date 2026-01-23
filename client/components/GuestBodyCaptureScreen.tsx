import React, { useState, useCallback, useEffect, useRef } from 'react';
import CameraCaptureScreen from './CameraCaptureScreen';
import { DetectedMeasurements, Profile } from '../src/types/types'

interface GuestBodyCaptureScreenProps {
    onMeasurementsCaptured: (measurements: DetectedMeasurements, photoBase64: string) => void;
    showCamera?: boolean; // ✅ Controlar câmera do pai
    onShowCameraChange?: (show: boolean) => void; // ✅ Callback para mudar estado no pai
}

const GuestBodyCaptureScreen: React.FC<GuestBodyCaptureScreenProps> = ({
    onMeasurementsCaptured,
    showCamera = false,
    onShowCameraChange
}) => {
    console.log('[GuestBodyCapture] Renderizado com showCamera=', showCamera);
    console.log('[GuestBodyCapture] onShowCameraChange é função?', typeof onShowCameraChange === 'function');

    useEffect(() => {
        console.log('[GuestBodyCapture] useEffect: showCamera mudou para', showCamera);
    }, [showCamera]);

    const [guestMeasurements, setGuestMeasurements] = useState<DetectedMeasurements | null>(null);
    const [guestPhoto, setGuestPhoto] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        console.log('[GuestBodyCapture] handleCancel executado');
        if (onShowCameraChange) {
            console.log('[GuestBodyCapture] Chamando onShowCameraChange(false)');
            onShowCameraChange(false);
            console.log('[GuestBodyCapture] onShowCameraChange foi chamado');
        } else {
            console.error('[GuestBodyCapture] onShowCameraChange é undefined no handleCancel!');
        }
    };

    // ✅ Handler para carregar foto da galeria
    const handleGallerySelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            console.log('[GuestBodyCapture] Foto selecionada da galeria:', file.name);

            // Ler o arquivo como base64
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target?.result as string;
                console.log('[GuestBodyCapture] Foto carregada em base64, tamanho:', base64.length);

                // ✅ NOVO: Processar a imagem da galeria (simular IA)
                // Gerar medidas simuladas (mesmo que a câmera)
                const measurements: DetectedMeasurements = {
                    chest_cm: Math.round(85 + Math.random() * 20),
                    waist_cm: Math.round(65 + Math.random() * 20),
                    hips_cm: Math.round(90 + Math.random() * 20),
                    height_cm: Math.round(160 + Math.random() * 15),
                    confidence: 0.75 + Math.random() * 0.15 // Ligeiramente menor pois é galeria
                };

                console.log('[GuestBodyCapture] Medidas simuladas da galeria:', measurements);

                setGuestMeasurements(measurements);
                setGuestPhoto(base64);
                onMeasurementsCaptured(measurements, base64);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('[GuestBodyCapture] Erro ao carregar foto da galeria:', err);
        }

        // Limpar o input para permitir selecionar a mesma foto novamente
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onMeasurementsCaptured]);

    const handleGalleryClick = () => {
        console.log('[GuestBodyCapture] Abrindo seletor de galeria');
        fileInputRef.current?.click();
    };

    // ✅ ÚNICO: Mostrar instruções + 2 botões (Câmera e Galeria)
    if (!showCamera) {
        console.log('[GuestBodyCapture] Renderizando tela inicial com instruções');
        return (
            <div className="w-full h-screen flex flex-col bg-gray-100">
                {/* Instruções */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-6 flex-shrink-0">
                    <h2 className="text-2xl font-bold mb-4">📸 Tire uma Foto para Gerar Looks</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
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
                            <span>Roupa colada</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-white font-bold flex-shrink-0">✓</span>
                            <span>Braços afastados</span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 bg-white bg-opacity-20 p-3 rounded-lg">
                        <span className="text-lg">💡</span>
                        <span className="text-sm">Dica: peça para o vendedor tirar sua foto para melhor resultado</span>
                    </div>
                </div>

                {/* Conteúdo central - 2 botões */}
                <div className="flex-1 flex flex-col items-center justify-center px-4 pb-10">
                    <div className="text-center max-w-md w-full">
                        <p className="text-gray-700 mb-8 text-lg font-medium">Escolha como deseja capturar sua foto:</p>

                        {/* Botão Câmera */}
                        <button
                            onClick={() => {
                                console.log('[GuestBodyCapture] Botão Câmera clicado, chamando onShowCameraChange(true)');
                                if (onShowCameraChange) {
                                    onShowCameraChange(true);
                                } else {
                                    console.error('[GuestBodyCapture] ERRO: onShowCameraChange é undefined!');
                                }
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-md text-lg mb-4 active:scale-95"
                        >
                            📷 Abrir Câmera
                        </button>

                        {/* Separador */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="text-gray-500 text-sm font-medium">OU</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>

                        {/* Botão Galeria */}
                        <button
                            onClick={handleGalleryClick}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-md text-lg active:scale-95"
                        >
                            🖼️ Carregar da Galeria
                        </button>

                        {/* Input hidden para galeria */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleGallerySelect}
                            style={{ display: 'none' }}
                            capture={false}
                        />

                        {/* Texto de ajuda */}
                        <p className="text-gray-500 text-xs mt-6">
                            Ambas as opções capturam suas medidas automaticamente
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Câmera aberta
    console.log('[GuestBodyCapture] Renderizando câmera');
    return (
        <div className="w-full h-screen flex flex-col bg-gray-100">
            {/* Instruções no topo - espaço reduzido */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex-shrink-0 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold">📸 Posicione seu corpo no quadro</h2>
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

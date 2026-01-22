import React, { useState, useCallback } from 'react';
import CameraCaptureScreen from './CameraCaptureScreen';
import { DetectedMeasurements, Profile } from '../src/types/types'

interface GuestBodyCaptureScreenProps {
    onMeasurementsCaptured: (measurements: DetectedMeasurements, photoBase64: string) => void;
}

const GuestBodyCaptureScreen: React.FC<GuestBodyCaptureScreenProps> = ({ onMeasurementsCaptured }) => {
    const [showCamera, setShowCamera] = useState(false);
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
            setShowCamera(false);
            // Passar para o pai (LooksPage)
            onMeasurementsCaptured(measurements, photoBase64);
        },
        [onMeasurementsCaptured]
    );

    // Se está capturando, mostrar o CameraCaptureScreen
    if (showCamera) {
        return (
            <div className="fixed inset-0 w-full h-full z-50 bg-black">
                <CameraCaptureScreen
                    profile={guestProfile}
                    onMeasurementsCaptured={handleCameraMeasurements}
                    onClose={() => setShowCamera(false)}
                />
            </div>
        );
    }

    // Se não tem medidas ainda, mostrar onboarding
    if (!guestMeasurements || !guestPhoto) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center mt-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md">
                <div className="mb-6">
                    <div className="text-7xl mb-4">📸</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Capture Seu Corpo</h2>
                    <p className="text-lg text-gray-600 mb-2">
                        Para que a IA possa gerar looks que valorizem seu corpo,
                    </p>
                    <p className="text-lg text-gray-600 mb-8">
                        precisamos de uma foto de corpo inteiro e suas medidas.
                    </p>
                </div>

                <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">O que faremos:</h3>
                    <ul className="text-left max-w-md mx-auto space-y-3">
                        <li className="flex items-center text-gray-700">
                            <span className="text-green-500 mr-3 text-xl">✓</span>
                            Tiraremos uma foto de corpo inteiro
                        </li>
                        <li className="flex items-center text-gray-700">
                            <span className="text-green-500 mr-3 text-xl">✓</span>
                            A IA detectará suas medidas automaticamente
                        </li>
                        <li className="flex items-center text-gray-700">
                            <span className="text-green-500 mr-3 text-xl">✓</span>
                            Você poderá ajustar os valores se necessário
                        </li>
                        <li className="flex items-center text-gray-700">
                            <span className="text-green-500 mr-3 text-xl">✓</span>
                            Seus dados não serão salvos, apenas usados nesta sessão
                        </li>
                    </ul>
                </div>

                <button
                    onClick={() => setShowCamera(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-md text-lg"
                >
                    Abrir Câmera Agora
                </button>

                <p className="text-sm text-gray-500 mt-6">
                    💡 Dica: Fique em pé, de frente para a câmera, com roupa colada ao corpo para melhores resultados.
                </p>
            </div>
        );
    }

    // Se já tem medidas, mostrar confirmação
    return (
        <div className="max-w-4xl mx-auto p-8 text-center mt-10 bg-green-50 rounded-lg shadow-md">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-green-900 mb-2">Pronto para Gerar Looks!</h2>
            <p className="text-gray-700 mb-6">Suas medidas foram capturadas com sucesso.</p>

            <div className="bg-white rounded-lg p-6 mb-8 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Suas Medidas Detectadas:</h3>
                <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Busto</p>
                        <p className="text-xl font-bold text-gray-900">{guestMeasurements.chest_cm} cm</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Cintura</p>
                        <p className="text-xl font-bold text-gray-900">{guestMeasurements.waist_cm} cm</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Quadril</p>
                        <p className="text-xl font-bold text-gray-900">{guestMeasurements.hips_cm} cm</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Altura</p>
                        <p className="text-xl font-bold text-gray-900">{guestMeasurements.height_cm} cm</p>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setShowCamera(true)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition mr-4"
            >
                Tirar Foto Novamente
            </button>

            <p className="text-sm text-gray-500 mt-6">
                Os dados capturados são apenas para esta sessão e não serão salvos.
            </p>
        </div>
    );
};

export default GuestBodyCaptureScreen;

import React from 'react';
import CameraCaptureScreen from '../camera/CameraCaptureScreen';

interface CameraModalProps {
    isOpen: boolean;
    profile: {
        name: string;
        style_preferences: string[];
        body_shape: string;
        body_measurements: {
            chest_cm: number;
            waist_cm: number;
            hips_cm: number;
            height_cm: number;
        };
        photo_base64: string;
    };
    onMeasurementsCaptured: (measurements: any) => void;
    onClose: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
    isOpen,
    profile,
    onMeasurementsCaptured,
    onClose
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            style={{ width: '100%', height: '100%' }}
        >
            <div
                className="w-full h-full sm:h-auto bg-white rounded-lg overflow-hidden flex flex-col"
                style={{ maxWidth: '1200px', maxHeight: '90vh' }}
            >
                <CameraCaptureScreen
                    profile={profile}
                    onMeasurementsCaptured={onMeasurementsCaptured}
                    onClose={onClose}
                />
            </div>
        </div>
    );
};

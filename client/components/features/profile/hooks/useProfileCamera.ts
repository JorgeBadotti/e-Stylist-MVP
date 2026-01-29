import { useState } from 'react';

interface UseProfileCameraReturn {
    showCamera: boolean;
    openCamera: () => void;
    closeCamera: () => void;
    toggleCamera: () => void;
}

export const useProfileCamera = (): UseProfileCameraReturn => {
    const [showCamera, setShowCamera] = useState(false);

    const openCamera = () => setShowCamera(true);
    const closeCamera = () => setShowCamera(false);
    const toggleCamera = () => setShowCamera(prev => !prev);

    return { showCamera, openCamera, closeCamera, toggleCamera };
};

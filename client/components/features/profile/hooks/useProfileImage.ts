import { useState } from 'react';

interface UseProfileImageReturn {
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>, onPhotoCapture: (base64: string) => void) => Promise<void>;
    isProcessing: boolean;
}

export const useProfileImage = (): UseProfileImageReturn => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        onPhotoCapture: (base64: string) => void
    ): Promise<void> => {
        const file = e.target.files?.[0];
        if (file) {
            // Verifica tamanho (ex: max 5MB para não travar o envio string)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('A imagem deve ter no máximo 5MB.');
            }

            setIsProcessing(true);
            try {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64String = reader.result as string;
                    onPhotoCapture(base64String);
                };
                reader.readAsDataURL(file);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return { handleImageChange, isProcessing };
};

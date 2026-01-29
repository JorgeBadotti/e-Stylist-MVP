import React from 'react';

interface FormFotoCorpoProps {
    fotoCorpo?: string;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCameraClick: () => void;
}

export const FormFotoCorpo: React.FC<FormFotoCorpoProps> = ({
    fotoCorpo,
    onImageChange,
    onCameraClick
}) => {
    return (
        <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">📸 Foto de Corpo Inteiro</h3>
            <div className="flex flex-col items-center gap-4">
                {/* Preview da Imagem */}
                <div className="w-40 h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
                    {fotoCorpo ? (
                        <img
                            src={fotoCorpo}
                            alt="Preview"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Título */}
                <h4 className="text-base font-semibold text-gray-800">Editar foto</h4>

                {/* Botões lado a lado */}
                <div className="flex gap-3 justify-center w-full max-w-md">
                    {/* Botão Galeria */}
                    <label className="flex-1 relative inline-flex cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onImageChange}
                            className="sr-only"
                        />
                        <button
                            type="button"
                            onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Galeria
                        </button>
                    </label>

                    {/* Botão Câmera */}
                    <button
                        type="button"
                        onClick={onCameraClick}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Câmera
                    </button>
                </div>
            </div>
        </div>
    );
};

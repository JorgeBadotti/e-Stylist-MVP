import React, { useRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeModalProps {
    isOpen: boolean;
    produtoUrl: string;
    produtoNome: string;
    produtoSku: string;
    onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
    isOpen,
    produtoUrl,
    produtoNome,
    produtoSku,
    onClose,
}) => {
    const qrRef = useRef<HTMLDivElement>(null);
    const qrInstanceRef = useRef<QRCodeStyling | null>(null);

    useEffect(() => {
        if (isOpen && !qrInstanceRef.current) {
            qrInstanceRef.current = new QRCodeStyling({
                width: 256,
                height: 256,
                data: produtoUrl,
                image: '',
                margin: 10,
                qrOptions: {
                    typeNumber: 0,
                    mode: 'Byte',
                    errorCorrectionLevel: 'H',
                },
                imageOptions: {
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 0,
                },
                dotsOptions: {
                    color: '#000000',
                    type: 'rounded',
                },
                backgroundOptions: {
                    color: '#ffffff',
                },
            });

            if (qrRef.current) {
                qrRef.current.innerHTML = '';
                qrInstanceRef.current.append(qrRef.current);
            }
        }
    }, [isOpen, produtoUrl]);

    if (!isOpen) return null;

    const handlePrint = () => {
        if (!qrRef.current) return;

        // Obter o canvas do QR code
        const canvas = qrRef.current.querySelector('canvas') as HTMLCanvasElement | null;
        if (!canvas) {
            console.error('QR Code canvas não encontrado');
            return;
        }

        // Converter para data URL
        const qrImageUrl = canvas.toDataURL('image/png');

        // HTML otimizado para impressão de etiqueta
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>QR Code - ${produtoNome}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                    }
                    
                    body {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: white;
                        font-family: Arial, sans-serif;
                    }
                    
                    .etiqueta {
                        text-align: center;
                        padding: 20px;
                        max-width: 350px;
                    }
                    
                    .qr-img {
                        width: 280px;
                        height: 280px;
                        margin: 10px auto;
                        display: block;
                    }
                    
                    .nome {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 10px 0 5px 0;
                        word-wrap: break-word;
                    }
                    
                    .sku {
                        font-size: 10px;
                        color: #666;
                        font-family: monospace;
                        margin-bottom: 5px;
                    }
                    
                    .url {
                        font-size: 9px;
                        color: #999;
                        word-wrap: break-word;
                        margin-top: 8px;
                    }
                    
                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                        }
                        .etiqueta {
                            padding: 10px;
                            page-break-after: always;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="etiqueta">
                    <img src="${qrImageUrl}" alt="QR Code" class="qr-img" />
                    <div class="nome">${produtoNome}</div>
                    <div class="sku">SKU: ${produtoSku}</div>
                    <div class="url">${produtoUrl}</div>
                </div>
            </body>
            </html>
        `;

        // Abrir nova janela e imprimir
        const printWindow = window.open('', '', 'width=600,height=800');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Aguardar o carregamento da imagem antes de imprimir
            printWindow.onload = () => {
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            };
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">QR Code do Produto</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div
                    ref={qrRef}
                    className="bg-gray-50 p-6 rounded-lg flex justify-center mb-6"
                />

                <div className="mb-6 text-center">
                    <p className="text-gray-700 font-semibold mb-2">{produtoNome}</p>
                    <p className="text-sm text-gray-500 font-mono">{produtoSku}</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handlePrint}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                            />
                        </svg>
                        Imprimir (Ctrl + P)
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;

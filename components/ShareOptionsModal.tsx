import React, { useState, useCallback } from 'react';
import { Look, ShareScope } from '../types';
import Button from './Button';
import { eStylistService, trackEvent } from '../services/eStylistService'; // NOVO: trackEvent importado
import Alert from './Alert';

interface ShareOptionsModalProps {
  look: Look;
  onClose: () => void;
}

const ShareOptionsModal: React.FC<ShareOptionsModalProps> = ({ look, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const getFullTextContent = useCallback((generatedShareUrl: string) => {
    const itemsText = (look.items || [])
      .map((i) => `• ${i.name}${i.source === 'store' ? ' (Loja)' : ''}`)
      .join('\n');

    const links = (look.items || [])
      .filter((i) => i.can_purchase && i.product_url)
      .map((i) => i.product_url)
      .join('\n');

    return `
✨ Look: ${look.title} ✨

Formalidade: ${look.formalidade_calculada}

Itens:
${itemsText}

Por que funciona:
${look.why_it_works}

${links ? `🛍️ Comprar:\n${links}` : ''}

🔗 Veja o look completo no e-Stylist: ${generatedShareUrl}
    `.trim();
  }, [look]);

  const handlePublicShare = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedShareUrl = await eStylistService.createShareLink(look, 'public');
      setShareUrl(generatedShareUrl);

      const fullTextContent = getFullTextContent(generatedShareUrl);

      if (navigator.share) {
        trackEvent('share_public_web_share_api_attempt', { lookId: look.look_id });
        await navigator.share({
          title: `Look e-Stylist – ${look.title}`,
          text: fullTextContent,
          url: generatedShareUrl,
        });
        trackEvent('share_public_web_share_api_success', { lookId: look.look_id });
        onClose();
      } else {
        trackEvent('share_public_clipboard_fallback', { lookId: look.look_id });
        await navigator.clipboard.writeText(fullTextContent);
        alert('Link do look e detalhes copiados para a área de transferência!');
        trackEvent('share_public_clipboard_success', { lookId: look.look_id });
      }
    } catch (err: any) {
      console.error('Erro ao compartilhar publicamente:', err);
      setError(`Falha ao compartilhar: ${err.message || 'Erro desconhecido'}`);
      trackEvent('share_public_failed', { lookId: look.look_id, error: err.message });
    } finally {
      setLoading(false);
    }
  }, [look, onClose, getFullTextContent]);

  const handleWhatsappShare = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedShareUrl = await eStylistService.createShareLink(look, 'private');
      setShareUrl(generatedShareUrl);

      const fullTextContent = getFullTextContent(generatedShareUrl);
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(fullTextContent)}`;
      window.open(whatsappUrl, '_blank');
      trackEvent('share_private_whatsapp_opened', { lookId: look.look_id });
      onClose();
    } catch (err: any) {
      console.error('Erro ao compartilhar via WhatsApp:', err);
      setError(`Falha ao abrir WhatsApp: ${err.message || 'Erro desconhecido'}`);
      trackEvent('share_private_whatsapp_failed', { lookId: look.look_id, error: err.message });
    } finally {
      setLoading(false);
    }
  }, [look, onClose, getFullTextContent]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Compartilhar Look</h2>
        <p className="text-gray-600 mb-6 text-center">
          Escolha como você quer compartilhar o look "{look.title}".
        </p>

        {error && <Alert type="error" message={error} className="mb-4" />}

        <div className="space-y-4">
          <Button
            onClick={handlePublicShare}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Gerando link...' : 'Compartilhar Público'}
          </Button>
          <Button
            onClick={handleWhatsappShare}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            {loading ? 'Gerando link...' : 'Enviar no WhatsApp (Privado)'}
          </Button>
        </div>

        {shareUrl && (
          <div className="mt-6 p-3 bg-gray-100 rounded-md text-sm text-gray-700 break-words">
            <p className="font-semibold mb-1">Link Gerado (temporário):</p>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {shareUrl}
            </a>
          </div>
        )}

        <Button
          onClick={onClose}
          className="mt-6 w-full bg-gray-300 hover:bg-gray-400 text-gray-800"
          disabled={loading}
        >
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default ShareOptionsModal;
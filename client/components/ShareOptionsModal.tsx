import React, { useState, useCallback } from 'react';
import { Look, ShareScope, Profile } from '../types';
import Button from './Button';
import { eStylistService } from '../services/eStylistService';
import Alert from './Alert';

interface ShareOptionsModalProps {
  look: Look;
  profile: Profile; // Accepts the user's profile
  onClose: () => void;
}

const ShareOptionsModal: React.FC<ShareOptionsModalProps> = ({ look, profile, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [scope, setScope] = useState<ShareScope>('public');

  const createShare = useCallback(async () => {
    setError(null);
    setLoading(true);
    setShareUrl(null);
    try {
      const url = await eStylistService.createShareLink(look, profile, scope);
      setShareUrl(url);
    } catch (err: any) {
      console.error('Failed to create share link', err);
      setError(err.message || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  }, [look, profile, scope]);

  const copyToClipboard = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  }, [shareUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Compartilhar look</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">Fechar</button>
        </div>

        {error && <Alert message={error} type="error" className="mb-4" />}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Escopo</label>
          <div className="flex gap-3">
            <label className="inline-flex items-center">
              <input type="radio" name="scope" value="public" checked={scope === 'public'} onChange={() => setScope('public')} className="mr-2" />
              Público
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="scope" value="private" checked={scope === 'private'} onChange={() => setScope('private')} className="mr-2" />
              Privado
            </label>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <Button onClick={createShare} disabled={loading}>{loading ? 'Gerando...' : 'Gerar link'}</Button>
          <Button onClick={onClose} className="bg-gray-200 text-gray-800">Cancelar</Button>
        </div>

        {shareUrl && (
          <div className="mt-4">
            <p className="text-sm break-all">{shareUrl}</p>
            <div className="flex gap-3 mt-3">
              <Button onClick={copyToClipboard}>Copiar link</Button>
              <a href={shareUrl} target="_blank" rel="noreferrer">
                <Button className="bg-green-600">Abrir link</Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareOptionsModal;
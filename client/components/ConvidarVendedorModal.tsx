import React, { useState } from 'react';
import { enviarConvite } from '../src/services/conviteService';
import './ConvidarVendedorModal.css';

interface ConvidarVendedorModalProps {
  lojaId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConvidarVendedorModal({
  lojaId,
  isOpen,
  onClose,
  onSuccess,
}: ConvidarVendedorModalProps) {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Por favor, insira um email');
      return;
    }

    setLoading(true);
    try {
      await enviarConvite(lojaId, email.trim(), mensagem.trim() || undefined);
      setSuccess('✅ Convite enviado com sucesso!');
      setEmail('');
      setMensagem('');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao enviar convite';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 Convidar Vendedor</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email do Vendedor *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendedor@example.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mensagem">Mensagem (opcional)</label>
            <textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Deixe uma mensagem pessoal..."
              rows={4}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !email.trim()}
            >
              {loading ? '⏳ Enviando...' : '📧 Enviar Convite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

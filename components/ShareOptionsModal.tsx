import React, { useState, useCallback } from 'react';
import { Look, ShareScope, Profile } from '../types';
import Button from './Button';
import { eStylistService } from '../services/eStylistService';
import Alert from './Alert';

interface ShareOptionsModalProps {
  look: Look;
  profile: Profile; // NOVO: Aceita o perfil do usuário
  onClose: () => void;
}

const ShareOptionsModal: React.FC<ShareOptionsModalProps> = ({ look, profile, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const getFullTextContent = useCallback((generatedShareUrl: string, scope: ShareScope) => {
    // Tenta encontrar a peça de loja com recomendação de tamanho para o WhatsApp
    const featuredStoreItem = look.items.find(
      (item) => item.source === 'store' && item.size_recommendation && item.brand_name && item.fit_model && item.fabric
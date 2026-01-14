// src/components/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import api from '../src/services/api';

interface Medidas {
    busto: number;
    cintura: number;
    quadril: number;
    altura: number;
}

interface UserProfileData {
    nome: string;
    email: string;
    foto?: string;
    foto_corpo?: string;
    tipo_corpo?: string;
    estilo_pessoal?: string;
    medidas: Medidas;
}

const ProfilePage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Estado do Formulário
    const [formData, setFormData] = useState<UserProfileData>({
        nome: '',
        email: '',
        foto_corpo: '',
        tipo_corpo: '',
        estilo_pessoal: '',
        medidas: { busto: 0, cintura: 0, quadril: 0, altura: 0 }
    });

    // 1. Carregar dados ao montar a tela
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/usuario/perfil');
                const user = response.data;

                // Debug para verificar o que está vindo do backend
                console.log("Dados do usuário recebidos:", user);

                setFormData({
                    // Se user.nome for undefined/null, usa string vazia para permitir edição
                    nome: user.nome || '',
                    email: user.email || '',
                    foto_corpo: user.foto_corpo || '',
                    tipo_corpo: user.tipo_corpo || '',
                    estilo_pessoal: user.estilo_pessoal || '',
                    medidas: {
                        busto: user.medidas?.busto || 0,
                        cintura: user.medidas?.cintura || 0,
                        quadril: user.medidas?.quadril || 0,
                        altura: user.medidas?.altura || 0,
                    }
                });
            } catch (error) {
                console.error("Erro ao carregar perfil", error);
                setMessage({ type: 'error', text: 'Falha ao carregar dados do usuário.' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // 2. Manipular mudanças nos inputs de texto/select
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (['busto', 'cintura', 'quadril', 'altura'].includes(name)) {
            setFormData(prev => ({
                ...prev,
                medidas: {
                    ...prev.medidas,
                    [name]: Number(value)
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // 3. Manipular Upload de Imagem (Converte para Base64)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Verifica tamanho (ex: max 5MB para não travar o envio string)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB.' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                // O resultado é uma string longa: "data:image/jpeg;base64,..."
                setFormData(prev => ({ ...prev, foto_corpo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // 4. Salvar alterações
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            // Nota: Enviando 'nome' também para atualizar caso esteja vazio
            const payload = {
                nome: formData.nome,
                busto: formData.medidas.busto,
                cintura: formData.medidas.cintura,
                quadril: formData.medidas.quadril,
                altura: formData.medidas.altura,
                tipo_corpo: formData.tipo_corpo,
                estilo_pessoal: formData.estilo_pessoal,
                foto_corpo: formData.foto_corpo
            };

            // Você precisará garantir que seu Controller backend aceite atualizar o 'nome' também,
            // ou adicionar essa lógica lá se ainda não tiver.
            await api.put('/api/usuario/medidas', payload);

            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (error) {
            console.error("Erro ao salvar", error);
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil. Tente novamente.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando perfil...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil de Estilo</h2>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Seção Dados Básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        {/* Removido 'disabled' para você poder corrigir o nome se estiver vazio */}
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="text"
                            value={formData.email}
                            disabled
                            className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm p-2 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Medidas Corporais (em cm)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Busto/Peitoral</label>
                            <input
                                type="number"
                                name="busto"
                                value={formData.medidas.busto}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cintura</label>
                            <input
                                type="number"
                                name="cintura"
                                value={formData.medidas.cintura}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quadril</label>
                            <input
                                type="number"
                                name="quadril"
                                value={formData.medidas.quadril}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Altura</label>
                            <input
                                type="number"
                                name="altura"
                                value={formData.medidas.altura}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Análise de Estilo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo de Corpo</label>
                            <select
                                name="tipo_corpo"
                                value={formData.tipo_corpo}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                            >
                                <option value="">Selecione...</option>
                                <option value="ampulheta">Ampulheta</option>
                                <option value="retangulo">Retângulo</option>
                                <option value="pera">Pêra / Triângulo</option>
                                <option value="maca">Maçã / Oval</option>
                                <option value="triangulo-invertido">Triângulo Invertido</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estilo Pessoal</label>
                            <input
                                type="text"
                                name="estilo_pessoal"
                                placeholder="Ex: Casual, Esportivo, Clássico..."
                                value={formData.estilo_pessoal}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>

                    {/* --- ÁREA DE FOTO COM SUPORTE A CÂMERA --- */}
                    <div className="mt-6 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Corpo Inteiro</label>

                        <div className="flex items-center space-x-4">
                            {/* Visualização da imagem (Preview) */}
                            <div className="h-32 w-24 bg-gray-200 rounded overflow-hidden flex-shrink-0 border border-gray-300">
                                {formData.foto_corpo ? (
                                    <img
                                        src={formData.foto_corpo}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 inline-block w-full text-center sm:w-auto">
                                    <span>Tirar Foto ou Escolher Arquivo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="sr-only"
                                    />
                                </label>
                                <p className="text-xs text-gray-500 mt-2">
                                    No celular, isso abrirá a opção de Câmera. No computador, abrirá seus arquivos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-6 py-2 rounded-md text-white font-medium ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
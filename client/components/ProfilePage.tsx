// src/components/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import api from '../src/services/api';

interface Medidas {
    busto: number;
    cintura: number;
    quadril: number;
    altura: number;
    pescoco?: number;
    ombro?: number;
    braco?: number;
    antebraco?: number;
    pulso?: number;
    torax?: number;
    sobpeito?: number;
    costelas?: number;
    panturrilha?: number;
    coxa?: number;
    tornozelo?: number;
    comprimento_torso?: number;
    comprimento_perna?: number;
    comprimento_braco?: number;
}

interface Proporcoes {
    pernas?: string;
    torso?: string;
    ombros_vs_quadril?: string;
    confidence?: number;
}

interface UserProfileData {
    nome: string;
    email: string;
    cpf?: string;
    sexo?: string;
    foto?: string;
    foto_corpo?: string;
    tipo_corpo?: string;
    altura_cm?: number;
    estilo_pessoal?: string;
    medidas: Medidas;
    proporcoes?: Proporcoes;
}

const ProfilePage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Estado do Formulário
    const [formData, setFormData] = useState<UserProfileData>({
        nome: '',
        email: '',
        cpf: '',
        sexo: '',
        foto_corpo: '',
        tipo_corpo: '',
        altura_cm: 0,
        estilo_pessoal: '',
        medidas: {
            busto: 0,
            cintura: 0,
            quadril: 0,
            altura: 0,
            pescoco: 0,
            ombro: 0,
            braco: 0,
            antebraco: 0,
            pulso: 0,
            torax: 0,
            sobpeito: 0,
            costelas: 0,
            panturrilha: 0,
            coxa: 0,
            tornozelo: 0,
            comprimento_torso: 0,
            comprimento_perna: 0,
            comprimento_braco: 0
        },
        proporcoes: {
            pernas: '',
            torso: '',
            ombros_vs_quadril: '',
            confidence: 0
        }
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
                    nome: user.nome || '',
                    email: user.email || '',
                    cpf: user.cpf || '',
                    sexo: user.sexo || '',
                    foto_corpo: user.foto_corpo || '',
                    tipo_corpo: user.tipo_corpo || '',
                    altura_cm: user.altura_cm || 0,
                    estilo_pessoal: user.estilo_pessoal || '',
                    medidas: {
                        busto: user.medidas?.busto || 0,
                        cintura: user.medidas?.cintura || 0,
                        quadril: user.medidas?.quadril || 0,
                        altura: user.medidas?.altura || 0,
                        pescoco: user.medidas?.pescoco || 0,
                        ombro: user.medidas?.ombro || 0,
                        braco: user.medidas?.braco || 0,
                        antebraco: user.medidas?.antebraco || 0,
                        pulso: user.medidas?.pulso || 0,
                        torax: user.medidas?.torax || 0,
                        sobpeito: user.medidas?.sobpeito || 0,
                        costelas: user.medidas?.costelas || 0,
                        panturrilha: user.medidas?.panturrilha || 0,
                        coxa: user.medidas?.coxa || 0,
                        tornozelo: user.medidas?.tornozelo || 0,
                        comprimento_torso: user.medidas?.comprimento_torso || 0,
                        comprimento_perna: user.medidas?.comprimento_perna || 0,
                        comprimento_braco: user.medidas?.comprimento_braco || 0
                    },
                    proporcoes: {
                        pernas: user.proporcoes?.pernas || '',
                        torso: user.proporcoes?.torso || '',
                        ombros_vs_quadril: user.proporcoes?.ombros_vs_quadril || '',
                        confidence: user.proporcoes?.confidence || 0
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

        // Campos de medidas
        const camposMedidas = [
            'busto', 'cintura', 'quadril', 'altura', 'pescoco', 'ombro', 'braco',
            'antebraco', 'pulso', 'torax', 'sobpeito', 'costelas', 'panturrilha',
            'coxa', 'tornozelo', 'comprimento_torso', 'comprimento_perna', 'comprimento_braco'
        ];

        // Campos de proporções
        const camposProporcoes = ['pernas', 'torso', 'ombros_vs_quadril', 'confidence'];

        if (camposMedidas.includes(name)) {
            setFormData(prev => ({
                ...prev,
                medidas: {
                    ...prev.medidas,
                    [name]: Number(value) || 0
                }
            }));
        } else if (camposProporcoes.includes(name)) {
            setFormData(prev => ({
                ...prev,
                proporcoes: {
                    ...prev.proporcoes,
                    [name]: isNaN(Number(value)) ? value : Number(value)
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
            const payload = {
                nome: formData.nome,
                cpf: formData.cpf,
                sexo: formData.sexo,
                altura_cm: formData.altura_cm,
                tipo_corpo: formData.tipo_corpo,
                estilo_pessoal: formData.estilo_pessoal,
                foto_corpo: formData.foto_corpo,
                medidas: {
                    busto: formData.medidas.busto,
                    cintura: formData.medidas.cintura,
                    quadril: formData.medidas.quadril,
                    altura: formData.medidas.altura,
                    pescoco: formData.medidas.pescoco,
                    ombro: formData.medidas.ombro,
                    braco: formData.medidas.braco,
                    antebraco: formData.medidas.antebraco,
                    pulso: formData.medidas.pulso,
                    torax: formData.medidas.torax,
                    sobpeito: formData.medidas.sobpeito,
                    costelas: formData.medidas.costelas,
                    panturrilha: formData.medidas.panturrilha,
                    coxa: formData.medidas.coxa,
                    tornozelo: formData.medidas.tornozelo,
                    comprimento_torso: formData.medidas.comprimento_torso,
                    comprimento_perna: formData.medidas.comprimento_perna,
                    comprimento_braco: formData.medidas.comprimento_braco
                },
                proporcoes: {
                    pernas: formData.proporcoes?.pernas,
                    torso: formData.proporcoes?.torso,
                    ombros_vs_quadril: formData.proporcoes?.ombros_vs_quadril,
                    confidence: formData.proporcoes?.confidence
                }
            };

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
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CPF <span className="text-gray-500 text-xs">(opcional)</span></label>
                        <input
                            type="text"
                            name="cpf"
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sexo</label>
                        <select
                            name="sexo"
                            value={formData.sexo}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                        >
                            <option value="">Selecione...</option>
                            <option value="feminino">Feminino</option>
                            <option value="masculino">Masculino</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                </div>

                {/* Seção Foto de Corpo Inteiro */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📸 Foto de Corpo Inteiro</h3>
                    <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
                            {/* Visualização da imagem (Preview) */}
                            <div className="h-48 w-36 bg-gray-200 rounded overflow-hidden flex-shrink-0 border border-gray-300">
                                {formData.foto_corpo ? (
                                    <img
                                        src={formData.foto_corpo}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Botões de upload */}
                            <div className="flex flex-col space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Enviar Foto</label>
                                <div className="flex flex-col space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100 cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-500">JPG, PNG (máx 5MB)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção Medidas Básicas */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        📏 Medidas Corporais Básicas <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                            <input
                                type="number"
                                name="altura"
                                value={formData.medidas.altura}
                                onChange={handleChange}
                                placeholder="Ex: 165"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Busto (cm)</label>
                            <input
                                type="number"
                                name="busto"
                                value={formData.medidas.busto}
                                onChange={handleChange}
                                placeholder="Ex: 92"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cintura (cm)</label>
                            <input
                                type="number"
                                name="cintura"
                                value={formData.medidas.cintura}
                                onChange={handleChange}
                                placeholder="Ex: 75"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quadril (cm)</label>
                            <input
                                type="number"
                                name="quadril"
                                value={formData.medidas.quadril}
                                onChange={handleChange}
                                placeholder="Ex: 95"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Seção Medidas Superiores */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        👕 Medidas da Parte Superior <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pescoço (cm)</label>
                            <input
                                type="number"
                                name="pescoco"
                                value={formData.medidas.pescoco || 0}
                                onChange={handleChange}
                                placeholder="Ex: 36"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ombro (cm)</label>
                            <input
                                type="number"
                                name="ombro"
                                value={formData.medidas.ombro || 0}
                                onChange={handleChange}
                                placeholder="Ex: 42"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Braço (cm)</label>
                            <input
                                type="number"
                                name="braco"
                                value={formData.medidas.braco || 0}
                                onChange={handleChange}
                                placeholder="Ex: 28"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Antebraço (cm)</label>
                            <input
                                type="number"
                                name="antebraco"
                                value={formData.medidas.antebraco || 0}
                                onChange={handleChange}
                                placeholder="Ex: 26"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pulso (cm)</label>
                            <input
                                type="number"
                                name="pulso"
                                value={formData.medidas.pulso || 0}
                                onChange={handleChange}
                                placeholder="Ex: 16"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tórax (cm)</label>
                            <input
                                type="number"
                                name="torax"
                                value={formData.medidas.torax || 0}
                                onChange={handleChange}
                                placeholder="Ex: 96"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sob Peito (cm)</label>
                            <input
                                type="number"
                                name="sobpeito"
                                value={formData.medidas.sobpeito || 0}
                                onChange={handleChange}
                                placeholder="Ex: 86"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Costelas (cm)</label>
                            <input
                                type="number"
                                name="costelas"
                                value={formData.medidas.costelas || 0}
                                onChange={handleChange}
                                placeholder="Ex: 80"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Seção Medidas Inferiores */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        👖 Medidas da Parte Inferior <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Coxa (cm)</label>
                            <input
                                type="number"
                                name="coxa"
                                value={formData.medidas.coxa || 0}
                                onChange={handleChange}
                                placeholder="Ex: 56"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Panturrilha (cm)</label>
                            <input
                                type="number"
                                name="panturrilha"
                                value={formData.medidas.panturrilha || 0}
                                onChange={handleChange}
                                placeholder="Ex: 38"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tornozelo (cm)</label>
                            <input
                                type="number"
                                name="tornozelo"
                                value={formData.medidas.tornozelo || 0}
                                onChange={handleChange}
                                placeholder="Ex: 22"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Seção Comprimentos */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        📐 Comprimentos <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Comprimento Tronco (cm)</label>
                            <input
                                type="number"
                                name="comprimento_torso"
                                value={formData.medidas.comprimento_torso || 0}
                                onChange={handleChange}
                                placeholder="Ex: 58"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Comprimento Perna (cm)</label>
                            <input
                                type="number"
                                name="comprimento_perna"
                                value={formData.medidas.comprimento_perna || 0}
                                onChange={handleChange}
                                placeholder="Ex: 85"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Comprimento Braço (cm)</label>
                            <input
                                type="number"
                                name="comprimento_braco"
                                value={formData.medidas.comprimento_braco || 0}
                                onChange={handleChange}
                                placeholder="Ex: 72"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Seção Proporções */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">⚖️ Proporções Corporais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pernas</label>
                            <select
                                name="pernas"
                                value={formData.proporcoes?.pernas || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                            >
                                <option value="">Selecione...</option>
                                <option value="curtas">Curtas</option>
                                <option value="balanced">Balanceadas</option>
                                <option value="longas">Longas</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tronco</label>
                            <select
                                name="torso"
                                value={formData.proporcoes?.torso || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                            >
                                <option value="">Selecione...</option>
                                <option value="curto">Curto</option>
                                <option value="balanced">Balanceado</option>
                                <option value="longo">Longo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ombros vs Quadril</label>
                            <select
                                name="ombros_vs_quadril"
                                value={formData.proporcoes?.ombros_vs_quadril || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                            >
                                <option value="">Selecione...</option>
                                <option value="ombros_larcos">Ombros Largos</option>
                                <option value="balanced">Balanceados</option>
                                <option value="quadril_largo">Quadril Largo</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Seção Análise de Estilo */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🎨 Análise de Estilo</h3>
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
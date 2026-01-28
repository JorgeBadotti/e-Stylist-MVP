// src/components/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import api from '../../src/services/api';
import CameraCaptureScreen from '../features/camera/CameraCaptureScreen';
import { DetectedMeasurements, Profile } from '../../src/types/types';
import { InputText } from '../ui/inputs/InputText';
import { InputNumber } from '../ui/inputs/InputNumber';
import { InputSelect } from '../ui/inputs/InputSelect';
import { InputGroup } from '../ui/InputGroup';

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
    const [showCamera, setShowCamera] = useState(false);

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

    // 3. Manipular Upload de Imagem (Converte para Base64 e Chama Análise)
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Verifica tamanho (ex: max 5MB para não travar o envio string)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB.' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;

                // ✅ CORRIGIDO: Salvar a foto base64 no formData
                setFormData(prev => ({
                    ...prev,
                    foto_corpo: base64String
                }));

                // Fazer a análise da foto
                await analisarFotoCorporal(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    // ✅ NOVO: Handler para câmera CameraCaptureScreen
    const handleCameraMeasurements = async (measurements: DetectedMeasurements, photoBase64: string) => {
        console.log('📸 [ProfilePage] Câmera: Medidas capturadas:', measurements);

        // 1. Salvar a foto e medidas no estado
        setFormData(prev => ({
            ...prev,
            foto_corpo: photoBase64,
            altura_cm: measurements.height_cm || prev.altura_cm,
            medidas: {
                ...prev.medidas,
                altura: measurements.height_cm || prev.medidas.altura,
                busto: measurements.chest_cm || prev.medidas.busto,
                cintura: measurements.waist_cm || prev.medidas.cintura,
                quadril: measurements.hips_cm || prev.medidas.quadril,
            }
        }));

        // 2. Fechar modal da câmera
        setShowCamera(false);

        // 3. Mostrar mensagem de sucesso
        setMessage({ type: 'success', text: '✅ Medidas capturadas! Clique em "Salvar Alterações" para confirmar.' });
    };

    // ✅ Função centralizada para análise de foto
    const analisarFotoCorporal = async (base64String: string) => {

        // ✅ NOVO: Chamar API describe_body assim que foto é enviada
        try {
            console.log('📸 Enviando foto para análise do corpo...');
            const response = await api.post('/api/usuario/descrever-corpo', {
                foto_base64: base64String
            });

            console.log('✅ Análise do corpo recebida:', response.data);

            const { analise } = response.data;

            console.log('📋 ============ DADOS DA ANÁLISE RECEBIDOS ============');
            console.log('Sexo:', analise.sexo);
            console.log('Altura:', analise.altura_estimada_cm);
            console.log('Tipo de Corpo:', analise.tipo_corpo);
            console.log('Medidas:', analise.medidas);
            console.log('Proporções (RAW):', analise.proporcoes);
            console.log('  - pernas:', analise.proporcoes?.pernas);
            console.log('  - torso:', analise.proporcoes?.torso);
            console.log('  - ombros_vs_quadril:', analise.proporcoes?.ombros_vs_quadril);
            console.log('  - confidence:', analise.proporcoes?.confidence);
            console.log('Confiança:', analise.confianca);
            console.log('📋 ============ FIM DOS DADOS ============');

            // Atualizar formulário com dados da análise
            setFormData(prev => {
                const novoFormData = {
                    ...prev,
                    sexo: analise.sexo || prev.sexo,
                    altura_cm: analise.altura_estimada_cm || prev.altura_cm,
                    tipo_corpo: analise.tipo_corpo || prev.tipo_corpo,
                    medidas: {
                        ...prev.medidas,
                        // Medidas básicas
                        busto: analise.medidas?.busto || prev.medidas.busto,
                        cintura: analise.medidas?.cintura || prev.medidas.cintura,
                        quadril: analise.medidas?.quadril || prev.medidas.quadril,
                        altura: analise.medidas?.altura || prev.medidas.altura,
                        // Medidas superiores
                        pescoco: analise.medidas?.pescoco || prev.medidas.pescoco || 0,
                        ombro: analise.medidas?.ombro || prev.medidas.ombro || 0,
                        braco: analise.medidas?.braco || prev.medidas.braco || 0,
                        antebraco: analise.medidas?.antebraco || prev.medidas.antebraco || 0,
                        pulso: analise.medidas?.pulso || prev.medidas.pulso || 0,
                        torax: analise.medidas?.torax || prev.medidas.torax || 0,
                        sobpeito: analise.medidas?.sobpeito || prev.medidas.sobpeito || 0,
                        costelas: analise.medidas?.costelas || prev.medidas.costelas || 0,
                        // Medidas inferiores
                        coxa: analise.medidas?.coxa || prev.medidas.coxa || 0,
                        panturrilha: analise.medidas?.panturrilha || prev.medidas.panturrilha || 0,
                        tornozelo: analise.medidas?.tornozelo || prev.medidas.tornozelo || 0,
                        // Comprimentos
                        comprimento_torso: analise.medidas?.comprimento_torso || prev.medidas.comprimento_torso || 0,
                        comprimento_perna: analise.medidas?.comprimento_perna || prev.medidas.comprimento_perna || 0,
                        comprimento_braco: analise.medidas?.comprimento_braco || prev.medidas.comprimento_braco || 0
                    },
                    proporcoes: {
                        ...prev.proporcoes,
                        pernas: analise.proporcoes?.pernas || prev.proporcoes?.pernas,
                        torso: analise.proporcoes?.torso || prev.proporcoes?.torso,
                        ombros_vs_quadril: analise.proporcoes?.ombros_vs_quadril || prev.proporcoes?.ombros_vs_quadril,
                        confidence: analise.confianca || prev.proporcoes?.confidence
                    }
                };
                console.log('📝 FormData após setFormData (proporcoes):', novoFormData.proporcoes);

                // 🔄 AUTO-SAVE: Salvar dados automaticamente após análise
                setTimeout(() => salvarDadosAnalise(novoFormData), 500);

                return novoFormData;
            });

            setMessage({
                type: 'success',
                text: `✅ Corpo analisado com sucesso! (Confiança: ${analise.confianca}%)\n${analise.descricao}`
            });

        } catch (error) {
            console.error('❌ Erro ao analisar corpo:', error);
            setMessage({
                type: 'error',
                text: 'Foto enviada, mas erro ao analisar corpo. Você pode preencher os dados manualmente.'
            });
        }
    };

    // 🔄 Função auxiliar para salvar dados da análise
    const salvarDadosAnalise = async (dadosParaSalvar: UserProfileData) => {
        try {
            console.log('💾 Salvando dados da análise no banco de dados...');
            setSaving(true);

            const payload = {
                nome: dadosParaSalvar.nome,
                cpf: dadosParaSalvar.cpf,
                sexo: dadosParaSalvar.sexo,
                altura_cm: dadosParaSalvar.altura_cm,
                tipo_corpo: dadosParaSalvar.tipo_corpo,
                estilo_pessoal: dadosParaSalvar.estilo_pessoal,
                foto_corpo: dadosParaSalvar.foto_corpo,
                medidas: {
                    busto: dadosParaSalvar.medidas.busto,
                    cintura: dadosParaSalvar.medidas.cintura,
                    quadril: dadosParaSalvar.medidas.quadril,
                    altura: dadosParaSalvar.medidas.altura,
                    pescoco: dadosParaSalvar.medidas.pescoco,
                    ombro: dadosParaSalvar.medidas.ombro,
                    braco: dadosParaSalvar.medidas.braco,
                    antebraco: dadosParaSalvar.medidas.antebraco,
                    pulso: dadosParaSalvar.medidas.pulso,
                    torax: dadosParaSalvar.medidas.torax,
                    sobpeito: dadosParaSalvar.medidas.sobpeito,
                    costelas: dadosParaSalvar.medidas.costelas,
                    panturrilha: dadosParaSalvar.medidas.panturrilha,
                    coxa: dadosParaSalvar.medidas.coxa,
                    tornozelo: dadosParaSalvar.medidas.tornozelo,
                    comprimento_torso: dadosParaSalvar.medidas.comprimento_torso,
                    comprimento_perna: dadosParaSalvar.medidas.comprimento_perna,
                    comprimento_braco: dadosParaSalvar.medidas.comprimento_braco
                },
                proporcoes: {
                    pernas: dadosParaSalvar.proporcoes?.pernas,
                    torso: dadosParaSalvar.proporcoes?.torso,
                    ombros_vs_quadril: dadosParaSalvar.proporcoes?.ombros_vs_quadril,
                    confidence: dadosParaSalvar.proporcoes?.confidence
                }
            };

            await api.put('/api/usuario/medidas', payload);
            console.log('✅ Dados salvos com sucesso!');
            setMessage({ type: 'success', text: '✅ Perfil atualizado com sucesso!' });
        } catch (error) {
            console.error("❌ Erro ao salvar análise:", error);
            setMessage({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' });
        } finally {
            setSaving(false);
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

                {/* Seção Dados Básicos - Usando Componentes Atômicos */}
                <InputGroup cols={{ mobile: 1, md: 2 }} gap="6">
                    <InputText
                        label="Nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                    />
                    <InputText
                        label="Email"
                        value={formData.email}
                        disabled
                    />
                    <InputText
                        label="CPF"
                        name="cpf"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={handleChange}
                        optional
                    />
                    <InputSelect
                        label="Sexo"
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
                        options={[
                            { value: 'feminino', label: 'Feminino' },
                            { value: 'masculino', label: 'Masculino' },
                            { value: 'outro', label: 'Outro' }
                        ]}
                    />
                </InputGroup>

                {/* Seção Foto de Corpo Inteiro */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">📸 Foto de Corpo Inteiro</h3>
                    <div className="flex flex-col items-center gap-4">
                        {/* Preview da Imagem */}
                        <div className="w-40 h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
                            {formData.foto_corpo ? (
                                <img
                                    src={formData.foto_corpo}
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
                                    onChange={handleImageChange}
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
                                onClick={() => setShowCamera(true)}
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

                {/* Seção Medidas Básicas - Usando Componentes Atômicos */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        📏 Medidas Corporais Básicas <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
                    </h3>
                    <InputGroup cols={{ mobile: 2, md: 4 }} gap="4">
                        <InputNumber
                            label="Altura (cm)"
                            name="altura"
                            value={formData.medidas.altura}
                            onChange={handleChange}
                            placeholder="Ex: 165"
                        />
                        <InputNumber
                            label="Busto (cm)"
                            name="busto"
                            value={formData.medidas.busto}
                            onChange={handleChange}
                            placeholder="Ex: 92"
                        />
                        <InputNumber
                            label="Cintura (cm)"
                            name="cintura"
                            value={formData.medidas.cintura}
                            onChange={handleChange}
                            placeholder="Ex: 75"
                        />
                        <InputNumber
                            label="Quadril (cm)"
                            name="quadril"
                            value={formData.medidas.quadril}
                            onChange={handleChange}
                            placeholder="Ex: 95"
                        />
                    </InputGroup>
                </div>

                {/* Seção Medidas Superiores - Usando Componentes Atômicos */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        👕 Medidas da Parte Superior <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
                    </h3>
                    <InputGroup cols={{ mobile: 2, md: 4 }} gap="4">
                        <InputNumber
                            label="Pescoço (cm)"
                            name="pescoco"
                            value={formData.medidas.pescoco || 0}
                            onChange={handleChange}
                            placeholder="Ex: 36"
                        />
                        <InputNumber
                            label="Ombro (cm)"
                            name="ombro"
                            value={formData.medidas.ombro || 0}
                            onChange={handleChange}
                            placeholder="Ex: 42"
                        />
                        <InputNumber
                            label="Braço (cm)"
                            name="braco"
                            value={formData.medidas.braco || 0}
                            onChange={handleChange}
                            placeholder="Ex: 28"
                        />
                        <InputNumber
                            label="Antebraço (cm)"
                            name="antebraco"
                            value={formData.medidas.antebraco || 0}
                            onChange={handleChange}
                            placeholder="Ex: 26"
                        />
                        <InputNumber
                            label="Pulso (cm)"
                            name="pulso"
                            value={formData.medidas.pulso || 0}
                            onChange={handleChange}
                            placeholder="Ex: 16"
                        />
                        <InputNumber
                            label="Tórax (cm)"
                            name="torax"
                            value={formData.medidas.torax || 0}
                            onChange={handleChange}
                            placeholder="Ex: 96"
                        />
                        <InputNumber
                            label="Sob Peito (cm)"
                            name="sobpeito"
                            value={formData.medidas.sobpeito || 0}
                            onChange={handleChange}
                            placeholder="Ex: 86"
                        />
                        <InputNumber
                            label="Costelas (cm)"
                            name="costelas"
                            value={formData.medidas.costelas || 0}
                            onChange={handleChange}
                            placeholder="Ex: 80"
                        />
                    </InputGroup>
                </div>

                {/* Seção Medidas Inferiores - Usando Componentes Atômicos */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        👖 Medidas da Parte Inferior <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
                    </h3>
                    <InputGroup cols={{ mobile: 2, md: 4 }} gap="4">
                        <InputNumber
                            label="Coxa (cm)"
                            name="coxa"
                            value={formData.medidas.coxa || 0}
                            onChange={handleChange}
                            placeholder="Ex: 56"
                        />
                        <InputNumber
                            label="Panturrilha (cm)"
                            name="panturrilha"
                            value={formData.medidas.panturrilha || 0}
                            onChange={handleChange}
                            placeholder="Ex: 38"
                        />
                        <InputNumber
                            label="Tornozelo (cm)"
                            name="tornozelo"
                            value={formData.medidas.tornozelo || 0}
                            onChange={handleChange}
                            placeholder="Ex: 22"
                        />
                    </InputGroup>
                </div>

                {/* Seção Comprimentos - Usando Componentes Atômicos */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        📐 Comprimentos <span className="text-sm font-normal text-gray-500">(todas em cm)</span>
                    </h3>
                    <InputGroup cols={{ mobile: 2, md: 3 }} gap="4">
                        <InputNumber
                            label="Comprimento Tronco (cm)"
                            name="comprimento_torso"
                            value={formData.medidas.comprimento_torso || 0}
                            onChange={handleChange}
                            placeholder="Ex: 58"
                        />
                        <InputNumber
                            label="Comprimento Perna (cm)"
                            name="comprimento_perna"
                            value={formData.medidas.comprimento_perna || 0}
                            onChange={handleChange}
                            placeholder="Ex: 85"
                        />
                        <InputNumber
                            label="Comprimento Braço (cm)"
                            name="comprimento_braco"
                            value={formData.medidas.comprimento_braco || 0}
                            onChange={handleChange}
                            placeholder="Ex: 72"
                        />
                    </InputGroup>
                </div>

                {/* Seção Proporções - Usando Componentes Atômicos */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">⚖️ Proporções Corporais</h3>
                    <InputGroup cols={{ mobile: 1, md: 2 }} gap="4">
                        <InputSelect
                            label="Pernas"
                            name="pernas"
                            value={formData.proporcoes?.pernas || ''}
                            onChange={handleChange}
                            options={[
                                { value: 'curtas', label: 'Curtas' },
                                { value: 'balanced', label: 'Balanceadas' },
                                { value: 'longas', label: 'Longas' }
                            ]}
                        />
                        <InputSelect
                            label="Tronco"
                            name="torso"
                            value={formData.proporcoes?.torso || ''}
                            onChange={handleChange}
                            options={[
                                { value: 'curto', label: 'Curto' },
                                { value: 'balanced', label: 'Balanceado' },
                                { value: 'longo', label: 'Longo' }
                            ]}
                        />
                        <InputSelect
                            label="Ombros vs Quadril"
                            name="ombros_vs_quadril"
                            value={formData.proporcoes?.ombros_vs_quadril || ''}
                            onChange={handleChange}
                            options={[
                                { value: 'ombros_largos', label: 'Ombros Largos' },
                                { value: 'balanced', label: 'Balanceados' },
                                { value: 'quadril_largo', label: 'Quadril Largo' }
                            ]}
                        />
                    </InputGroup>
                </div>

                {/* Seção Análise de Estilo - Usando Componentes Atômicos */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🎨 Análise de Estilo</h3>
                    <InputGroup cols={{ mobile: 1, md: 2 }} gap="6">
                        <InputSelect
                            label="Tipo de Corpo"
                            name="tipo_corpo"
                            value={formData.tipo_corpo}
                            onChange={handleChange}
                            options={[
                                { value: 'ampulheta', label: 'Ampulheta' },
                                { value: 'retangulo', label: 'Retângulo' },
                                { value: 'pera', label: 'Pêra / Triângulo' },
                                { value: 'maca', label: 'Maçã / Oval' },
                                { value: 'triangulo-invertido', label: 'Triângulo Invertido' }
                            ]}
                        />
                        <InputText
                            label="Estilo Pessoal"
                            name="estilo_pessoal"
                            placeholder="Ex: Casual, Esportivo, Clássico..."
                            value={formData.estilo_pessoal}
                            onChange={handleChange}
                        />
                    </InputGroup>
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

            {/* Modal Câmera - Fora da Form */}
            {showCamera && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ width: '100%', height: '100%' }}>
                    <div className="w-full h-full sm:h-auto bg-white rounded-lg overflow-hidden flex flex-col" style={{ maxWidth: '1200px', maxHeight: '90vh' }}>
                        <CameraCaptureScreen
                            profile={{
                                name: formData.nome || 'Usuário',
                                style_preferences: formData.estilo_pessoal ? [formData.estilo_pessoal] : [],
                                body_shape: formData.tipo_corpo || '',
                                body_measurements: {
                                    chest_cm: formData.medidas.busto,
                                    waist_cm: formData.medidas.cintura,
                                    hips_cm: formData.medidas.quadril,
                                    height_cm: formData.medidas.altura,
                                },
                                photo_base64: formData.foto_corpo || '',
                            }}
                            onMeasurementsCaptured={handleCameraMeasurements}
                            onClose={() => setShowCamera(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
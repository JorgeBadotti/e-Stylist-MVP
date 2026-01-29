// src/components/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import api from '../../src/services/api';
import { DetectedMeasurements } from '../../src/types/types';
import { Message } from '../features/profile/types';
import { FormDadosPessoais } from '../features/profile/FormDadosPessoais';
import { FormFotoCorpo } from '../features/profile/FormFotoCorpo';
import { FormMedidasBasicas } from '../features/profile/FormMedidasBasicas';
import { FormMedidasSuperiores } from '../features/profile/FormMedidasSuperiores';
import { FormMedidasInferiores } from '../features/profile/FormMedidasInferiores';
import { FormComprimentos } from '../features/profile/FormComprimentos';
import { FormProporcoes } from '../features/profile/FormProporcoes';
import { FormEstilo } from '../features/profile/FormEstilo';
import { CameraModal } from '../features/profile/CameraModal';
import { FormActions } from '../features/profile/FormActions';
import { mapBackendToFormData, mapAnalyzeBodyToFormData } from '../features/profile/utils/profileMapper';
import { buildProfilePayload } from '../features/profile/utils/payloadBuilder';
import { useProfileForm, useProfileImage, useProfileBodyAnalysis, useProfileCamera } from '../features/profile/hooks';

const ProfilePage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);

    // Custom Hooks - consolidam toda a lógica de estado
    const { formData, handleChange, updateFormData } = useProfileForm();
    const { handleImageChange: handleImageChangeHook } = useProfileImage();
    const { analisarFotoCorporal, salvarDadosAnalise } = useProfileBodyAnalysis();
    const { showCamera, openCamera, closeCamera } = useProfileCamera();

    // 1. Carregar dados ao montar a tela
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/usuario/perfil');
                const user = response.data;

                console.log("Dados do usuário recebidos:", user);

                const mappedData = mapBackendToFormData(user);
                updateFormData(mappedData);
            } catch (error) {
                console.error("Erro ao carregar perfil", error);
                setMessage({ type: 'error', text: 'Falha ao carregar dados do usuário.' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // 3. Manipular Upload de Imagem (Converte para Base64 e Chama Análise)
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            await handleImageChangeHook(e, async (base64String: string) => {
                // ✅ Salvar a foto base64 no formData
                const fotoAtualizada = {
                    ...formData,
                    foto_corpo: base64String
                };
                updateFormData(fotoAtualizada);

                // Fazer a análise da foto
                try {
                    const analisa = await analisarFotoCorporal(base64String);
                    if (analisa) {
                        // Usar os dados atualizados (com a foto)
                        const mappedData = mapAnalyzeBodyToFormData(analisa, fotoAtualizada);
                        const novoFormData = { ...fotoAtualizada, ...mappedData };
                        updateFormData(novoFormData);

                        // 🔄 AUTO-SAVE: Salvar dados automaticamente após análise
                        try {
                            await salvarDadosAnalise(novoFormData);
                            setMessage({
                                type: 'success',
                                text: `✅ Corpo analisado e salvo com sucesso! (Confiança: ${analisa.confianca}%)`
                            });
                        } catch (saveErr) {
                            console.error('Erro ao auto-salvar:', saveErr);
                            setMessage({
                                type: 'error',
                                text: 'Dados analisados mas erro ao salvar. Clique em "Salvar Alterações" para confirmar.'
                            });
                        }
                    }
                } catch (error) {
                    console.error('Erro ao analisar corpo:', error);
                    setMessage({
                        type: 'error',
                        text: 'Foto salva, mas erro ao analisar corpo. Você pode preencher os dados manualmente.'
                    });
                }
            });
        } catch (error) {
            setMessage({ type: 'error', text: String(error) });
        }
    };

    // ✅ NOVO: Handler para câmera CameraCaptureScreen
    const handleCameraMeasurements = async (measurements: DetectedMeasurements, photoBase64: string) => {
        console.log('📸 [ProfilePage] Câmera: Medidas capturadas:', measurements);

        // 1. Salvar a foto e medidas no estado
        updateFormData({
            ...formData,
            foto_corpo: photoBase64,
            altura_cm: measurements.height_cm || formData.altura_cm,
            medidas: {
                ...formData.medidas,
                altura: measurements.height_cm || formData.medidas.altura,
                busto: measurements.chest_cm || formData.medidas.busto,
                cintura: measurements.waist_cm || formData.medidas.cintura,
                quadril: measurements.hips_cm || formData.medidas.quadril,
            }
        });

        // 2. Fechar modal da câmera
        closeCamera();

        // 3. Mostrar mensagem de sucesso
        setMessage({ type: 'success', text: '✅ Medidas capturadas! Clique em "Salvar Alterações" para confirmar.' });
    };

    // 4. Salvar alterações
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const payload = buildProfilePayload(formData);

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

                {/* Botões de Ação */}
                <FormActions saving={saving} />

                {/* Seção Dados Básicos */}
                <FormDadosPessoais
                    formData={{
                        nome: formData.nome,
                        email: formData.email,
                        cpf: formData.cpf,
                        telefone: formData.telefone,
                        sexo: formData.sexo
                    }}
                    onChange={handleChange}
                />

                {/* Seção Foto de Corpo Inteiro */}
                <FormFotoCorpo
                    fotoCorpo={formData.foto_corpo}
                    onImageChange={handleImageChange}
                    onCameraClick={openCamera}
                />

                {/* Seção Medidas Básicas */}
                <FormMedidasBasicas
                    medidas={{
                        altura: formData.medidas.altura,
                        busto: formData.medidas.busto,
                        cintura: formData.medidas.cintura,
                        quadril: formData.medidas.quadril
                    }}
                    onChange={handleChange}
                />

                {/* Seção Medidas Superiores */}
                <FormMedidasSuperiores
                    medidas={{
                        pescoco: formData.medidas.pescoco,
                        ombro: formData.medidas.ombro,
                        braco: formData.medidas.braco,
                        antebraco: formData.medidas.antebraco,
                        pulso: formData.medidas.pulso,
                        torax: formData.medidas.torax,
                        sobpeito: formData.medidas.sobpeito,
                        costelas: formData.medidas.costelas
                    }}
                    onChange={handleChange}
                />

                {/* Seção Medidas Inferiores */}
                <FormMedidasInferiores
                    medidas={{
                        coxa: formData.medidas.coxa,
                        panturrilha: formData.medidas.panturrilha,
                        tornozelo: formData.medidas.tornozelo
                    }}
                    onChange={handleChange}
                />

                {/* Seção Comprimentos */}
                <FormComprimentos
                    medidas={{
                        comprimento_torso: formData.medidas.comprimento_torso,
                        comprimento_perna: formData.medidas.comprimento_perna,
                        comprimento_braco: formData.medidas.comprimento_braco
                    }}
                    onChange={handleChange}
                />

                {/* Seção Proporções */}
                <FormProporcoes
                    proporcoes={{
                        pernas: formData.proporcoes?.pernas,
                        torso: formData.proporcoes?.torso,
                        ombros_vs_quadril: formData.proporcoes?.ombros_vs_quadril
                    }}
                    onChange={handleChange}
                />

                {/* Seção Estilo */}
                <FormEstilo
                    estilo={{
                        tipo_corpo: formData.tipo_corpo,
                        estilo_pessoal: formData.estilo_pessoal
                    }}
                    onChange={handleChange}
                />

            </form>

            {/* Modal Câmera - Fora da Form */}
            <CameraModal
                isOpen={showCamera}
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
                onClose={closeCamera}
            />
        </div>
    );
};

export default ProfilePage;
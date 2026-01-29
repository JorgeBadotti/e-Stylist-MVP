import { useState, FormEvent } from 'react';
import { DadosProduto } from '../types';

interface UseProductSubmitProps {
    lojaId: string;
    onProdutoCriado?: (produto: any) => void;
    onError?: (erro: string) => void;
}

interface UseProductSubmitReturn {
    enviando: boolean;
    erro: string | null;
    sucesso: string | null;
    setErro: (erro: string | null) => void;
    setSucesso: (sucesso: string | null) => void;
    handleSubmit: (e: FormEvent, dados: DadosProduto, validarFormulario: (dados: DadosProduto) => string[]) => Promise<void>;
}

/**
 * Hook para gerenciar submissão do formulário de produto
 * Centraliza lógica de envio, erro e sucesso
 */
export const useProductSubmit = ({
    lojaId,
    onProdutoCriado,
    onError
}: UseProductSubmitProps): UseProductSubmitReturn => {
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState<string | null>(null);

    const handleSubmit = async (
        e: FormEvent,
        dados: DadosProduto,
        validarFormulario: (dados: DadosProduto) => string[]
    ) => {
        e.preventDefault();
        setErro(null);
        setSucesso(null);

        // Validar
        const errosValidacao = validarFormulario(dados);
        if (errosValidacao.length > 0) {
            const mensagemErro = errosValidacao.join('; ');
            setErro(mensagemErro);
            onError?.(mensagemErro);
            return;
        }

        try {
            setEnviando(true);

            // Montar FormData para upload de imagem
            const formData = new FormData();

            // Campos obrigatórios
            formData.append('categoria', dados.categoria);
            formData.append('linha', dados.linha);
            formData.append('cor_codigo', dados.cor_codigo);
            formData.append('tamanho', dados.tamanho);
            formData.append('colecao', dados.colecao);
            formData.append('layer_role', dados.layer_role);
            formData.append('color_role', dados.color_role);
            formData.append('fit', dados.fit);
            formData.append('style_base', dados.style_base);
            formData.append('nome', dados.nome);
            formData.append('lojaId', lojaId);

            // Campos opcionais - SEMPRE enviar mesmo que vazio para permitir limpeza
            formData.append('descricao', dados.descricao || '');
            formData.append('silhueta', dados.silhueta || '');
            formData.append('comprimento', dados.comprimento || '');
            formData.append('posicao_cintura', dados.posicao_cintura || '');
            formData.append('ocasiao', dados.ocasiao || '');
            formData.append('estacao', dados.estacao || '');
            formData.append('temperatura', dados.temperatura || '');
            formData.append('material_principal', dados.material_principal || '');
            formData.append('eco_score', dados.eco_score || '');
            formData.append('care_level', dados.care_level || '');
            formData.append('faixa_preco', dados.faixa_preco || '');
            if (dados.peca_hero) formData.append('peca_hero', 'true');
            formData.append('classe_margem', dados.classe_margem || '');

            // Imagem - se for base64 do InputFile
            if (dados.imagem && dados.imagem.startsWith('data:image')) {
                formData.append('foto', dados.imagem);
            }

            // Enviar
            const response = await fetch('/api/produtos', {
                method: 'POST',
                body: formData
            });

            console.log(`📤 [useProductSubmit] POST /api/produtos - Status: ${response.status}`);

            const resultado = await response.json();

            if (!response.ok) {
                console.error(`❌ [useProductSubmit] Erro:`, resultado);
                const mensagemErro = resultado.message || 'Erro ao criar produto';
                setErro(mensagemErro);
                onError?.(mensagemErro);
                return;
            }

            // Sucesso
            console.log(`✅ [useProductSubmit] Produto criado com SKU:`, resultado.skuStyleMe);
            const mensagemSucesso = `✅ Produto criado! SKU: ${resultado.skuStyleMe}`;
            setSucesso(mensagemSucesso);

            if (onProdutoCriado) {
                onProdutoCriado(resultado.produto);
            }
        } catch (e) {
            console.error('Erro ao criar produto:', e);
            const mensagemErro = 'Erro ao criar produto';
            setErro(mensagemErro);
            onError?.(mensagemErro);
        } finally {
            setEnviando(false);
        }
    };

    return {
        enviando,
        erro,
        sucesso,
        setErro,
        setSucesso,
        handleSubmit
    };
};

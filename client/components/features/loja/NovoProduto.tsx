import React, { useState } from 'react';
import { adicionarProduto } from '../../src/services/lojaService';
import { Produto } from '../../src/types/types';

interface NovoProdutoProps {
    lojaId: string; // O ID da loja para associar o produto
    onProdutoAdicionado: (novoProduto: Produto) => void;
    onCancelar: () => void;
}

const NovoProduto: React.FC<NovoProdutoProps> = ({ lojaId, onProdutoAdicionado, onCancelar }) => {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [sku, setSku] = useState('');
    const [estoque, setEstoque] = useState('1');
    const [fotos, setFotos] = useState<FileList | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!nome || !descricao || !preco || !sku || !estoque || !fotos) {
            setError('Todos os campos, incluindo as fotos, são obrigatórios.');
            return;
        }

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('preco', preco);
        formData.append('sku', sku);
        formData.append('estoque', estoque);
        
        for (let i = 0; i < fotos.length; i++) {
            formData.append('fotos', fotos[i]);
        }

        setLoading(true);
        try {
            const novoProduto = await adicionarProduto(lojaId, formData);
            onProdutoAdicionado(novoProduto);
        } catch (err) {
            setError('Falha ao adicionar o produto. Verifique o SKU ou os dados informados.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Adicionar Novo Produto</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                        <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="preco" className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                            <input type="number" id="preco" value={preco} onChange={(e) => setPreco(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU (Código Único)</label>
                            <input type="text" id="sku" value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="estoque" className="block text-sm font-medium text-gray-700">Estoque</label>
                        <input type="number" id="estoque" value={estoque} onChange={(e) => setEstoque(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="fotos" className="block text-sm font-medium text-gray-700">Fotos do Produto</label>
                        <input type="file" id="fotos" onChange={(e) => setFotos(e.target.files)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" multiple required />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancelar} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                            {loading ? 'Adicionando...' : 'Adicionar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NovoProduto;

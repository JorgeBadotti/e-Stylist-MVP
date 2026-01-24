import { GoogleGenerativeAI } from "@google/generative-ai";

// Declare a variável e exporte ela diretamente (se precisar acessá-la fora)
export let genAIClient = null;

// Adicione a palavra 'export' antes da função
export function initGemini() {
    const apiKey = process.env.GOOGLE_GEMINI_KEY;
    if (!apiKey) {
        console.error("ERRO: GOOGLE_GEMINI_KEY não definida no .env");
        return;
    }
    genAIClient = new GoogleGenerativeAI(apiKey);
    console.log("Gemini inicializado com sucesso");
}

/**
 * Analisar imagem de roupa e gerar dados de SKU
 * @param {Buffer} imagemBuffer - Buffer da imagem
 * @param {string} mimeType - Tipo MIME da imagem (image/jpeg, image/png, etc)
 * @returns {Promise<Object>} Dados do produto em JSON
 */
export async function analisarImagemProduto(imagemBuffer, mimeType = 'image/jpeg') {
    try {
        if (!genAIClient) {
            throw new Error('Gemini não inicializado. Chame initGemini() primeiro.');
        }

        // Converter buffer para base64
        const base64Imagem = imagemBuffer.toString('base64');

        const model = genAIClient.getGenerativeModel({
            model: 'gemini-2.5-flash-image',
        });

        // Prompt baseado no generate_sku.md
        const prompt = `Atue como uma API de Visão Computacional Especialista em Moda para o sistema "StyleMe".
Sua tarefa é analisar a IMAGEM fornecida de um item de vestuário e gerar um objeto JSON válido com os seguintes campos:

REGRAS CRÍTICAS:
1. Analise a imagem e identifique: categoria, cor, tipo de ajuste (fit), estilo e detalhes visuais
2. Respeite APENAS os valores permitidos nos enums:
   - categoria: ['CAM', 'SHI', 'TOP', 'SWE', 'CAL', 'JEA', 'SAI', 'SHO', 'BER', 'VES', 'MAC', 'JKT', 'CAS', 'COA', 'BLA', 'TEN', 'SAP', 'BOT', 'SAN', 'SLI', 'OXF', 'MOC', 'SCA', 'ANI', 'BAG', 'BEL', 'HAT', 'JEW', 'WAT', 'SCA_ACC', 'GLA', 'TIE']
   - linha: 'F' (feminino), 'M' (masculino), 'U' (unissex)
   - tamanho: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] (use 'M' como padrão se incerto)
   - fit: ['JUSTO', 'REGULAR', 'SOLTO', 'OVERSIZE']
   - layer_role: ['BASE', 'MID', 'OUT'] (BASE para camiseta/top, OUT para casaco)
   - color_role: ['NEUTRO', 'DESTAQUE'] (NEUTRO para preto/branco/cinza, DESTAQUE para cores vibrantes)
   - style_base: ['CASUAL', 'FORMAL', 'SPORT', 'CHIC']
   - silhueta: ['A', 'H', 'V', 'O']
   - comprimento: ['CURTA', 'REGULAR', 'LONGA']
   - posicao_cintura: ['NATURAL', 'ALTO', 'BAIXO']
   - ocasiao: ['CASUAL', 'WORK', 'NIGHT', 'GYM', 'FORMAL']
   - estacao: ['SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL']
   - temperatura: ['COLD', 'MILD', 'HOT']

3. Gere um código de 3 letras para cor_codigo baseado na cor dominante (ex: Preto->PRT, Azul->AZL, Vermelho->VER)
4. Use colecao = "S25" como padrão
5. Gere skuStyleMe no formato: CATEGORIA-LINHA-COR_CODIGO-TAMANHO-001-COLECAO
6. O nome deve ser descritivo da peça

RETORNE UM JSON VÁLIDO COM ESTA ESTRUTURA (sem markdown, apenas JSON puro):
{
  "nome": "descrição da peça",
  "categoria": "valor_do_enum",
  "linha": "F/M/U",
  "cor_codigo": "ABC (3 letras)",
  "tamanho": "M",
  "colecao": "S25",
  "layer_role": "BASE/MID/OUT",
  "color_role": "NEUTRO/DESTAQUE",
  "fit": "JUSTO/REGULAR/SOLTO/OVERSIZE",
  "style_base": "CASUAL/FORMAL/SPORT/CHIC",
  "silhueta": "A/H/V/O",
  "comprimento": "CURTA/REGULAR/LONGA",
  "posicao_cintura": "NATURAL/ALTO/BAIXO",
  "ocasiao": "CASUAL/WORK/NIGHT/GYM/FORMAL",
  "estacao": "SPRING/SUMMER/FALL/WINTER/ALL",
  "temperatura": "COLD/MILD/HOT",
  "skuStyleMe": "CATEGORIA-LINHA-COR-TAMANHO-001-S25"
}`;

        const resposta = await model.generateContent([
            {
                inlineData: {
                    data: base64Imagem,
                    mimeType: mimeType,
                },
            },
            prompt,
        ]);

        const texto = resposta.response.text();

        // Tentar extrair JSON da resposta (pode ter markdown)
        const jsonMatch = texto.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Não foi possível extrair JSON da resposta do Gemini');
        }

        const dados = JSON.parse(jsonMatch[0]);
        console.log('✅ [Gemini] Imagem analisada com sucesso:', dados.skuStyleMe);

        return dados;
    } catch (erro) {
        console.error('❌ [Gemini] Erro ao analisar imagem:', erro.message);
        throw erro;
    }
}
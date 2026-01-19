# 📸 Endpoint de Análise de Imagens - POST /api/produtos/lotes/imagens

## Descrição
Analisa imagens de roupas usando Gemini AI e gera automaticamente dados de SKU STYLEME para cadastro em lotes.

## Como Funciona

1. **Recebimento**: Client envia múltiplas imagens JPEG/PNG
2. **Processamento**: Cada imagem é analisada pelo Gemini com prompt baseado em `generate_sku.md`
3. **Extração**: Sistema extrai cores, estilos, categorias, etc automaticamente
4. **Geração de SKU**: Cria SKU no formato `CATEGORIA-LINHA-COR-TAMANHO-001-COLECAO`
5. **Resposta**: Retorna JSON com dados de todos os produtos analisados

## Request

```
POST /api/produtos/lotes/imagens
Content-Type: multipart/form-data

- imagens (múltiplos arquivos): .jpg, .jpeg, .png
- lojaId (string): ID da loja
```

### Exemplo com cURL:
```bash
curl -X POST http://localhost:3000/api/produtos/lotes/imagens \
  -F "imagens=@camiseta.jpg" \
  -F "imagens=@vestido.png" \
  -F "lojaId=507f1f77bcf86cd799439011"
```

### Exemplo com JavaScript/Fetch:
```javascript
const formData = new FormData();
formData.append('lojaId', lojaId);
formData.append('imagens', imagemFile1);
formData.append('imagens', imagemFile2);

const response = await fetch('/api/produtos/lotes/imagens', {
  method: 'POST',
  body: formData
});

const resultado = await response.json();
```

## Response (Sucesso)

```json
{
  "mensagem": "✅ 2 de 2 imagens analisadas com sucesso",
  "quantidade": 2,
  "produtos": [
    {
      "nome": "Camiseta Básica Branca Feminina",
      "categoria": "CAM",
      "linha": "F",
      "cor_codigo": "BRA",
      "tamanho": "M",
      "colecao": "S25",
      "layer_role": "BASE",
      "color_role": "NEUTRO",
      "fit": "REGULAR",
      "style_base": "CASUAL",
      "silhueta": "H",
      "comprimento": "REGULAR",
      "posicao_cintura": "NATURAL",
      "ocasiao": "CASUAL",
      "estacao": "ALL",
      "temperatura": "MILD",
      "skuStyleMe": "CAM-F-BRA-M-001-S25",
      "lojaId": "507f1f77bcf86cd799439011"
    },
    {
      "nome": "Vestido Longo Preto Feminino",
      "categoria": "VES",
      "linha": "F",
      "cor_codigo": "PRT",
      "tamanho": "S",
      "colecao": "S25",
      "layer_role": "BASE",
      "color_role": "NEUTRO",
      "fit": "JUSTO",
      "style_base": "FORMAL",
      "silhueta": "A",
      "comprimento": "LONGA",
      "posicao_cintura": "NATURAL",
      "ocasiao": "NIGHT",
      "estacao": "ALL",
      "temperatura": "COLD",
      "skuStyleMe": "VES-F-PRT-S-001-S25",
      "lojaId": "507f1f77bcf86cd799439011"
    }
  ],
  "erros": null,
  "status": "sucesso"
}
```

## Response (Com Erros Parciais)

```json
{
  "mensagem": "✅ 1 de 2 imagens analisadas com sucesso",
  "quantidade": 1,
  "produtos": [
    {
      "nome": "Camiseta Básica Branca Feminina",
      "categoria": "CAM",
      ...
    }
  ],
  "erros": [
    {
      "imagem": "imagem_corrompida.jpg",
      "erro": "Não foi possível extrair JSON da resposta do Gemini"
    }
  ],
  "status": "parcial"
}
```

## Requisitos

### Variáveis de Ambiente
```
GOOGLE_GEMINI_KEY=sua_chave_de_api_gemini
```

### Dependências
- `@google/generative-ai` (já instalado)
- `multer` (para upload de arquivos, já instalado)

## Tratamento de Erros

| Erro | Status | Descrição |
|------|--------|-----------|
| lojaId ausente | 400 | Campo lojaId obrigatório não fornecido |
| Nenhuma imagem | 400 | Nenhum arquivo foi enviado |
| Imagem inválida | 200 (com erro no array) | Imagem corrompida ou formato inválido |
| Gemini indisponível | 500 | API Gemini não respondeu |
| Chave API inválida | 500 | GOOGLE_GEMINI_KEY não configurada |

## Próximos Passos

Após obter os dados do endpoint, o cliente pode:

1. **Salvar no banco**: Usar POST `/api/produtos` para cada item
2. **Upload de foto**: Fazer upload da imagem para Cloudinary
3. **Link de imagem**: Adicionar URL da foto ao SKU criado

Exemplo:
```javascript
for (const produto of resultado.produtos) {
  // 1. Upload da imagem para Cloudinary
  const urlFoto = await uploadCloudinary(imagemOriginal);
  
  // 2. Criar produto no banco com foto
  const response = await fetch('/api/produtos', {
    method: 'POST',
    body: FormData com {...produto, foto: imagemFile}
  });
}
```

## Debug

Para ver os logs detalhados do processamento:

```javascript
// Terminal do servidor mostrará:
// 📸 [ProdutoRouter] Recebido requisição POST /lotes/imagens
// 📊 Arquivos recebidos: 2
// 🔍 [ProdutoRouter] Analisando imagem 1/2: camiseta.jpg
// ✅ [Gemini] Imagem analisada com sucesso: CAM-F-BRA-M-001-S25
// ✅ [ProdutoRouter] Imagem 1 analisada - SKU: CAM-F-BRA-M-001-S25
```

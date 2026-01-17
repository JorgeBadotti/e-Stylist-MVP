# 📦 EXEMPLOS DE USO — SKU STYLEME v1 API

## 1. Obter Dicionários

### Categorias
```http
GET /api/dicionarios?tipo=CATEGORIA
```

**Response:**
```json
{
  "tipo": "CATEGORIA",
  "total": 31,
  "dados": [
    {
      "_id": "...",
      "tipo": "CATEGORIA",
      "codigo": "CAM",
      "descricao": "Camiseta / Blusa",
      "categoria_pai": "VESTUARIO_SUPERIOR",
      "status": "ATIVO"
    },
    {
      "codigo": "SHI",
      "descricao": "Camisa",
      "categoria_pai": "VESTUARIO_SUPERIOR"
    },
    ...
  ]
}
```

### Cores
```http
GET /api/dicionarios?tipo=COR
```

### Tamanhos
```http
GET /api/dicionarios?tipo=TAMANHO
```

### Núcleo de Combinação
```http
GET /api/dicionarios?tipo=LAYER_ROLE
GET /api/dicionarios?tipo=COLOR_ROLE
GET /api/dicionarios?tipo=FIT
GET /api/dicionarios?tipo=STYLE_BASE
```

---

## 2. Sugerir Próximo SKU

Antes de cadastrar, obter qual será o sequencial:

```http
GET /api/produtos/sku-sugestao?categoria=CAM&colecao=F24
```

**Response:**
```json
{
  "categoria": "CAM",
  "colecao": "F24",
  "proximoSequencial": "023",
  "exemploCodigo": "CAM-[LINHA]-[COR]-[TAM]-023-F24"
}
```

---

## 3. Criar Produto — Exemplo Completo

### Request
```http
POST /api/produtos
Content-Type: application/json

{
  "categoria": "CAM",
  "linha": "F",
  "cor_codigo": "PRT",
  "tamanho": "M",
  "colecao": "F24",
  "sequencia": "023",
  
  "layer_role": "BASE",
  "color_role": "NEUTRO",
  "fit": "REGULAR",
  "style_base": "CASUAL",
  
  "silhueta": "H",
  "comprimento": "REGULAR",
  "posicao_cintura": "NATURAL",
  "ocasiao": "CASUAL",
  "estacao": "SPRING",
  "temperatura": "MILD",
  
  "material_principal": "ALGODAO",
  "eco_score": "GOOD",
  "care_level": "EASY",
  "faixa_preco": "STANDARD",
  "peca_hero": false,
  "classe_margem": "NORMAL",
  
  "nome": "Camiseta Básica Preta",
  "descricao": "Camiseta 100% algodão, confortável para uso diário",
  
  "lojaId": "607f1f77bcf86cd799439011"
}
```

### Response (Sucesso - 201)
```json
{
  "message": "Produto criado com sucesso",
  "skuStyleMe": "CAM-F-PRT-M-023-F24",
  "sequencia": "023",
  "produto": {
    "_id": "507f1f77bcf86cd799439012",
    "skuStyleMe": "CAM-F-PRT-M-023-F24",
    "categoria": "CAM",
    "linha": "F",
    "cor_codigo": "PRT",
    "tamanho": "M",
    "sequencia": "023",
    "colecao": "F24",
    
    "layer_role": "BASE",
    "color_role": "NEUTRO",
    "fit": "REGULAR",
    "style_base": "CASUAL",
    
    "silhueta": "H",
    "comprimento": "REGULAR",
    "posicao_cintura": "NATURAL",
    "ocasiao": "CASUAL",
    "estacao": "SPRING",
    "temperatura": "MILD",
    
    "material_principal": "ALGODAO",
    "eco_score": "GOOD",
    "care_level": "EASY",
    "faixa_preco": "STANDARD",
    "peca_hero": false,
    "classe_margem": "NORMAL",
    
    "nome": "Camiseta Básica Preta",
    "descricao": "Camiseta 100% algodão, confortável para uso diário",
    "foto": "https://res.cloudinary.com/...",
    "fotoPublicId": "estylis/...",
    
    "lojaId": "607f1f77bcf86cd799439011",
    "guardaRoupaId": null,
    "status": "ATIVO",
    "versao": "1.0",
    
    "createdAt": "2026-01-17T15:30:00.000Z",
    "updatedAt": "2026-01-17T15:30:00.000Z"
  }
}
```

### Response (Erro - Campos Obrigatórios)
```json
{
  "message": "Campos obrigatórios do SKU STYLEME ausentes: color_role, fit",
  "enums": {
    "layer_role": ["BASE", "MID", "OUT"],
    "color_role": ["NEUTRO", "DESTAQUE"],
    "fit": ["JUSTO", "REGULAR", "SOLTO", "OVERSIZE"],
    "style_base": ["CASUAL", "FORMAL", "SPORT", "CHIC"]
  }
}
```

### Response (Erro - Dicionário Inválido)
```json
{
  "message": "Valores não encontrados nos dicionários",
  "erros": [
    "Cor inválida: XYZ",
    "Tamanho inválido: 99"
  ],
  "dica": "Use GET /api/dicionarios?tipo=CATEGORIA para ver valores válidos"
}
```

### Response (Erro - Duplicata)
```json
{
  "message": "SKU STYLEME já existe no sistema",
  "skuDuplicado": "CAM-F-PRT-M-023-F24"
}
```

---

## 4. Criar Produto — Com Imagem

```http
POST /api/produtos
Content-Type: multipart/form-data

[Form Data]
categoria: CAM
linha: F
cor_codigo: PRT
tamanho: M
colecao: F24
layer_role: BASE
color_role: NEUTRO
fit: REGULAR
style_base: CASUAL
nome: Camiseta Básica
lojaId: 607f1f77bcf86cd799439011
foto: [arquivo binary]
```

---

## 5. Criar Produto — Mínimo (Campos Obrigatórios)

```http
POST /api/produtos
Content-Type: application/json

{
  "categoria": "CAM",
  "linha": "F",
  "cor_codigo": "PRT",
  "tamanho": "M",
  "colecao": "F24",
  
  "layer_role": "BASE",
  "color_role": "NEUTRO",
  "fit": "REGULAR",
  "style_base": "CASUAL",
  
  "nome": "Camiseta",
  "lojaId": "607f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "message": "Produto criado com sucesso",
  "skuStyleMe": "CAM-F-PRT-M-001-F24",
  "sequencia": "001",
  "produto": {
    ...
    "skuStyleMe": "CAM-F-PRT-M-001-F24",
    "nome": "Camiseta",
    "silhueta": null,
    "comprimento": null,
    ...
  }
}
```

---

## 6. Listar Produtos de uma Loja

```http
GET /api/produtos/loja/607f1f77bcf86cd799439011
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "skuStyleMe": "CAM-F-PRT-M-023-F24",
    "nome": "Camiseta Básica Preta",
    ...
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "skuStyleMe": "JEA-M-AZL-G-001-F24",
    "nome": "Calça Jeans",
    ...
  }
]
```

---

## 7. Atualizar Produto

```http
PUT /api/produtos/507f1f77bcf86cd799439012
Content-Type: application/json

{
  "nome": "Camiseta Básica Preta Premium",
  "descricao": "Atualizada",
  "faixa_preco": "PREMIUM",
  "peca_hero": true,
  "care_level": "MEDIUM"
}
```

**Response:**
```json
{
  "message": "Produto atualizado com sucesso",
  "produto": {
    "_id": "507f1f77bcf86cd799439012",
    "skuStyleMe": "CAM-F-PRT-M-023-F24",
    "nome": "Camiseta Básica Preta Premium",
    "descricao": "Atualizada",
    "faixa_preco": "PREMIUM",
    "peca_hero": true,
    "care_level": "MEDIUM",
    ...
  }
}
```

---

## 8. Deletar Produto

```http
DELETE /api/produtos/507f1f77bcf86cd799439012
```

**Response:**
```json
{
  "message": "Produto removido com sucesso",
  "skuDeletado": "CAM-F-PRT-M-023-F24"
}
```

---

## 9. Fluxo Completo (Frontend)

```typescript
// 1. Carregar dicionários
const categorias = await fetch('/api/dicionarios?tipo=CATEGORIA').then(r => r.json());
const cores = await fetch('/api/dicionarios?tipo=COR').then(r => r.json());
const tamanhos = await fetch('/api/dicionarios?tipo=TAMANHO').then(r => r.json());

// 2. Usuário seleciona categoria, cor, tamanho, colecao
const categoria = 'CAM';
const colecao = 'F24';

// 3. Obter sugestão de sequencial
const sugestao = await fetch(
  `/api/produtos/sku-sugestao?categoria=${categoria}&colecao=${colecao}`
).then(r => r.json());
console.log('Próximo SKU:', sugestao.exemploCodigo);
// Próximo SKU: CAM-[LINHA]-[COR]-[TAM]-023-F24

// 4. Preencher formulário com valores do usuário
const dadosProduto = {
  categoria: 'CAM',
  linha: 'F',
  cor_codigo: 'PRT',
  tamanho: 'M',
  colecao: 'F24',
  layer_role: 'BASE',
  color_role: 'NEUTRO',
  fit: 'REGULAR',
  style_base: 'CASUAL',
  nome: 'Camiseta Básica',
  lojaId: lojaAtual._id
};

// 5. Enviar POST
const response = await fetch('/api/produtos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(dadosProduto)
});

const resultado = await response.json();
if (response.ok) {
  console.log('SKU gerado:', resultado.skuStyleMe);
  // SKU gerado: CAM-F-PRT-M-023-F24
} else {
  console.error('Erro:', resultado.message);
}
```

---

## 10. Casos de Uso Reais

### Caso 1: Admin registra nova camiseta
```bash
POST /api/produtos
{
  "categoria": "CAM",
  "linha": "F",
  "cor_codigo": "BRA",
  "tamanho": "P",
  "colecao": "S25",
  "layer_role": "BASE",
  "color_role": "NEUTRO",
  "fit": "JUSTO",
  "style_base": "FORMAL",
  "ocasiao": "WORK",
  "estacao": "SUMMER",
  "nome": "Camiseta Branca Premium",
  "lojaId": "..."
}
→ SKU gerado: CAM-F-BRA-P-001-S25
```

### Caso 2: Usuário adiciona roupa ao guarda-roupa pessoal
```bash
POST /api/produtos
{
  "categoria": "CAL",
  "linha": "F",
  "cor_codigo": "AZL",
  "tamanho": "M",
  "colecao": "P25",
  "layer_role": "BASE",
  "color_role": "NEUTRO",
  "fit": "REGULAR",
  "style_base": "CASUAL",
  "nome": "Calça Jeans Azul",
  "guardaRoupaId": "..."
}
→ SKU gerado: CAL-F-AZL-M-001-P25
```

### Caso 3: Listar todos os SKUs de uma loja
```bash
GET /api/produtos/loja/607f1f77bcf86cd799439011
→ Retorna array com todos os produtos com seus SKUs
```

---

## Erro Handling

### 400 Bad Request
```json
{
  "message": "Campos obrigatórios do SKU STYLEME ausentes",
  "exemplo": {...}
}
```

### 403 Forbidden
```json
{
  "message": "Loja inválida ou acesso negado"
}
```

### 404 Not Found
```json
{
  "message": "Produto não encontrado"
}
```

### 500 Internal Server Error
```json
{
  "message": "Erro ao criar produto",
  "error": "Detalhes do erro..."
}
```

---

**Documentação atualizada:** 2026-01-17  
**Versão API:** 1.0  
**Status:** ✅ Produção

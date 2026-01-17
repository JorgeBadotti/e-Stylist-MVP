# 📘 SKU STYLEME v1 — DOCUMENTAÇÃO TÉCNICA

## 1. Estrutura do Código SKU (Padrão Oficial)

### Formato
```
[CATEGORIA]-[LINHA]-[COR]-[TAMANHO]-[SEQ]-[COLECAO]
```

### Exemplo
```
CAM-F-PRT-M-023-F24
```

### Componentes

| Campo | Tamanho | Tipo | Obrigatório | Exemplo | Significado |
|-------|---------|------|-------------|---------|-------------|
| CATEGORIA | 3 | Código | ✅ | CAM | Camiseta (ver dicionário) |
| LINHA | 1 | Letra | ✅ | F | Feminina (F/M/U) |
| COR | 3 | Código | ✅ | PRT | Preto (ver dicionário) |
| TAMANHO | 1-2 | Alpanumérico | ✅ | M | Médio ou numérico |
| SEQ | 3 | Dígitos | ✅ | 023 | Número sequencial único |
| COLECAO | 3 | Letra+Dígitos | ✅ | F24 | Fall 2024 |

---

## 2. Dicionários Obrigatórios (v1)

### Categorias de Vestuário
```
CAM → Camiseta / Blusa
SHI → Camisa
TOP → Top
SWE → Suéter / Moletom
CAL → Calça
JEA → Jeans
SAI → Saia
SHO → Short
BER → Bermuda
VES → Vestido
MAC → Macacão
JKT → Jaqueta
CAS → Casaco
COA → Sobretudo
BLA → Blazer
```

### Linha (Gênero)
```
F → Feminina
M → Masculina
U → Unissex
```

### Cores (Principais)
```
PRT → Preto
BRA → Branco
CIN → Cinza
AZL → Azul
VRM → Vermelho
VRD → Verde
MAR → Marrom
BEG → Bege
ROX → Roxo
... (20+ cores)
```

### Tamanho
```
Vestuário: PP, P, M, G, GG, XS, S, L, XL, XXL
Calçado: 33-42, 43+
```

### Coleção
```
S24 → Spring 2024
S25 → Spring 2025
F24 → Fall 2024
F25 → Fall 2025
P24 → Premium 2024
P25 → Premium 2025
```

---

## 3. Campos Obrigatórios no Banco (Núcleo de Combinação)

Esses campos **não** aparecem no código SKU, mas são **essenciais** para o sistema funcionar.

### Campos Obrigatórios
```javascript
{
  skuStyleMe: "CAM-F-PRT-M-023-F24",  // Código visível
  categoria: "CAM",                    // Vestuário/Calçado/Acessório
  layer_role: "BASE",                  // BASE / MID / OUT
  color_role: "NEUTRO",                // NEUTRO / DESTAQUE
  fit: "REGULAR",                      // JUSTO / REGULAR / SOLTO / OVERSIZE
  style_base: "CASUAL",                // CASUAL / FORMAL / SPORT / CHIC
  nome: "Camiseta Básica",             // Nome comercial
  foto: "url_cloudinary",              // Imagem
}
```

**Sem isso:**
- ❌ IA não combina peças
- ❌ Look quebra
- ❌ Sistema não funciona

---

## 4. Campos Recomendados (Melhoram Inteligência)

Fortemente sugeridos para recomendação e fits:

```javascript
{
  silhueta: "H",                       // A / H / V / O
  comprimento: "REGULAR",              // CURTA / REGULAR / LONGA
  posicao_cintura: "NATURAL",          // NATURAL / ALTO / BAIXO
  ocasiao: "CASUAL",                   // CASUAL / WORK / NIGHT / GYM / FORMAL
  estacao: "SPRING",                   // SPRING / SUMMER / FALL / WINTER / ALL
  temperatura: "MILD"                  // COLD / MILD / HOT
}
```

---

## 5. Campos Opcionais (v1 - Upgrade Futuro)

Não bloqueiam nada, mas enriquecem o sistema:

```javascript
{
  material_principal: "ALGODAO",       // Fibra principal
  eco_score: "GOOD",                   // EXCELLENT / GOOD / MEDIUM / LOW
  care_level: "EASY",                  // EASY / MEDIUM / COMPLEX
  faixa_preco: "STANDARD",             // BUDGET / STANDARD / PREMIUM / LUXURY
  peca_hero: false,                    // É destaque?
  classe_margem: "NORMAL"              // LOW / NORMAL / HIGH
}
```

---

## 6. Visão Técnica (JSON Completo)

```json
{
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
  
  "nome": "Camiseta Básica",
  "descricao": "Algodão 100%, confortável",
  "foto": "https://res.cloudinary.com/...",
  "fotoPublicId": "estylis/...",
  
  "guardaRoupaId": null,
  "lojaId": "607...",
  "status": "ATIVO",
  "versao": "1.0"
}
```

---

## 7. Fluxo de Criação do SKU

### Frontend (Cadastro)
```typescript
1. Usuário seleciona CATEGORIA (dropdown do dicionário)
2. Sistema pré-seleciona LINHA (baseado em usuário/loja)
3. Usuário seleciona COR (dropdown com cores disponíveis)
4. Usuário seleciona TAMANHO (dropdown baseado em categoria)
5. SEQUENCIA é gerada automaticamente pelo backend
6. Usuário seleciona COLECAO (dropdown com coleções ativas)
7. Sistema mostra preview: "CAM-F-PRT-M-[AUTO]-F24"
8. Usuário preenche CAMPOS OBRIGATÓRIOS (layer_role, color_role, fit, style_base)
```

### Backend (Validação)
```javascript
1. Recebe dados do frontend
2. Valida campos obrigatórios ✅
3. Consulta dicionários (categoria existe? cor existe?)
4. Gera SEQUENCIA baseado em (categoria + colecao) ✅
5. Monta SKU: [CAT]-[LIN]-[COR]-[TAM]-[SEQ]-[COL]
6. Valida formato do SKU (regex)
7. Verifica duplicata (skuStyleMe deve ser único)
8. Valida campos de combinação (layer_role, color_role, etc)
9. Salva no MongoDB com indexação otimizada
```

---

## 8. Validações Críticas

### SKU Válido
```
✅ CAM-F-PRT-M-023-F24
✅ JEA-M-AZL-G-001-S25
✅ VES-U-ROX-P-999-F24
✅ TEN-M-BRA-42-050-P25
```

### SKU Inválido
```
❌ CAM-F-PRT-M-23-F24       (SEQ com 2 dígitos, não 3)
❌ cam-f-prt-m-023-f24      (letras minúsculas)
❌ CAMISA-F-PRT-M-023-F24   (CAT com 6 caracteres, não 3)
❌ CAM-F-PRT-M-023-F2024    (COL com 4 dígitos, não 2)
❌ CAM-F-PRT-M-AB3-F24      (SEQ com letras, não dígitos)
```

---

## 9. Geração Automática de Sequencial

### Algoritmo
```javascript
// Contar produtos com mesma (categoria + colecao) + não descontinuados
const count = await Produto.countDocuments({
  categoria: "CAM",
  colecao: "F24",
  status: { $ne: "DESCONTINUADO" }
});

// Próximo sequencial
const proximoSeq = String(count + 1).padStart(3, '0');
// count = 22 → proximoSeq = "023"
```

### Limitações
- Máximo 999 peças por (categoria + colecao)
- Se atingir limite, criar nova coleção
- Exemplo: F24 → F25

---

## 10. Índices no MongoDB

```javascript
// Otimizações para busca e combinação
db.produtos.createIndex({ skuStyleMe: 1 }, { unique: true })
db.produtos.createIndex({ categoria: 1, linha: 1 })
db.produtos.createIndex({ guardaRoupaId: 1 })
db.produtos.createIndex({ lojaId: 1 })
db.produtos.createIndex({ layer_role: 1, color_role: 1 })  // Combinação
db.produtos.createIndex({ ocasiao: 1, estacao: 1 })        // Recomendação
```

---

## 11. Endpoints da API

### Criar Produto
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
  "nome": "Camiseta Básica",
  "lojaId": "607...",
  // Opcionais...
}

// Response:
{
  "skuStyleMe": "CAM-F-PRT-M-023-F24",
  "sequencia": "023",
  ...
}
```

### Obter Dicionários
```http
GET /api/dicionarios?tipo=CATEGORIA
GET /api/dicionarios?tipo=COR
GET /api/dicionarios?tipo=TAMANHO
GET /api/dicionarios?tipo=LAYER_ROLE

// Response:
[
  { codigo: "CAM", descricao: "Camiseta / Blusa" },
  { codigo: "SHI", descricao: "Camisa" },
  ...
]
```

### Buscar por SKU
```http
GET /api/produtos/sku/CAM-F-PRT-M-023-F24
```

---

## 12. Regra de Ouro (CRÍTICA)

```
SKU é identidade.
Inteligência mora no banco.
Nunca tente enfiar tudo no código.

A IA não lê "CAM-F-PRT-M-023-F24" 
e tira conclusões mágicas.

A IA lê os campos [layer_role, color_role, fit, style_base]
e AHHH... agora consigo combinar!
```

---

## 13. Migração Futura (v1 → v2)

### O que pode mudar
- ❌ Estrutura SKU (nunca)
- ❌ Campos obrigatórios (nunca)
- ✅ Adicionar novos campos opcionais
- ✅ Expandir dicionários (mais cores, categorias)
- ✅ Versão pode subir: "1.0" → "2.0"

### Segurança de Dados
```javascript
// Sempre manter versao no documento
{
  "skuStyleMe": "CAM-F-PRT-M-023-F24",
  "versao": "1.0",  // ← Auditável para sempre
  ...
}

// Permite trocar lógica sem perder rastreabilidade
```

---

## 14. Checklist de Implementação (Sprint 1)

### Backend
- [ ] Criar modelo Produto.js com campos SKU STYLEME
- [ ] Criar DicionarioStyleMe.js com seed data
- [ ] Criar skuStyleMeUtils.js com gerador/validador
- [ ] Atualizar produtoController com validação de SKU
- [ ] Criar endpoint GET /api/dicionarios
- [ ] Criar testes de SKU (válido, inválido, duplicata)
- [ ] Adicionar índices ao MongoDB

### Frontend
- [ ] Criar componente CadastroProdutoSKU.tsx
  - Dropdowns para categoria, cor, tamanho, coleção
  - Preview de SKU gerado
  - Inputs para campos obrigatórios
  - Validação em tempo real
- [ ] Integrar carregamento de dicionários
- [ ] Testes de UX (fluxo de cadastro)

### Testes
- [ ] SKU gerado corretamente
- [ ] Duplicatas rejeitadas
- [ ] Validações de dicionário
- [ ] Sequencial auto-incrementa
- [ ] Campos obrigatórios validados

---

## 15. Suporte (FAQ)

**P: Posso mudar a estrutura do SKU depois?**  
R: Não. É imutável. Planeje bem antes de lançar.

**P: Quanto custa gerar um SKU?**  
R: Grátis. Sistema faz automático.

**P: E se chegar a 999 peças por categoria?**  
R: Criar nova coleção (F24 → F25).

**P: Que campos São salvos no `skuStyleMe`?**  
R: Nenhum além do código visível. Componentes estão em campos separados.

**P: Posso editar um SKU após criado?**  
R: Não recomendado. Marca como DESCONTINUADO e cria novo.

---

**Última atualização:** 2026-01-17  
**Versão:** 1.0  
**Status:** ✅ Produção

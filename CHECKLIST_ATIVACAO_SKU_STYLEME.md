# ✅ CHECKLIST DE ATIVAÇÃO — SKU STYLEME v1

## 🚀 ANTES DE COLOCAR EM PRODUÇÃO

### ✅ FASE 1: VERIFICAÇÃO DE CÓDIGO (15 min)

- [ ] **Importações corretas**
  ```bash
  # Verificar se DicionarioStyleMe é importado em produtoController.js
  grep -r "DicionarioStyleMe" server/controllers/
  # Deve retornar: produtoController.js:import Dicionario from '../models/DicionarioStyleMe.js'
  ```

- [ ] **Modelo Produto tem todos os campos**
  ```bash
  # Verificar campos SKU
  grep "skuStyleMe" server/models/Produto.js
  # Deve retornar: múltiplas linhas (campo, índice, etc)
  ```

- [ ] **Dicionários estão no modelo**
  ```bash
  # Verificar export de DICIONARIOS_STYLEME_V1
  grep "export const DICIONARIOS_STYLEME_V1" server/models/DicionarioStyleMe.js
  # Deve retornar a linha do export
  ```

- [ ] **Utils SKU estão importáveis**
  ```bash
  # Verificar funções de geração
  head -20 server/utils/skuStyleMeUtils.js
  # Deve mostrar comentário e função gerarSKUStyleMe
  ```

### ✅ FASE 2: COMPILAÇÃO (10 min)

- [ ] **Sem erros de sintaxe**
  ```bash
  cd server
  npm run build  # ou verificação de sintaxe
  # Exit code deve ser 0
  ```

- [ ] **Sem warnings de import**
  ```bash
  npm list | grep -i erro
  # Não deve retornar nada
  ```

### ✅ FASE 3: BANCO DE DADOS (20 min)

- [ ] **Conectar ao MongoDB**
  ```bash
  # Verificar conexão
  mongo "mongodb+srv://user:pass@cluster.mongodb.net/estylis"
  # Deve conectar com sucesso
  ```

- [ ] **Seed de Dicionários**
  ```bash
  cd server
  node scripts/seedDicionarios.js
  # Deve retornar: ✅ Seed completado com sucesso!
  # Deve inserir: ~300 valores
  ```

- [ ] **Verificar inserção no banco**
  ```javascript
  // No MongoDB compass ou mongo shell:
  db.dicionarios_styleme.countDocuments()
  // Deve retornar: ~300

  db.dicionarios_styleme.findOne({ tipo: 'CATEGORIA', codigo: 'CAM' })
  // Deve retornar: { _id: ..., tipo: "CATEGORIA", codigo: "CAM", ... }
  ```

- [ ] **Criar índices no Produto**
  ```javascript
  // No MongoDB:
  db.produtos.createIndex({ skuStyleMe: 1 }, { unique: true })
  db.produtos.createIndex({ categoria: 1, linha: 1 })
  db.produtos.createIndex({ guardaRoupaId: 1 })
  db.produtos.createIndex({ lojaId: 1 })
  db.produtos.createIndex({ layer_role: 1, color_role: 1 })
  db.produtos.createIndex({ ocasiao: 1, estacao: 1 })
  // Todos devem retornar: "ok": 1
  ```

### ✅ FASE 4: TESTES DE API (30 min)

- [ ] **Listar Dicionários**
  ```bash
  curl -X GET \
    'http://localhost:3000/api/dicionarios?tipo=CATEGORIA' \
    -H 'Authorization: Bearer [TOKEN]'
  
  # Deve retornar:
  # {
  #   "tipo": "CATEGORIA",
  #   "total": 31,
  #   "dados": [...]
  # }
  ```

- [ ] **Sugerir Próximo SKU**
  ```bash
  curl -X GET \
    'http://localhost:3000/api/produtos/sku-sugestao?categoria=CAM&colecao=F24' \
    -H 'Authorization: Bearer [TOKEN]'
  
  # Deve retornar:
  # {
  #   "categoria": "CAM",
  #   "colecao": "F24",
  #   "proximoSequencial": "001",
  #   "exemploCodigo": "CAM-[LINHA]-[COR]-[TAM]-001-F24"
  # }
  ```

- [ ] **Criar Produto (Mínimo)**
  ```bash
  curl -X POST \
    'http://localhost:3000/api/produtos' \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer [TOKEN]' \
    -d '{
      "categoria": "CAM",
      "linha": "F",
      "cor_codigo": "PRT",
      "tamanho": "M",
      "colecao": "F24",
      "layer_role": "BASE",
      "color_role": "NEUTRO",
      "fit": "REGULAR",
      "style_base": "CASUAL",
      "nome": "Camiseta Teste",
      "lojaId": "[VALID_LOJA_ID]"
    }'
  
  # Deve retornar 201:
  # {
  #   "message": "Produto criado com sucesso",
  #   "skuStyleMe": "CAM-F-PRT-M-001-F24",
  #   "sequencia": "001",
  #   "produto": {...}
  # }
  ```

- [ ] **Verificar SKU no Banco**
  ```javascript
  db.produtos.findOne({ skuStyleMe: "CAM-F-PRT-M-001-F24" })
  // Deve retornar o documento criado
  ```

- [ ] **Criar Produto (Completo com Campos Opcionais)**
  ```bash
  curl -X POST \
    'http://localhost:3000/api/produtos' \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer [TOKEN]' \
    -d '{
      "categoria": "CAL",
      "linha": "M",
      "cor_codigo": "AZL",
      "tamanho": "G",
      "colecao": "S25",
      "layer_role": "BASE",
      "color_role": "NEUTRO",
      "fit": "REGULAR",
      "style_base": "CASUAL",
      "silhueta": "H",
      "comprimento": "REGULAR",
      "ocasiao": "CASUAL",
      "estacao": "SUMMER",
      "material_principal": "ALGODAO",
      "eco_score": "GOOD",
      "faixa_preco": "STANDARD",
      "nome": "Calça Jeans Azul",
      "lojaId": "[VALID_LOJA_ID]"
    }'
  
  # Deve retornar 201 com SKU gerado
  ```

- [ ] **Testar Validação de Dicionário**
  ```bash
  curl -X POST \
    'http://localhost:3000/api/produtos' \
    -d '{
      "categoria": "XXX",  # Inválido
      ...
    }'
  
  # Deve retornar 400:
  # {
  #   "message": "Valores não encontrados nos dicionários",
  #   "erros": ["Categoria inválida: XXX"],
  #   "dica": "..."
  # }
  ```

- [ ] **Testar Campos Obrigatórios**
  ```bash
  curl -X POST \
    'http://localhost:3000/api/produtos' \
    -d '{
      "categoria": "CAM",
      # Faltam campos
      ...
    }'
  
  # Deve retornar 400:
  # {
  #   "message": "Campos obrigatórios do SKU STYLEME ausentes: linha, cor_codigo, ...",
  #   "exemplo": {...}
  # }
  ```

- [ ] **Testar Duplicata**
  ```bash
  # Criar 2x o mesmo produto
  # Primeira requisição: Sucesso 201
  # Segunda requisição: Erro 400
  # {
  #   "message": "SKU STYLEME já existe no sistema",
  #   "skuDuplicado": "CAM-F-PRT-M-001-F24"
  # }
  ```

- [ ] **Listar Produtos da Loja**
  ```bash
  curl -X GET \
    'http://localhost:3000/api/produtos/loja/[LOJA_ID]' \
    -H 'Authorization: Bearer [TOKEN]'
  
  # Deve retornar array com produtos criados
  ```

- [ ] **Atualizar Produto**
  ```bash
  curl -X PUT \
    'http://localhost:3000/api/produtos/[PRODUTO_ID]' \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer [TOKEN]' \
    -d '{
      "nome": "Camiseta Atualizada",
      "faixa_preco": "PREMIUM"
    }'
  
  # Deve retornar 200 com produto atualizado
  ```

- [ ] **Deletar Produto**
  ```bash
  curl -X DELETE \
    'http://localhost:3000/api/produtos/[PRODUTO_ID]' \
    -H 'Authorization: Bearer [TOKEN]'
  
  # Deve retornar 200:
  # {
  #   "message": "Produto removido com sucesso",
  #   "skuDeletado": "CAM-F-PRT-M-001-F24"
  # }
  ```

### ✅ FASE 5: FRONTEND (OPCIONAL - Se Tiver)

- [ ] **Componente de Cadastro**
  - [ ] Carrega dicionários ao montar
  - [ ] Dropdowns populados
  - [ ] SKU preview atualiza em tempo real
  - [ ] Validação de campos
  - [ ] Upload de imagem

- [ ] **Integração com ProductController**
  - [ ] Envia dados corretos
  - [ ] Trata erros corretamente
  - [ ] Exibe SKU gerado ao usuário

### ✅ FASE 6: DOCUMENTAÇÃO

- [ ] **Documentação Técnica**
  - [ ] SKU_STYLEME_V1_REFERENCIA_TECNICA.md ✅ Criado
  - [ ] API_EXEMPLOS_USO_SKU_STYLEME.md ✅ Criado
  - [ ] Compartilhado com team

- [ ] **README Atualizado**
  - [ ] Adicionar seção "SKU STYLEME"
  - [ ] Link para documentação

## 🎯 CHECKLIST DE SEGURANÇA

- [ ] **Autenticação**
  ```bash
  # Testar sem token
  curl -X POST 'http://localhost:3000/api/produtos' -d '{...}'
  # Deve retornar 401 Unauthorized
  ```

- [ ] **Permissões**
  ```bash
  # Criar com lojaId que não pertence ao usuário
  # Deve retornar 403 Forbidden
  ```

- [ ] **Validação de Input**
  ```bash
  # Enviar SQL injection / XSS
  "nome": "<script>alert('xss')</script>"
  # Deve ser escapado/validado
  ```

- [ ] **Imagens**
  ```bash
  # Testar upload com arquivo grande (>10MB)
  # Deve rejeitar com erro apropriado
  ```

## 📋 PRÉ-LANÇAMENTO FINAL

### Documentação ✅
- [ ] Arquivo técnico: `SKU_STYLEME_V1_REFERENCIA_TECNICA.md`
- [ ] Exemplos de uso: `API_EXEMPLOS_USO_SKU_STYLEME.md`
- [ ] Resumo: `IMPLEMENTACAO_SKU_STYLEME_V1_RESUMO.md`

### Código ✅
- [ ] Modelo: `server/models/Produto.js`
- [ ] Dicionário: `server/models/DicionarioStyleMe.js`
- [ ] Utilitários: `server/utils/skuStyleMeUtils.js`
- [ ] Controller: `server/controllers/produtoController.js`
- [ ] Router: `server/routes/produtoRouter.js`

### Banco de Dados ✅
- [ ] Seed script: `server/scripts/seedDicionarios.js`
- [ ] ~300 dicionários inseridos
- [ ] Índices criados

### Testes ✅
- [ ] API completa testada
- [ ] Validações funcionando
- [ ] Permissões validadas
- [ ] Erro handling OK

## 🚀 INSTRUÇÕES DE LANÇAMENTO

### 1. Preparar Ambiente
```bash
cd server
npm install  # Se novos pacotes
node scripts/seedDicionarios.js  # Popular dicionários
npm start    # Iniciar servidor
```

### 2. Validar Health Check
```bash
curl http://localhost:3000/health
# Deve retornar OK
```

### 3. Testar Primeiro Produto
```bash
# Usar requests de teste (já documentados)
# Verificar resposta correta
```

### 4. Comunicar Time
```
"SKU STYLEME v1 agora live!"
- Novo sistema de identificação de produtos
- Link documentação: ...
- Exemplos: ...
```

## 📞 SUPORTE

### Se Tiver Erro

**"SKU já existe"**
→ Verificar se tentou cadastrar duplicado
→ Usar GET /api/produtos/sku-sugestao para novo

**"Valores não encontrados nos dicionários"**
→ Verificar valores com GET /api/dicionarios
→ Usar dropdowns para validação

**"Campos obrigatórios ausentes"**
→ Enviar: categoria, linha, cor_codigo, tamanho, colecao
→ Enviar: layer_role, color_role, fit, style_base

---

## ✨ SUCESSO!

Se todos os checkboxes estão ✅, você está pronto para:
- ✅ Colocar em produção
- ✅ Começar a cadastrar produtos com SKU STYLEME
- ✅ Preparar frontend para usar dicionários
- ✅ Iniciar recomendação v1

**Data de Conclusão:** _________________  
**Responsável:** _________________  
**Aprovação:** _________________

---

**Documento:** Checklist de Ativação SKU STYLEME v1  
**Versão:** 1.0  
**Data:** 2026-01-17

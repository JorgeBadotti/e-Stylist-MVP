# 🧪 Guia Prático de Testes - Cadastro de Loja

## Pré-requisitos
- Backend rodando em `http://localhost:3000`
- Frontend rodando em `http://localhost:3000` (ou sua porta de desenvolvimento)
- MongoDB conectado
- Navegador moderno

---

## 📋 Teste 1: Cadastro como Loja (Happy Path)

### Passos
1. Acesse a página de registro
2. Clique no rádio button **"Loja"**
3. Verifique que:
   - Título muda para "Cadastre sua Loja"
   - Subtítulo muda para "Comece a vender no e-Stylist."
   - Campos de "Telefone" e "CNPJ" aparecem
   - Opção Google desaparece
4. Preencha os campos:
   ```
   Nome da Loja: Test Store 2024
   Email: teststore@example.com
   Telefone: (11) 98765-4321
   CNPJ: 11.222.333/0001-44
   Senha: TestPassword123!
   Confirmar Senha: TestPassword123!
   ```
5. Marque "Concordo com os termos"
6. Clique "Cadastrar Loja"

### Resultado Esperado
- ✅ Mostrar spinner "Criando conta..."
- ✅ Após sucesso, tela "Conta Criada!" com check verde
- ✅ Mensagem: "Seu cadastro foi realizado com sucesso. Agora você pode fazer login."
- ✅ Botão "Ir para Login"

### Validações no Backend
```bash
# Conecte ao MongoDB e verifique:
db.usuarios.findOne({ email: "teststore@example.com" })
# Deve retornar: { role: "STORE_ADMIN", ... }

db.lojas.findOne({ cnpj: "11.222.333/0001-44" })
# Deve retornar: { nome: "Test Store 2024", usuario: ObjectId(...) }
```

---

## 📋 Teste 2: Alternar entre Usuário e Loja

### Passos
1. Selecione "Loja" → Veja os campos Telefone/CNPJ
2. Preencha alguns dados
3. Clique em "Usuário"
4. Verifique que:
   - Campos Telefone e CNPJ **desaparecem**
   - Título volta para "Crie sua conta"
   - Opção Google volta a aparecer
   - Dados de Telefone/CNPJ ainda estão no estado (não prejudica)
5. Clique em "Loja" novamente
6. Verifique que campos voltam e dados foram preservados

### Resultado Esperado
- ✅ Transição suave entre modos
- ✅ Dados preservados ao alternar
- ✅ UI se adapta corretamente

---

## 📋 Teste 3: Validação - Campos Obrigatórios (Loja)

### Cenário 1: Sem Telefone
1. Selecione "Loja"
2. Preencha:
   - Nome da Loja: Loja Teste
   - Email: loja@teste.com
   - CNPJ: 12.345.678/0001-90
   - Senha: Pass123!
   - Confirmar: Pass123!
   - **NÃO preencha Telefone**
3. Clique "Cadastrar Loja"

**Resultado**: Erro: "Telefone e CNPJ são obrigatórios para cadastro de loja."

### Cenário 2: Sem CNPJ
1. Selecione "Loja"
2. Preencha:
   - Nome da Loja: Loja Teste
   - Email: loja@teste.com
   - Telefone: (11) 99999-9999
   - Senha: Pass123!
   - Confirmar: Pass123!
   - **NÃO preencha CNPJ**
3. Clique "Cadastrar Loja"

**Resultado**: Erro: "Telefone e CNPJ são obrigatórios para cadastro de loja."

### Cenário 3: Senhas Não Coincidem
1. Selecione "Loja"
2. Preencha:
   - Nome da Loja: Loja Teste
   - Email: loja@teste.com
   - Telefone: (11) 99999-9999
   - CNPJ: 12.345.678/0001-90
   - Senha: Pass123!
   - Confirmar Senha: Different123!
3. Clique "Cadastrar Loja"

**Resultado**: Erro: "As senhas não coincidem."

---

## 📋 Teste 4: Erro - Email Duplicado

### Passos
1. Selecione "Loja"
2. Use um email que **já existe** (ex: admin@example.com)
3. Preencha outros campos corretamente:
   ```
   Nome: Loja Duplicada
   Email: admin@example.com  ← Email existente
   Telefone: (11) 99999-9999
   CNPJ: 99.999.999/9999-99
   Senha: Pass123!
   ```
4. Clique "Cadastrar Loja"

### Resultado Esperado
- ✅ Error box em vermelho
- ✅ Mensagem: "Este e-mail já está em uso."

---

## 📋 Teste 5: Erro - CNPJ Duplicado

### Passos
1. Selecione "Loja"
2. Use um CNPJ que **já existe** (ex: 11.222.333/0001-44 do Teste 1)
3. Preencha outros campos corretamente:
   ```
   Nome: Outra Loja
   Email: outralojaGHI@example.com
   Telefone: (11) 98888-8888
   CNPJ: 11.222.333/0001-44  ← CNPJ duplicado
   Senha: Pass123!
   ```
4. Clique "Cadastrar Loja"

### Resultado Esperado
- ✅ Error box em vermelho
- ✅ Mensagem: "Este CNPJ já está cadastrado."

---

## 📋 Teste 6: Cadastro como Usuário (Fluxo Original)

### Passos
1. Acesse a página de registro
2. **Mantenha "Usuário" selecionado** (padrão)
3. Verifique que:
   - Campos Telefone/CNPJ não aparecem
   - Opção Google aparece
   - Botão diz "Criar Conta"
4. Preencha:
   ```
   Nome Completo: João Silva
   Email: joao@example.com
   Senha: Pass123!
   Confirmar: Pass123!
   ```
5. Marque "Concordo com os termos"
6. Clique "Criar Conta"

### Resultado Esperado
- ✅ Cadastro realizado normalmente
- ✅ Usuário recebe role "USER" (não STORE_ADMIN)
- ✅ Tela de sucesso aparece

---

## 📋 Teste 7: Login após Cadastro de Loja

### Passos (após Teste 1 bem-sucedido)
1. Na tela "Conta Criada!", clique "Ir para Login"
2. Use as credenciais:
   ```
   Email: teststore@example.com
   Senha: TestPassword123!
   ```
3. Clique "Entrar"

### Resultado Esperado
- ✅ Login realizado com sucesso
- ✅ Usuário redirecionado para home/dashboard
- ✅ Role `STORE_ADMIN` está presente na sessão
- ✅ Pode acessar funcionalidades de loja

---

## 📋 Teste 8: Força da Senha

### Passos (para ambos usuário e loja)
1. Comece a digitar a senha no campo
2. Observe a barra de força:
   - **Vermelha**: Muito Fraca (< 6 caracteres)
   - **Laranja**: Fraca (6+ caracteres)
   - **Amarela**: Média (9+ caracteres + maiúscula)
   - **Verde claro**: Forte (+ números)
   - **Verde escuro**: Muito Forte (+ caracteres especiais)
3. Teste com:
   - `pass` → Muito Fraca
   - `password` → Média
   - `Password1` → Forte
   - `P@ssw0rd!` → Muito Forte

### Resultado Esperado
- ✅ Barra de força atualiza em tempo real
- ✅ Cores correspondem aos níveis

---

## 📋 Teste 9: Responsividade

### Passos
1. Abra a página em diferentes tamanhos:
   - Desktop (1920px)
   - Tablet (768px)
   - Mobile (375px)
2. Teste alternar entre Usuário/Loja
3. Verifique que:
   - Layout adapta bem
   - Campos são acessíveis
   - Toggle é visível e funcional
   - Botões são clicáveis

### Resultado Esperado
- ✅ Tudo funciona em todos os tamanhos
- ✅ Sem overflow ou corte de conteúdo
- ✅ Sem scroll horizontal

---

## 📋 Teste 10: Consistência de Mensagens de Erro

### Cenários de Erro
```javascript
// Frontend
"As senhas não coincidem."
"Você precisa aceitar os termos de serviço."
"Telefone e CNPJ são obrigatórios para cadastro de loja."

// Backend (lojaController.registerStore)
"Todos os campos são obrigatórios: Nome, E-mail, Senha, Telefone e CNPJ."
"Este e-mail já está em uso."
"Este CNPJ já está cadastrado."
"Erro interno ao criar o usuário."
"Erro interno ao criar a loja."
```

### Verificação
- ✅ Mensagens aparecem corretamente
- ✅ Sem mensagens genéricas "Something went wrong"
- ✅ Mensagens são úteis para o usuário

---

## 🐛 Troubleshooting

### Problema: Campos de Loja não aparecem
**Solução**: Verifique se o estado `isStoreRegister` está sendo atualizado corretamente
```tsx
// No console
console.log(isStoreRegister) // Deve ser true quando Loja está selecionado
```

### Problema: Cadastro não funciona
**Solução**: Verifique os logs
```bash
# Terminal do backend
# Deve aparecer POST /loja/register com status 201
```

### Problema: Email/CNPJ duplicado não valida
**Solução**: Certifique-se que MongoDB está rodando e conectado
```bash
# Verifique se há dados prévios
db.usuarios.count()
db.lojas.count()
```

### Problema: Página não carrega após cadastro
**Solução**: Verifique CORS e credenciais
```typescript
// Em api.ts, withCredentials deve ser true
withCredentials: true
```

---

## 📊 Checklist de Validação Final

```
FUNCIONALIDADE
☐ Toggle Usuário/Loja aparece
☐ Campos aparecem/desaparecem corretamente
☐ Título muda conforme seleção
☐ Botão muda conforme seleção
☐ Google OAuth desaparece para Loja

VALIDAÇÃO
☐ Campos obrigatórios funcionam
☐ Validação de senha funciona
☐ Força da senha mostra corretamente
☐ Mensagens de erro aparecem

BACKEND
☐ Usuario criado com role STORE_ADMIN
☐ Loja criada e associada ao usuario
☐ Email duplicado rejeitado
☐ CNPJ duplicado rejeitado
☐ Transação é atômica (consistência)

LOGIN
☐ User pode fazer login após cadastro
☐ Session/Cookie criado corretamente
☐ Role presente na resposta /me

EXPERIÊNCIA
☐ UI responsiva em mobile/tablet/desktop
☐ Transições suaves
☐ Sem delays desnecessários
☐ Mensagens claras
☐ Sem console errors
```

---

## 🚀 Próximas Etapas

Após validar tudo acima:
1. **Deploy**: Fazer merge na main
2. **Documentação**: Atualizar docs de API
3. **Analytics**: Monitorar taxa de cadastro de lojas
4. **Melhorias**: Considerar validação de CNPJ real

---

*Último atualizado: 17 de janeiro de 2026*

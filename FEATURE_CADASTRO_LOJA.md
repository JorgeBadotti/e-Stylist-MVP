# Feature: Cadastro de Loja no Frontend

## 🎯 Objetivo
Permitir que usuários se cadastrem diretamente como loja na página de registro, com os campos específicos necessários (telefone e CNPJ).

## ✅ Etapas Implementadas

### 1. **Estender Tipos TypeScript** ✓
**Arquivo**: `client/src/types/types.ts`

Adicionadas duas novas interfaces:
```typescript
export interface RegisterUserData {
  nome: string;
  email: string;
  password: string;
}

export interface RegisterStoreData extends RegisterUserData {
  telefone: string;
  cnpj: string;
}
```

### 2. **Criar Função API para Registro de Loja** ✓
**Arquivo**: `client/src/services/api.ts`

Adicionada a função que chama o endpoint do backend:
```typescript
export const registerStore = async (storeData: {
    nome: string;
    email: string;
    password: string;
    telefone: string;
    cnpj: string;
}) => {
    const response = await api.post('/loja/register', storeData);
    return response.data;
};
```

### 3. **Modificar Componente Register** ✓
**Arquivo**: `client/components/Register.tsx`

#### Alterações:
1. **Novos Estados**:
   - `isStoreRegister`: Controla se está em modo de cadastro de loja
   - `phone`: Armazena o telefone
   - `cnpj`: Armazena o CNPJ

2. **Toggle Visual**: Adicionado seletor de tipo de cadastro (Usuário ou Loja) com estilo visual claro

3. **Campos Condicionais**: Telefone e CNPJ aparecem apenas quando "Loja" está selecionado

4. **Validação**: Verifica se telefone e CNPJ foram preenchidos ao tentar se cadastrar como loja

5. **Lógica de Submit**:
   - Se `isStoreRegister` é true → chama `registerStore()`
   - Caso contrário → chama endpoint de cadastro de usuário comum

6. **UI Responsiva**:
   - Título e descrição mudam conforme o tipo selecionado
   - Botão de submit muda o texto ("Criar Conta" vs "Cadastrar Loja")
   - Opção do Google é ocultada para cadastro de loja (não se aplica)

## 🔧 Fluxo de Funcionamento

### Usuário Comum
```
Seleciona "Usuário" → Preenche Nome, Email, Senha → Clica "Criar Conta"
→ POST /auth/register → Sucesso → Tela de sucesso → Login
```

### Loja
```
Seleciona "Loja" → Preenche Nome da Loja, Email, Telefone, CNPJ, Senha
→ Clica "Cadastrar Loja" → POST /loja/register → Sucesso 
→ Tela de sucesso → Login com email/senha
```

## 🧪 Como Testar

### Teste 1: Cadastro de Loja com Sucesso
1. Abra a página de registro
2. Selecione "Loja"
3. Preencha os campos:
   - Nome da Loja: "Minha Loja Teste"
   - Email: "loja@teste.com"
   - Telefone: "(11) 99999-9999"
   - CNPJ: "12.345.678/0001-90"
   - Senha: "Senha@123"
   - Confirmar Senha: "Senha@123"
4. Marque "Concordo com os termos"
5. Clique "Cadastrar Loja"
6. Deve ver mensagem de sucesso

### Teste 2: Validação de Campos Obrigatórios
1. Selecione "Loja"
2. Deixe Telefone ou CNPJ vazio
3. Tente clicar "Cadastrar Loja"
4. Deve aparecer erro: "Telefone e CNPJ são obrigatórios para cadastro de loja"

### Teste 3: CNPJ Duplicado
1. Tente cadastrar com um CNPJ que já existe
2. Deve aparecer erro: "Este CNPJ já está cadastrado"

### Teste 4: Email Duplicado
1. Tente cadastrar com um email que já existe
2. Deve aparecer erro: "Este e-mail já está em uso"

### Teste 5: Cadastro de Usuário Comum Continua Funcionando
1. Selecione "Usuário"
2. Preencha apenas Nome, Email e Senha
3. Campos de Telefone e CNPJ desaparecem
4. Botão muda para "Criar Conta"
5. Clique e deve funcionar normalmente

## 📋 Checklist de Validação

- [ ] Toggle "Usuário/Loja" aparece corretamente
- [ ] Campos de Telefone e CNPJ aparecem/desaparecem conforme seleção
- [ ] Validação de campos obrigatórios funciona
- [ ] Cadastro de loja cria usuário com role "STORE_ADMIN"
- [ ] Cadastro de loja cria registro na coleção "Loja"
- [ ] Usuário pode fazer login após cadastro como loja
- [ ] Cadastro de usuário comum continua funcionando
- [ ] Mensagens de erro são claras e úteis
- [ ] Tela de sucesso aparece em ambos os casos

## 🔌 Endpoint Backend Utilizado

**POST** `/loja/register`

### Request Body:
```json
{
  "nome": "string",
  "email": "string",
  "password": "string",
  "telefone": "string",
  "cnpj": "string"
}
```

### Response Success (201):
```json
{
  "message": "Lojista cadastrado com sucesso!",
  "usuario": {
    "id": "userId",
    "email": "email@example.com",
    "role": "STORE_ADMIN"
  },
  "loja": {
    "_id": "lojaId",
    "nome": "Nome da Loja",
    "cnpj": "12.345.678/0001-90",
    "telefone": "(11) 99999-9999",
    "usuario": "userId"
  }
}
```

## 📝 Notas Importantes

1. **Role do Usuário**: Usuários cadastrados como loja recebem a role `STORE_ADMIN`
2. **Validações**: O backend valida duplicatas de email e CNPJ
3. **Transação**: Se a criação da loja falhar, o usuário é deletado para evitar inconsistência
4. **Login**: O usuário faz login com email e senha, como qualquer outro usuário

## 🚀 Próximas Melhorias (Opcional)

- [ ] Validação de CNPJ no frontend (formato)
- [ ] Validação de telefone no frontend (formato)
- [ ] Mascara automática para CNPJ e telefone
- [ ] Verificação de CNPJ em real-time (debounce)
- [ ] Seleção de categoria de loja
- [ ] Upload de logo da loja no cadastro
- [ ] Verificação de email em real-time

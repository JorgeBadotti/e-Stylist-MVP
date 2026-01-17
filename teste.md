 PROPOSTA TÉCNICA: SKU STYLEME v1
🎯 RESUMO EXECUTIVO
Unificação dos modelos Produto, Roupa e Loja em um sistema de SKU técnico baseado em:

Identidade única: SKU STYLEME
Medidas reais: Corpo + Peça + Folga
Dicionários controlados: Eliminação de variações
Escalabilidade nativa para IA
1️⃣ ARQUITETURA DE DADOS
1.1 Estrutura Lógica Principal
1.2 Entidades Principais
A) SKU STYLEME (Substitui: Produto + Roupa)
B) TAMANHO COMERCIAL PADRÃO (Dicionário)
C) ESTOQUE EM LOJA
D) MAPEAMENTO: SKU STYLEME → MÚLTIPLAS LOJAS
2️⃣ IMPLANTAÇÃO NAS TELAS (UX + DADOS)
2.1 TELA "CADASTRO DE SKU" (Substitui Produto + Roupa)
Fluxo Simplificado
Campos Obrigatórios vs Opcionais
Campo	Obrigatório	Fonte	Validação
Categoria	✓	Dict	Dropdown
Tipo	✓	Dict por Categoria	Dropdown
Medidas (cm)	✓	Manual + IA	Range plausível
Material	✓	Dict	Dropdown
Cor	✓	Dict	Dropdown
Folga	✗	Manual	Texto/Dropdown
Estampa	✗	Dict	Dropdown
Cuidados	✗	Auto (por material)	Texto sugerido
Validações Automáticas
Integração com IA
2.2 TELA "ESTOQUE E PREÇO" (Loja)
Substitui a gestão atual com foco em SKU STYLEME

Operações principais:

✓ Consultar estoque por SKU STYLEME
✓ Editar preço de venda (loja define)
✓ Ajustar quantidade manualmente
✓ Visualizar histórico de vendas
✓ Exportar relatório (Excel/PDF)
2.3 TELA "GUARDA-ROUPA DIGITAL" (Consumidor)
SKU STYLEME permite composição e recomendação inteligente

Funcionalidade técnica:

Usuário insere medidas corporais
Sistema compara com SKU.medidas + SKU.folga
Recomenda tamanho comercial correto
Monta looks automáticos com itens compatíveis
Sugere complementos baseado em colecao/estação
3️⃣ GOVERNANÇA E PADRONIZAÇÃO
3.1 Dicionários Controláveis (Data Governance)
Estrutura de um Dicionário
Processo de Evolução
3.2 Versionamento
4️⃣ BENEFÍCIOS TÉCNICOS E DE NEGÓCIO
Benefício	Métrica	Impacto
Redução de Trocas	Baseline: 15% → Meta: 5%	Economia em logística (50% redução)
Recomendação IA	Acurácia: 80%+	Aumento de satisfação do cliente
Padronização	1 SKU STYLEME vs N variações	Simplificação de gestão
Escalabilidade	+500% SKUs sem refatoração	Preparo para crescimento
Integração B2B	APIs para marketplaces	Venda multicanal
4.1 Exemplo: Redução de Trocas
Cenário ANTES (sem SKU STYLEME):

Cenário DEPOIS (com SKU STYLEME):

5️⃣ IMPLEMENTAÇÃO NO MVP
5.1 Roadmap (Fases)
Fase 1 (Sprint 1-2): Fundamentals

 Criar modelo SKUStyleMe no banco
 Criar dicionários base (Categoria, Tipo, Material, Cor)
 Tela de cadastro simplificada
 Validações básicas
Fase 2 (Sprint 3-4): Integração Loja

 Tela de estoque e preço (Loja)
 Mapeamento SKU ↔ Loja
 Cálculo de equivalências de tamanho
Fase 3 (Sprint 5-6): Guarda-Roupa Digital

 Recomendação básica (sem IA)
 Composição de looks
 Visualização de compatibilidade
Fase 4 (Sprint 7+): IA & Otimizações

 Sugestões de medidas por histórico
 Análise de foto (cor, estampa)
 Recomendações inteligentes
6️⃣ MODELO DE BANCO DE DADOS (MongoDB)
7️⃣ PRÓXIMOS PASSOS
Validação com Stakeholders

 Fábricas: Complexidade aceitável?
 Lojas: Reduz burocracia?
 Clientes: Recomendações funcionam?
Prototipagem

 Tela de cadastro (Figma)
 Fluxo de recomendação
 Relatórios de gestão
Desenvolvimento

 Modelo backend
 APIs RESTful
 Frontend React
Testes & Validação

 Teste A/B (com/sem SKU STYLEME)
 Taxa de devolução
 Satisfação do cliente
Fim da Proposta Técnica: SKU STYLEME v1
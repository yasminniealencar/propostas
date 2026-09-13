# v2.6.1 — Regras comerciais, acessos e recibos

- Markup padrão: ESTANTE 60%, GANCHO 50%, ARMÁRIO/ROUPEIRO/ARQUIVO 55%, demais 48%.
- Vendedor não recebe custo/markup do backend e não altera preço individual.
- Vendedor não vê valor no catálogo; preço aparece no orçamento.
- Nome/Razão Social, CPF/CNPJ e Endereço obrigatórios.
- Perfis: Dono/ADM, Administrador, Gerente e Vendedor.
- Minailde/Yasmin = Gerente; Saimon = Administrador; Marilene = Dono/ADM quando existir.
- Gerente pode criar vendedores; ADM/Dono pode criar qualquer perfil.
- Nota de entrega convertida para Recibo de Entrega e Recebimento.
- Para criação de usuários, configure no Cloudflare Pages o segredo SUPABASE_SECRET_KEY.
Nunca coloque a Secret Key no GitHub ou config.js.


## v2.6.1.1 — Hotfix de inicialização
- corrige a inicialização automática do Supabase;
- aguarda `config.js` e `supabase-js` estarem disponíveis antes do login;
- faz tentativas automáticas em caso de atraso momentâneo;
- elimina a necessidade de executar `bootstrapV2()` manualmente no Console.


## v2.6.1.2 — correção definitiva do carregamento
Foi corrigido um erro de JavaScript que interrompia a execução antes do `bootstrapV2()`.
O problema estava em duas funções visuais do catálogo que eram referenciadas antes de existirem.
Agora a inicialização ocorre automaticamente sem precisar abrir o Console.


## v2.6.2 — Gestão total de usuários
ADM e Dono passam a controlar logins diretamente pelo aplicativo:
- criar login;
- editar nome, usuário e perfil;
- editar telefone, e-mail comercial, comissão e meta;
- ativar/inativar usuário;
- marcar troca obrigatória de senha;
- redefinir senha sem conhecer a anterior;
- excluir login;
- preservar histórico de orçamentos ao excluir o acesso.

### Segurança
A rota administrativa é `functions/api/manage-user.js`.
Ela exige sessão válida de ADM/Dono e usa `SUPABASE_SECRET_KEY` somente no Cloudflare.
Gerentes continuam podendo criar vendedores, mas não redefinir/excluir logins existentes.
O sistema bloqueia a exclusão do próprio login que está em uso.


## v2.7 — Kanban Comercial
Nova etapa do roadmap.

### Funil visual
- Rascunho
- Enviado
- Visualizado
- Em negociação
- Aprovado
- Perdido (status interno Reprovado)
- Entregue

### Recursos
- arrastar cartões entre etapas no desktop;
- seletor de etapa para tablet/celular;
- sincronização da etapa com Supabase sem reatribuir o dono do orçamento;
- filtros por vendedor, período e busca;
- total financeiro por coluna;
- pipeline aberto;
- leads quentes por número de visualizações;
- alerta para propostas abertas há 7 dias ou mais;
- integração com o rastreamento de propostas;
- acesso rápido ao orçamento e histórico de visualizações;
- vendedores continuam vendo apenas os próprios dados conforme RLS.


## v2.8 — Kits por tipo de loja
Nova etapa do roadmap.

### Gestão
- ADM e Gerente podem criar, editar, duplicar, ativar/inativar e excluir kits;
- Vendedor pode visualizar e usar kits ativos;
- cada kit possui Nome, Tipo de Loja, Descrição e composição de produtos;
- quantidade padrão por produto;
- busca por produto no catálogo.

### Uso comercial
- visualização da composição;
- vendedor não vê preço fora do orçamento;
- ADM/Gerente vê estimativa do kit;
- seleção obrigatória de cliente completo;
- geração de orçamento em um clique;
- preço comercial é obtido pela política vigente no momento da geração;
- observação do orçamento registra o kit e o tipo de loja utilizados.

### Banco
Execute `inovar_v2_8_kits_tipo_loja.sql` antes de usar os kits online.


## v2.8.1 — Hotfix Cliente → Orçamento
Corrige `quotes_client_id_fkey`.

Antes de salvar qualquer orçamento online, o aplicativo verifica se o cliente selecionado
já existe na tabela `clients`. Se o cadastro estiver apenas no cache/local, ele é sincronizado
primeiro e somente depois o orçamento é gravado.

Isso corrige o fluxo:
Kit → selecionar cliente → gerar orçamento → salvar orçamento.

Não requer alteração de banco/SQL.


## v2.8.2 — Correção Produto → Item de Orçamento
Corrige `quote_items_product_id_fkey`.

Antes de gravar os itens, o app valida os `product_id` contra o catálogo do Supabase.
Se um ID legado não existir mais:
1. tenta religar pelo código do produto;
2. tenta religar pelo nome exato + fabricante;
3. para ADM/Gerente, preserva o item como item livre se não houver correspondência;
4. para Vendedor, bloqueia com mensagem clara, pois vendedor não pode criar item livre.

Novos kits também passam a guardar código, nome e fabricante dentro do JSON, além do ID,
para permitir reparo de vínculo no futuro.


## v2.8.3 — Proteção de Dados e Backups
Esta versão corrige o risco de perda visual de orçamentos locais durante o carregamento do Supabase.

### Proteções
- cria snapshot automático ANTES de carregar a nuvem;
- mantém até 12 cópias internas no navegador;
- orçamentos que existem somente localmente não são descartados;
- registros locais ausentes na nuvem aparecem como pendentes;
- sincronização de pendentes é explícita e não apaga registros existentes;
- importação de JSON passa a ser por mesclagem segura, sem substituir toda a base;
- cria backup antes de importar e antes de restaurar dados iniciais;
- painel "Segurança de dados" com download e recuperação de registros ausentes.

### Importante
O Supabase continua sendo a fonte principal dos registros online.
A camada local atua como proteção contra perda durante migrações, deploys e sincronizações.
Não requer SQL novo.


## v2.8.4 — Correção `quote_items_pkey`
Corrige o erro:
`duplicate key value violates unique constraint "quote_items_pkey"`.

### Causa encontrada
A função de duplicar orçamento copiava também os IDs internos dos itens.
Como `quote_items.id` é chave primária global no Supabase, salvar a cópia podia tentar
usar a mesma chave de um item pertencente ao orçamento original.

### Correções
- orçamento duplicado recebe IDs novos em todos os itens;
- backups/rascunhos antigos têm IDs reparados automaticamente ao salvar;
- IDs que pertençam a outro orçamento são substituídos;
- salvamento de itens passa de `DELETE + INSERT` para estratégia idempotente de `UPSERT`;
- somente itens removidos da proposta são apagados depois;
- repetir "Salvar" não deve gerar colisão de chave primária;
- mantém a camada v2.8.3 de proteção e backups.

Não requer SQL novo.


## v2.8.5 — Compartilhamento sem regravar itens
Corrige o erro `permission denied for table quote_items` ao:
- Enviar proposta pelo WhatsApp;
- Copiar link público.

### Causa
`ensurePublicShare()` chamava `cloudSaveQuote()`, o que regravava todos os itens apenas para
ativar o link público.

### Correção
Agora o compartilhamento atualiza somente:
- `quotes.public_token`;
- `quotes.public_enabled`;
- `quotes.status` (Rascunho → Enviado).

A geração do link não acessa mais `quote_items`.
Não requer SQL novo.


## v2.9 — Design Premium + Hardening
- redesign visual e mobile;
- indicador de sincronização;
- barra fixa de ações no orçamento em celular;
- proteção contra duplo clique e saída sem salvar;
- validação/sanitização de valores;
- cliente identificado por ID/CPF-CNPJ;
- vendedor travado ao próprio perfil;
- exclusão cloud-first e tombstones;
- correção de recuperação de backup;
- snapshots compactos;
- upload de imagens limitado e otimizado;
- mensagens de erro amigáveis;
- alerta de edição em múltiplas abas.

Não requer SQL novo. Mantenha a pasta `functions/` atual no GitHub.


## v2.9.1 — Imagens de referência S.A.
- os itens S.A. sem foto passam a exibir uma imagem relacionada à família do produto;
- a interface identifica claramente essas imagens como **imagem de referência**;
- foto real cadastrada no produto sempre tem prioridade;
- nova tela **Revisão de imagens** para conferir o catálogo por código/categoria;
- não altera preços, clientes, orçamentos ou permissões;
- não exige SQL.

As referências são provisórias e serão substituídas progressivamente por imagens exatas.


## v2.9.2 — Itens isolados S.A.
- substitui referências genéricas por família por ilustrações isoladas por item/tipo;
- revisão visual mais específica para os 536 itens S.A.;
- fotos exatas continuam tendo prioridade quando cadastradas;
- não exige SQL.

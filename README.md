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

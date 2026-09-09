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

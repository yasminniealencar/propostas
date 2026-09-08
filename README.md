# Inovar Gôndolas — Orçamentos Online

Frontend do sistema comercial conectado ao Supabase `inovar-propostas`.

## URL temporária
https://yasminniealencar.github.io/propostas/

## Configuração atual
- Supabase: `https://kmussdssbssgkvxcqlsk.supabase.co`
- Publishable key: configurada em `config.js`
- Login por usuário: `saimon`, `minailde`, `yasmin`
- `demoMode: false`
- Link público de proposta aponta temporariamente para GitHub Pages.

## Domínio final
Quando o DNS estiver pronto, criar um arquivo `CNAME` na raiz com:

`propostas.inovargondolas.com.br`

E trocar `publicBaseUrl` em `config.js` para:

`https://propostas.inovargondolas.com.br`

## Segurança
Nunca publicar uma chave `sb_secret_...` ou Service Role neste repositório.


## v2.2
Correção da paginação do Supabase: o catálogo agora carrega todos os registros (não apenas os primeiros 1.000). A mesma paginação foi aplicada a vendedores, clientes, orçamentos, itens e entregas.

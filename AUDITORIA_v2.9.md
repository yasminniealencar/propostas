# Auditoria funcional e UX — Inovar Gôndolas v2.9

## Problemas corrigidos
1. Duplo clique/toque em Salvar, WhatsApp e Copiar link.
2. Saída da tela/fechamento com alterações não salvas.
3. Associação errada quando há dois clientes com o mesmo nome.
4. Vendedor alterando o vendedor responsável na proposta.
5. Gerente/ADM alterando o nome do vendedor sem atualizar `seller_id`.
6. Exclusão local antes da confirmação do Supabase.
7. Orçamento excluído reaparecendo após merge local/nuvem.
8. `ReferenceError` em recuperação de backup (`localSnapshotBeforeCloud`).
9. Backups automáticos ocupando localStorage demais por imagens base64.
10. Upload de imagem sem limite ou otimização.
11. Quantidade, frete, desconto, preço e markup fora de faixas válidas.
12. Origem de imagem insegura em backups/importações.
13. Número local de orçamento duplicado no estado carregado.
14. Mensagens técnicas de banco expostas ao usuário.
15. Alteração do mesmo orçamento em duas abas sem aviso.

## Melhorias de design
- sidebar e navegação com hierarquia mais clara;
- topbar com indicador de sincronização;
- hero comercial no dashboard;
- cards/KPIs/painéis refinados;
- formulários e foco visual melhorados;
- resumo do orçamento mais limpo;
- barra fixa mobile com Salvar / WhatsApp / Link;
- catálogo, Kanban, Planner e proposta pública refinados;
- melhor navegação por teclado e suporte a `prefers-reduced-motion`.

## Próximas melhorias estruturais recomendadas
- gerar a numeração do orçamento no banco via sequence/RPC para unicidade absoluta entre usuários;
- controle de versão `updated_at/version` para conflito de edição entre dois dispositivos;
- suíte E2E em ambiente de homologação Supabase.

## Deploy
Esta v2.9 não exige SQL novo.
O pacote atualiza `index.html`, `config.js`, `README.md` e `.nojekyll`.
Mantenha a pasta `functions/` já existente no GitHub; ela não precisa ser alterada nesta versão.

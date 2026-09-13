# Inovar Gôndolas v2.9.3

## Imagens
- removida a funcionalidade de Revisão de imagens;
- removidas as ilustrações geradas da v2.9.2;
- a aplicação voltou ao comportamento da v2.9 para imagens:
  - foto cadastrada no produto;
  - foto real de referência da web quando já houver correspondência;
  - placeholder neutro quando não houver imagem;
- o catálogo poderá ser atualizado manualmente depois.

## Orçamento
Cada linha ganhou:
- **Editar item**
- **Trocar produto**

### ADM / Dono / Gerente
Pode modificar na própria proposta:
- descrição;
- código;
- fabricante;
- categoria;
- linha;
- cor/acabamento;
- foto por URL;
- quantidade;
- custo;
- acréscimo;
- preço de venda.

Essas mudanças afetam somente o orçamento atual.

### Vendedor
Pode:
- alterar quantidade;
- trocar o produto por outro item do catálogo.

Não pode:
- ver/editar custo;
- ver/editar acréscimo;
- editar preço manualmente;
- alterar livremente dados técnicos do produto.

## Banco
Não requer SQL.

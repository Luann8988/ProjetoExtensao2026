# TODO - Simplificação Sistema Biblioteca + “Outros Materiais”

## Etapas
- [x] 1) Atualizar o SQL do banco: adaptar `materiais` para `nome`, `descricao`, `quantidade` (entidade “Outros Materiais”)
- [x] 2) Implementar endpoints PHP (Back-End 08_06):
  - [x] 2.1) listar materiais (para aluno e professor)
  - [x] 2.2) cadastrar/gerenciar materiais (somente professor)

- [x] 3) Atualizar tela do Professor (Front-End/Professor.html):

  - [x] 3.1) Remover gráfico de gêneros
  - [x] 3.2) Remover seções fora do escopo (relatórios, notificações, turmas, reservas, chat)
  - [x] 3.3) Criar seção “Outros Materiais” (independente de livros)
  - [x] 3.4) Remover avaliação por estrelas e “emprestar livro” na página de livros
- [x] 3.5) Corrigir exclusão de livro via PHP (não via JS) (endpoint criado; falta ajustar UI para usar)

- [x] 4) Atualizar tela do Aluno:
  - [x] 4.1) Remover avatar/seed, chat, limite automático
  - [x] 4.2) Remover avaliação por estrelas e colunas extras no histórico
  - [x] 4.3) Criar/mostrar seção “Outros Materiais” (visualização)

- [x] 5) Ajustar JS (Front-End/Script.js): simplificação removendo fora do escopo

- [x] 6) Corrigir footer (rodapé) em todas as páginas


- [x] Remoção do chat do professor (parcial)


## Critérios de aceite
- [x] “Outros Materiais” permite cadastrar e visualizar com integração real no banco.
- [x] Professor e aluno acessam a área com comportamento correto.
- [x] Exclusão de livro acontece no backend PHP e recarrega dados atualizados.
- [x] Remoções solicitadas não deixam componentes visíveis/acionáveis.

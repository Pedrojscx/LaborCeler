# Protótipo do Lunar Celer

Código-fonte do protótipo visual, criado no canvas do projeto (02/10/2026, telas 7 e 8 acrescentadas em 03/10/2026). Desde 03/10/2026, os arquivos desta pasta são a fonte da verdade do protótipo: o canvas deixou de ser referência, e toda mudança de protótipo é feita aqui. É a referência visual de todas as telas descritas em `docs/telas.md`; telas 12, 15 a 19 e 21 alinhadas à spec da feature 007 em 03/10/2026. Não é código de produção: serve para portar layout, textos e estilos para as páginas reais em HTML, CSS e JavaScript puros.

## Como ler os arquivos

Cada tela é um arquivo `NomeDaTela.dc.html`. O formato é um HTML com algumas convenções do editor de protótipos:

- O conteúdo visível fica entre `<x-dc>` e `</x-dc>`. O bloco `<helmet>` traz fontes e estilos globais da tela.
- `{{ nome }}` é um valor calculado no script do fim do arquivo (função `renderVals`). Na página real, vira dado vindo da API ou estado do JavaScript.
- `<sc-for list="{{ itens }}" as="item">` repete o trecho para cada item da lista. Na página real, vira renderização com JavaScript a partir dos dados da API.
- `<sc-if value="{{ condicao }}">` mostra o trecho só quando a condição é verdadeira. Na página real, vira estado da tela.
- `onClick="{{ funcao }}"` e similares são eventos. Na página real, NÃO podem ficar no HTML (o CSP proíbe JavaScript inline): viram `addEventListener` em arquivos `.js`.
- `data-props` no script define controles de revisão (por exemplo, estado de erro ou visitante). Na página real, cada opção corresponde a um estado da tela.
- Os estilos estão inline por conveniência do protótipo. Na página real, devem virar classes em CSS a partir dos tokens de `docs/identidade-visual.md`.

## Arquivos

| Arquivo | Tela |
|---|---|
| Main.dc.html | Tela inicial |
| Cadastro.dc.html | Criar conta |
| Entrar.dc.html | Entrar |
| AreaCandidato.dc.html | Área do candidato |
| Termos.dc.html | Termos de uso e privacidade |
| AreaEstudos.dc.html | Área de estudos (tela 7) |
| AreaTema.dc.html | Página do tema (tela 8), com vídeo hospedado |
| EmBreve.dc.html | Disponível em breve |
| Confirmacao.dc.html | Antes de começar |
| Questao.dc.html | Questão com cronômetro |
| Correcao.dc.html | Correção da questão |
| Resultado.dc.html | Resultado final |
| Certificado.dc.html | Certificado |
| Validacao.dc.html | Validação pública |
| Historico.dc.html | Histórico |
| FlashcardsEscolha.dc.html | Flashcards: escolher |
| FlashcardsRevisao.dc.html | Flashcards: revisão |
| FlashcardsFim.dc.html | Flashcards: fim da sessão |
| Perfil.dc.html | Perfil e evolução |
| NaoEncontrada.dc.html | Página 404 |
| Instabilidade.dc.html | Página de instabilidade (503), estado da tela 20 |
| Notificacoes.dc.html | Padrão de notificações |

As versões de celular do protótipo apenas exibem estas mesmas telas em 390 px de largura, por isso não foram incluídas: o layout responsivo já está nos arquivos acima.

## Diferenças conhecidas em relação à implementação

- O cinza `#71717A` em textos pequenos deve virar `#8A8A93` (contraste AA), conforme `docs/identidade-visual.md`.
- O céu estrelado está embutido em cada arquivo; na implementação, vira um único `app/public/img/ceu.svg`.
- A Lua em rede é um SVG estático girando no plano; na implementação, é Canvas 2D com rotação em 3D.
- Os dados (nomes, números, questões e cartões) são fictícios ou ilustrativos.

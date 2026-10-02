# Kit de interface do Lunar Celer

Versão 1.0 (02/10/2026). Implementação real, em CSS e JavaScript puros, dos tokens e componentes de `docs/identidade-visual.md`. Toda página do portal usa este kit; o protótipo em `docs/prototipo/` mostra como as telas ficam, e este kit é o que se usa para construí-las.

Para ver tudo funcionando, abra `docs/kit-demo.html` direto no navegador (não precisa do servidor).

## Arquivos

```
app/public/kit/
├── css/
│   ├── tokens.css        variáveis de cor, tipografia, forma e movimento; fontes Inter
│   ├── base.css          página, céu, largura, tipografia, cabeçalho, rodapé, impressão
│   └── componentes.css   botões, chips, vidro, cartões, formulários, alertas, abas,
│                         notificações, cronômetro, marcos, barras, flashcard, tabelas
├── js/
│   ├── lua-rede.js       Lua em rede em Canvas 2D (LunarCeler.luaRede)
│   ├── abas.js           abas deslizantes com acompanhamento da rolagem (LunarCeler.abas)
│   ├── notificacoes.js   notificações (LunarCeler.notificar)
│   ├── cronometro.js     cronômetro em anel, só exibição (LunarCeler.cronometro)
│   └── formularios.js    mostrar e ocultar senha (LunarCeler.formularios)
├── fonts/                Inter 300, 400 e 500 em woff2 (latim) e licença OFL
└── img/                  céu (ceu.svg e duas camadas de brilho) e lua-rede.svg (reserva estática)
```

Os scripts são clássicos, sem módulos: cada um registra sua função em `window.LunarCeler`. Isso permite abrir a demonstração direto do disco e carregar os scripts com `<script src>` simples.

## Regras

- Ordem dos estilos: `tokens.css`, `base.css`, `componentes.css`, e depois o CSS próprio da página, se houver.
- Nenhum JavaScript inline (o CSP do helmet bloqueia): o código de cada página fica em `app/public/js/<pagina>.js` e usa `addEventListener`.
- Cores, tamanhos e tempos sempre pelas variáveis de `tokens.css`, nunca valores soltos.
- Texto vindo do servidor entra com `textContent`, nunca com `innerHTML`.
- Ao portar uma tela do protótipo, os estilos inline viram classes do kit; o que não existir no kit vira classe no CSS da página, usando os tokens.

## Esqueleto de página

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Título da página · Lunar Celer</title>
  <link rel="stylesheet" href="/kit/css/tokens.css">
  <link rel="stylesheet" href="/kit/css/base.css">
  <link rel="stylesheet" href="/kit/css/componentes.css">
</head>
<body>
<div class="lc-pagina">
  <div class="lc-ceu" aria-hidden="true">
    <div class="lc-ceu__estrelas"></div>
    <div class="lc-ceu__brilho"></div>
    <div class="lc-ceu__brilho lc-ceu__brilho--2"></div>
  </div>
  <header class="lc-cabecalho">...</header>
  <main class="lc-principal">...</main>
  <footer class="lc-rodape">
    <span class="lc-status">Portal no ar e banco conectado</span>
    <span>Projeto acadêmico da Fatec Jacareí</span>
    <span class="lc-rodape__links"><a href="/termos">Termos de uso e privacidade</a><a href="/validar">Validar certificado</a></span>
  </footer>
</div>
<script src="/kit/js/notificacoes.js"></script>
<script src="/js/pagina.js"></script>
</body>
</html>
```

- Céu parado (tela da questão): `<div class="lc-pagina lc-pagina--ceu-parado">`.
- Banco indisponível no rodapé: `<span class="lc-status lc-status--falha">Instabilidade no portal. Tente de novo em alguns minutos.</span>`.

## Componentes

| Componente | Classes |
|---|---|
| Botão principal e secundário | `lc-botao lc-botao--primario`, `lc-botao`; variações `--compacto`, `--bloco`; grupo `lc-botoes` |
| Chip de tema | `lc-chip` com `<span class="lc-ponto" style="--cor: #8C8A86">` |
| Rótulo de vidro | `lc-vidro`; ativo com `aria-pressed="true"` ou `is-ativo`; flutuação `lc-flutua`, `lc-flutua--defasado` |
| Cartões e bento | `lc-cartao`, `--discreto`, `--destaque`, `--vidro`; grade `lc-bento` com `lc-bento__largo`; ícone `lc-icone-caixa` |
| Formulário | `lc-formulario`, `lc-campo`, `lc-rotulo`, `lc-entrada` (erro com `aria-invalid="true"`), `lc-ajuda`, `lc-erro`, `lc-senha` com `lc-senha__alternar`, `lc-checagem` |
| Alternativa de questão | `lc-opcao` (rótulo com `input type="radio"` dentro), `lc-opcao__letra`; correção com `--correta` e `--errada` |
| Alerta na página | `lc-alerta`, `--erro`, `--sucesso` |
| Abas deslizantes | `lc-abas` com `lc-abas__cursor` e `lc-abas__aba` |
| Notificações | criadas pelo script; classes `lc-toast--sucesso`, `--conquista`, `--info`, `--aviso`, `--erro` |
| Cronômetro | `lc-cronometro` com SVG `lc-anel` (`lc-anel__trilha`, `lc-anel__progresso`, `lc-anel__lua`), `lc-cronometro__tempo` com `data-tempo`, `lc-cronometro__alerta`, anúncio com `data-anuncio` |
| Trilha de 12 marcos | `lc-marcos` com `lc-marco`, `--feito`, `--atual` |
| Barra de domínio | `lc-barra` com `lc-barra__valor` e `--valor: 60%`; completa com `lc-barra--completa` |
| Anel de conquista | `lc-progresso-anel` |
| Flashcard | `lc-flashcard` com `lc-flashcard__miolo` e duas `lc-flashcard__face` (a segunda com `--verso`); vira com a classe `is-virado`; autoavaliação `lc-autoavaliacao` |
| Recolhível | `<details class="lc-recolhivel">` |
| Tabela com rolagem | `lc-tabela-rolagem` envolvendo `lc-tabela` |
| Painel claro | `<figure class="lc-painel-claro">` |
| Lua em rede | `lc-lua-rede` com `<img src="/kit/img/lua-rede.svg" alt="">` e `<canvas>` |
| Utilitários | `lc-destaque`, `lc-titulo`, `lc-titulo-secao`, `lc-subtitulo`, `lc-lead`, `lc-texto-suave`, `lc-legenda`, `lc-numeros`, `lc-apenas-leitor`, `lc-container`, `lc-faixa`, `lc-secao`, `lc-nao-imprimir` |

## Scripts

```js
// Lua em rede (tela inicial)
LunarCeler.luaRede(document.querySelector('[data-lua-rede]'), { pontos: 110 });

// Abas do cabeçalho da tela inicial
LunarCeler.abas(document.querySelector('[data-abas]'));

// Notificação
LunarCeler.notificar({ tipo: 'sucesso', titulo: 'Conta criada', texto: 'Sua conta está pronta.' });

// Cronômetro: o tempo restante vem da API; o servidor encerra a questão
var cronometro = LunarCeler.cronometro(document.querySelector('[data-cronometro]'), {
  restante: respostaDaApi.segundosRestantes,
  total: 150,
  aoTerminar: function () { /* chamar o endpoint de encerramento e mostrar a correção */ }
});
cronometro.sincronizar(outraRespostaDaApi.segundosRestantes);

// Mostrar e ocultar senha
LunarCeler.formularios(document);
```

## Comportamentos já garantidos pelo kit

- Movimento reduzido: céu, rótulos flutuantes, Lua em rede e virada do flashcard ficam parados ou instantâneos.
- Lua em rede: pausa com a aba oculta e fora da tela; sem Canvas, mostra o SVG estático.
- Cronômetro: corrige-se sozinho ao voltar para a aba, avisa leitores de tela aos 60, 30 e 10 segundos e muda de cor abaixo de 30.
- Notificações: no máximo três, pausa com mouse ou foco, erro e aviso não somem sozinhos, anúncio por região viva.
- Impressão: céu, cabeçalho, rodapé, notificações e elementos com `lc-nao-imprimir` não saem no papel.

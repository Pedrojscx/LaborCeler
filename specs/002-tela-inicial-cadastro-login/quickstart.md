# Quickstart: validação da feature 002

**Feature**: `002-tela-inicial-cadastro-login` | **Data**: 2026-10-03

Roteiro para o mantenedor validar a feature, fase a fase e no fim. Os detalhes de cada endereço,
mensagem e regra estão em [contracts/paginas-e-sessao.md](contracts/paginas-e-sessao.md) e
[contracts/api-auth.openapi.yaml](contracts/api-auth.openapi.yaml); as entidades, em
[data-model.md](data-model.md).

## Pré-requisitos

- Os do README (Docker Engine 20.10+, Compose v2.2.1+, Git). Na máquina do mantenedor, os
  comandos `docker` precisam de `sudo` enquanto o usuário não estiver no grupo `docker`.
- Navegador atual no computador e um celular (ou a emulação de 360 px do navegador).
- Para os cenários de rede local: o IP da máquina na rede (`PUBLIC_BASE_URL` não é necessário
  nesta feature).

## Subir e rodar os testes

```bash
docker compose up -d --build --wait
docker compose exec app npm test
```

Esperado: todos os testes passam. Enquanto o e-mail do projeto não existir (P-01), a saída
termina com o bloco de aviso "Termos com marcador de e-mail: a publicação será bloqueada até P-01
da 002 ser resolvida", e o código de saída continua `0` (FR-012b).

## Cenário 1: tela inicial (US1, US5; FR-001 a FR-004b, FR-031 a FR-042)

1. Sem login, abra `http://localhost:3000/`: as seções aparecem na ordem da tela 1, **sem** "Entre
   e use 100% do Lunar Celer" (FR-038); título da aba terminado em "· Lunar Celer".
2. Confira no hero as seis regras e, nas perguntas frequentes, as respostas sobre internet e sobre
   refazer com os textos do FR-040.
3. Passe o mouse, o foco (Tab) e toque nas cinco empresas: o rótulo acende e o cartão mostra o
   fato; compare cada fato com `docs/referencias.md` (SC-011).
4. "Começar pelos estudos" leva à trilha na própria página; cada corpo da trilha, "Aprofundar em
   Terra" e "Validar certificado" levam à página "Disponível em breve" com o texto certo.
5. Role a página: a aba do cabeçalho acompanha a seção visível, e nenhuma está marcada no topo.
6. Com "reduzir movimento" ativado no sistema, céu, rótulos, Lua em rede e cursor das abas ficam
   parados (SC-013). Sem JavaScript, a Lua aparece como imagem estática e o texto continua legível.

## Cenário 2: cadastro (US2; FR-005 a FR-014, FR-043 a FR-045)

1. Cadastre um CPF válido sem máscara: a área do candidato abre, saúda pelo nome e mostra a
   notificação "Conta criada" (FR-044); nenhuma certificação é iniciada.
2. Repita com o mesmo CPF com máscara: "Este CPF já tem cadastro..." com o atalho para Entrar,
   sem nenhum outro dado do titular (FR-007).
3. Tente CPF com dígito errado, `111.111.111-11`, 10 dígitos e com letras: "CPF inválido. Confira
   os 11 números." (SC-004).
4. Tente nome de uma palavra, e-mail sem domínio, senha de 7 caracteres, confirmação diferente e
   sem aceite dos termos: cada mensagem aparece ligada ao campo, e os campos (exceto as senhas)
   continuam preenchidos (FR-014).
5. Tente uma senha com menos de 64 caracteres e mais de 72 bytes (por exemplo, 30 emojis): a
   mensagem de senha longa demais aparece (FR-043).
6. Abra os termos pelo formulário: abrem em outra aba, e o formulário não perde o que foi digitado.

## Cenário 3: login, sessão e saída (US3; FR-015 a FR-020, FR-046)

1. Entre com CPF e senha certos (com e sem máscara): vai à área do candidato.
2. Senha errada e CPF não cadastrado: a mesma mensagem genérica (SC-005).
3. Um e-mail no lugar do CPF: "O login é feito com o CPF cadastrado, não com o e-mail."
4. Erre a senha 5 vezes com o mesmo CPF: a 6ª tentativa, mesmo com a senha certa, mostra "Muitas
   tentativas sem sucesso. Aguarde 15 minutos e tente de novo.", igual para um CPF que não existe
   e para o limite por rede (FR-017, SC-009).
5. Saia: volta à tela inicial; `/candidato` leva ao login.
6. Conectado, abra `/cadastro` e `/entrar`: ambos levam à área do candidato; `/` mostra a tela
   inicial normalmente (FR-023).
7. A expiração de 8 horas é conferida pelos testes automatizados, com relógio controlado.

## Cenário 4: área do candidato e destinos provisórios (US4; FR-021 a FR-024, FR-047, FR-048)

1. Na área do candidato: "Sua Lua ainda está nova", Lua sem nenhuma parte acesa, "0 de 12 temas
   concluídos", os blocos "Estudar antes" e "Antes de cada questão" e nenhum texto que prometa
   começar a certificação agora (FR-047, tabela do FR-050).
2. "Iniciar a certificação", "Área de estudos", "Flashcards" e o próprio nome no cabeçalho levam à
   página "Disponível em breve" com o título e o texto de cada variação.
3. "Rever as regras" leva às regras do hero.
4. Sem login, abra `/certificacao/inicio` e `/perfil`: levam ao login; `/estudos`, `/validar` e
   `/flashcards` mostram a página "Disponível em breve".

## Cenário 5: rodapé e falha do banco (FR-004a, FR-030)

1. Com o banco no ar: rodapé com "Portal no ar e banco conectado".
2. Pare o banco (`docker compose stop db`) e recarregue qualquer página: rodapé com "Instabilidade
   no portal..."; tentar cadastrar ou entrar mostra "O portal está com instabilidade. Tente de
   novo em instantes.", sem cadastro parcial e sem perder o que foi digitado (exceto as senhas).
   Volte com `docker compose start db`.
3. Com a carga incompleta (cenário 5 do quickstart da 001), o rodapé mostra "Conteúdo em
   atualização.", e `docker compose logs app` mostra o que falta na carga.

## Cenário 6: acessibilidade e celular (FR-025 a FR-028, FR-049; SC-007, SC-013, SC-014)

1. Percorra as seis telas a 360 px e a 1920 px: sem rolagem horizontal.
2. Percorra só com o teclado: todos os elementos acionáveis com foco âmbar visível; alvos de toque
   com pelo menos 44 px (abas, mostrar senha, fechar notificação).
3. Confira o contraste AA (ferramenta do navegador) em textos pequenos (`#8A8A93`).
4. Com a máquina sem internet, as seis telas carregam com fontes e imagens, e a aba de rede do
   navegador mostra 0 pedidos para outros domínios.

## Cenário 7: segurança e dados pessoais (FR-020, FR-029; SC-006)

1. Cabeçalhos de qualquer página: a CSP do contrato, sem `upgrade-insecure-requests`.
2. Um `POST /api/auth/login` com `Origin: http://localhost:8080` recebe `403`; com corpo de
   formulário, `415`.
3. Depois de uma rodada de cadastros e logins, `docker compose logs app` não mostra senha, hash,
   CPF nem e-mail; no banco, `select senha from tbcandidato` só tem hashes `$2b$`.
4. O cookie `sessao` tem `HttpOnly` e `SameSite=Lax`.

## Cenário 8: verificação de clone limpo (obrigatória para publicar; FR-012b, Princípio V)

```bash
sudo scripts/validar-002.sh 2>&1 | tee saida-validar-002.txt
```

Esperado:

- **Enquanto o marcador do e-mail estiver nos termos (P-01)**: o script **falha**, com a mensagem
  "Termos com marcador de e-mail: a publicação será bloqueada até P-01 da 002 ser resolvida" e
  código diferente de zero. Todas as outras verificações aparecem como `OK`.
- **Com o e-mail do projeto no lugar do marcador**: todas as verificações passam, código `0`.

A 002 só é integrada à `main` com esse script aprovado e a saída registrada em `validacao.md`.

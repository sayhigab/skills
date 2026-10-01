---
name: aprimorar-design-site
description: Aprimora um site que JÁ EXISTE mantendo a mesma estética e identidade — refina o design (hierarquia, espaçamento, contraste, responsividade, estados), adiciona animações sutis, melhora performance e tempo de resposta, e corrige automaticamente fontes e caracteres quebrados (Ã§, â€™, �, ícones virando texto). Faz análise visual e testa o uso antes e depois. Use sempre que o usuário pedir para melhorar, polir, refinar, modernizar, dar um tapa ou deixar mais bonito, fluido ou rápido um site, landing page, página HTML/CSS ou front-end React/Vue/Svelte/Next existente, mesmo sem falar em design, ou quando reclamar de acentos estranhos, fonte errada, site lento ou animação travando. Não use para criar um site do zero nem para trocar a identidade visual.
license: MIT
metadata:
  titulo: Aprimorar design de site
  resumo: Melhora um site existente sem mudar a identidade — design, animações e performance — e corrige sozinha fontes e acentos quebrados.
  titulo-en: Website design polish
  resumo-en: Improves an existing website without changing its identity — design, animations and performance — and automatically fixes broken fonts and accented characters.
  categoria: design
  palavras-chave: design, frontend, css, animações, performance, acessibilidade, encoding
---

# Aprimorar design de site existente

Objetivo: o mesmo site, só que melhor. Quem já conhece deve reconhecê-lo na hora — mesma marca, cores, tipografia, conteúdo e tom — e sentir que ficou mais caprichado, fluido e rápido. É polimento, não redesign. Não troque framework, bibliotecas de UI nem a estrutura das páginas.

## 1. Entender a estética antes de mexer

Leia o código e, se der, veja o site rodando. Anote o "DNA" em poucas linhas:
- paleta (marca, fundo, texto, destaques) e se já existem variáveis/tokens
- tipografia (famílias, pesos, escala de tamanhos)
- raios, sombras e espaçamentos que se repetem
- personalidade (sóbrio, divertido, técnico, luxuoso…) e densidade

Toda melhoria sai desse DNA. Precisa de uma cor ou tamanho novo? Derive dos existentes (tom mais claro/escuro da mesma cor, próximo degrau da escala). Se não houver tokens, centralize os valores repetidos em variáveis CSS — isso já evita que o visual se desmanche.

## 2. Análise visual e teste de uso

Olhe o site de verdade, não só o código. Com navegador ou ferramenta de screenshot:
- capture desktop (~1440px) e celular (~375px)
- use como visitante: navegue, abra menus, envie formulários com dados de teste, passe o mouse, navegue com Tab; anote o que trava, pula, quebra ou confunde
- leia o console (erros de JS, 404 de fonte/imagem)
- rode `scripts/verificar-navegador.js` na página, na largura de desktop e na de celular (console ou ferramenta de executar JS) — vários problemas só aparecem numa delas. Ele aponta texto quebrado já renderizado (inclusive vindo de API/banco), fontes que não carregaram, imagens quebradas, rolagem horizontal, alvos de toque pequenos, contraste baixo e tempos de carregamento.

Sem navegador, analise o código e peça ao usuário prints de desktop e celular. Não invente problema visual que você não viu.

## 3. Correções automáticas (não precisa perguntar)

Fonte ou caractere quebrado é defeito, não escolha de design — corrija direto:

```bash
node scripts/auditar.mjs <pasta-do-site> --fix
```

O script corrige sozinho mojibake, arquivos fora de UTF-8, `<meta charset>`, `font-display: swap` e fonte de reserva no `font-family`, e lista o resto. O que ele aponta e você resolve:
- **`�`**: o caractere original se perdeu; reconstrua pela palavra (`Hor�rio` → `Horário`).
- **Fonte usada mas não carregada**: carregue a mesma fonte (Google Fonts com `display=swap`, ou o `@font-face` certo). Não troque por outra.
- **Arquivo de fonte inexistente**: procure o arquivo no projeto e corrija o caminho; se não existir em lugar nenhum, use a fonte mais parecida que o site já usa e avise no resumo.
- **Ícone virando texto ou quadrado** (`menu`, `local_cafe`, `□`): a fonte de ícones não carregou — carregue-a, ou troque pelos mesmos ícones em SVG inline se forem poucos (mais leve).
- Se o texto só quebra no servidor, confira o header `Content-Type: text/html; charset=utf-8`.

Sem Node, corrija à mão. Padrões comuns: `Ã§`→ç `Ã£`→ã `Ã¡`→á `Ã©`→é `Ãª`→ê `Ã­`→í `Ã³`→ó `Ãµ`→õ `Ãº`→ú `Ã‡`→Ç `Ã‰`→É `â€™`→’ `â€œ`→“ `â€`→” `â€”`→— `â€“`→– `Â `→(remover).

## 4. Melhorias

Faça o que o site realmente precisa, na ordem abaixo — não é para aplicar a lista inteira por obrigação.

**Design (prioridade)**
- Hierarquia: um foco por seção; título, subtítulo e corpo bem distintos em tamanho e peso.
- Espaçamento e alinhamento numa escala só (ex.: 4/8/12/16/24/32/48/64) e larguras de leitura confortáveis.
- Contraste mínimo 4,5:1 no texto (3:1 em texto grande), ajustando o tom das cores da própria paleta.
- Estados em tudo que é clicável: hover, `:focus-visible` visível, ativo, desabilitado, carregando.
- Responsivo de verdade: sem rolagem horizontal, alvos de toque ≥ 44px, menu que funciona no celular.
- Menos é mais: corte texto redundante e enfeites que competem entre si.

**Animações** — sutis e com motivo (feedback, orientação, continuidade):
- 150–300 ms, `ease-out` para entrar; anime só `transform` e `opacity`, nunca `width`, `top`, `margin`.
- Nada de `transition: all`; liste as propriedades.
- Entrada de seções ao rolar com `IntersectionObserver`, uma vez só, deslocamento de 8–16px.
- Sempre `@media (prefers-reduced-motion: reduce)` desligando o movimento.

**Performance e tempo de resposta**
- Imagens: `width`/`height`, `loading="lazy"` abaixo da dobra, `fetchpriority="high"` na principal, WebP/AVIF no tamanho exibido.
- Fontes: `preconnect`, só os pesos usados, `woff2`. Se a página pula quando a fonte chega (CLS alto no diagnóstico), crie uma fonte de reserva com `src: local('Arial')` e `size-adjust` igual à razão entre as larguras das duas fontes, medida no navegador.
- Scripts com `defer` ou `type="module"`; remova biblioteca e CSS sem uso (ex.: jQuery só para um clique).
- Resposta imediata ao toque: feedback visual em < 100 ms, listeners de scroll `passive`, debounce em busca/resize.

## 5. Explicar uma função: botão "?"

Não escreva parágrafos explicando como algo funciona. Se uma função não for óbvia (um filtro, uma opção, um campo técnico), coloque um "?" ao lado dela com uma frase curta. Use `assets/ajuda-tooltip.html` (abre com mouse, teclado e toque; fecha com Esc), com as cores trocadas pelos tokens do site; em React/Vue/Svelte, vire componente. Se a interface já tiver um texto explicativo longo, troque-o por um "?".

## 6. Verificar e entregar

Repita o passo 2 depois das mudanças: prints antes/depois em desktop e celular, `verificar-navegador.js` de novo, e confirme que links, formulários e console continuam funcionando. Se algo piorou, desfaça.

Feche com um resumo curto:

```
## O que mudou
- Corrigido automaticamente: …
- Design: …
- Animações: …
- Performance: … (antes → depois, quando medido)
## Para você decidir (se houver)
- …
```

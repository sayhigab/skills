# Aprimorar design de site

> Deixa um site que já existe mais bonito, fluido e rápido **sem mudar a identidade** — e conserta sozinha fontes e acentos quebrados.

<p align="center">
  <img src="../../exemplos/aprimorar-design-site/antes-depois.jpg" alt="Antes e depois: acentos quebrados, fonte errada e layout estourado no celular; depois, o mesmo site corrigido e refinado" width="520">
</p>

## O que ela faz

| | |
| :-- | :-- |
| 🎨 **Design** | Hierarquia, espaçamento consistente, contraste acessível, estados de hover e foco, responsivo de verdade — tudo derivado das cores e fontes que o site já usa. |
| ✨ **Animações** | Sutis e com propósito, só com `transform`/`opacity`, respeitando quem pede "reduzir movimento". |
| ⚡ **Performance** | Imagens, fontes e scripts sem bloquear a página, sem pulos de layout, bibliotecas sobrando removidas. |
| 🔤 **Correção automática** | Acentos quebrados (`PromoÃ§Ã£o` → `Promoção`), arquivos fora de UTF-8, fontes e ícones que não carregam. |
| ❓ **Botão "?"** | Troca parágrafos explicando uma função por um "?" ao lado dela, com uma frase curta. |
| 🔍 **Teste de verdade** | Olha o site no desktop e no celular, usa como visitante e compara antes e depois. |

## Como usar

Depois de instalar ([veja como](../../README.md#instalar)), peça normalmente:

- *"melhora o visual do site que está na pasta `landing`"*
- *"meu site está com uns Ã§ no lugar dos acentos, arruma"*
- *"deixa as animações dessa página mais suaves e o carregamento mais rápido"*

No ChatGPT, envie um `.zip` do site junto com prints do desktop e do celular.

## O que vem junto

| Arquivo | Para quê |
| :-- | :-- |
| [`SKILL.md`](SKILL.md) | As instruções que a IA segue. |
| [`scripts/auditar.mjs`](scripts/auditar.mjs) | Varre o projeto, corrige acentos e fontes, e lista o que precisa de ajuste. Também funciona sozinho: `node scripts/auditar.mjs pasta-do-site --fix`. |
| [`scripts/verificar-navegador.js`](scripts/verificar-navegador.js) | Diagnóstico colado no console do navegador: texto quebrado na tela, fontes, ícones, contraste, rolagem lateral e tempos. |
| [`assets/ajuda-tooltip.html`](assets/ajuda-tooltip.html) | O componente do botão "?" — acessível, abre com mouse, teclado e toque. |
| [`chatgpt.md`](chatgpt.md) | As mesmas instruções adaptadas para um GPT personalizado. |

## Exemplo

[`exemplos/aprimorar-design-site`](../../exemplos/aprimorar-design-site) tem um site de cafeteria propositalmente quebrado (`antes/`) e o resultado da skill (`depois/`). Abra os dois `index.html` no navegador para comparar.

## Limitações

- O auditor precisa do Node 18+. Sem ele, a IA corrige pelos padrões listados no `SKILL.md`.
- No ChatGPT, a análise visual depende dos prints e do diagnóstico que você cola no console — ele não vê o site rodando.

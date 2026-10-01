# Guia para agentes (Claude Code, Codex e afins)

Este repositório é uma coleção de skills em português. Siga este padrão ao criar ou alterar uma skill.

## Estrutura de uma skill

```text
skills/<nome-da-skill>/
  SKILL.md        obrigatório — instruções que a IA segue
  README.md       página da skill no GitHub (para pessoas)
  chatgpt.md      opcional — instruções para GPT personalizado, até 8.000 caracteres
  scripts/        opcional — código que a skill roda
  assets/         opcional — modelos, componentes, arquivos usados no resultado
  references/     opcional — documentação longa, lida só quando necessário
exemplos/<nome-da-skill>/   opcional — antes/depois, imagens para o README
```

Comece copiando `modelo/`.

## Regras

- **Nome:** kebab-case, igual ao nome da pasta e ao campo `name`.
- **Frontmatter:** só `name`, `description`, `license`, `metadata`, `compatibility`, `allowed-tools`. Uma linha por campo. Valores com `: ` ou ` #` vão entre aspas.
- **`description`:** o que a skill faz **e quando usar**, com frases que o usuário diria; um pouco insistente, porque é ela que faz a skill ser acionada. Até 1024 caracteres, sem `<` ou `>`.
- **`metadata.titulo`** e **`metadata.resumo`** são obrigatórios (aparecem no README e no catálogo). `categoria` e `palavras-chave` (separadas por vírgula) ajudam na busca.
- **`SKILL.md` enxuto:** idealmente menos de 500 linhas. Explique o porquê das instruções em vez de empilhar regras em maiúsculas. Detalhes longos vão para `references/`.
- **Scripts:** sem dependências externas quando possível (Node 18+ ou Python 3 da biblioteca padrão). Escreva caracteres especiais como escapes (`\uFFFD`), não literais invisíveis.
- **Português do Brasil** em tudo que a pessoa lê.

## Depois de mudar qualquer skill

```bash
node ferramentas/build.mjs
```

O build valida as skills e regenera `dist/`, `.claude-plugin/marketplace.json` e a tabela do `README.md`. Faça commit também dos arquivos gerados — o CI (`node ferramentas/build.mjs --verificar`) falha se estiverem desatualizados. Não edite à mão o que fica entre os marcadores `<!-- skills:... -->` e `<!-- selo:... -->` do README.

## Testar uma skill

Antes de publicar, use a skill de verdade em um caso realista (de preferência com um exemplo em `exemplos/<nome>/`) e confira o resultado — não só o código.

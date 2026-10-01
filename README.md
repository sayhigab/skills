<div align="center">

# Skills

**Skills em português para o Claude e o ChatGPT — prontas para instalar, fáceis de entender.**

![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-16A34A?style=flat-square) <!-- selo:inicio -->![Skills](https://img.shields.io/badge/skills-1-6D28D9?style=flat-square)<!-- selo:fim --> ![Claude](https://img.shields.io/badge/Claude-Code%20%C2%B7%20.ai%20%C2%B7%20app-D97757?style=flat-square) ![ChatGPT](https://img.shields.io/badge/ChatGPT-GPT%20personalizado-10A37F?style=flat-square) [![Validação](https://img.shields.io/github/actions/workflow/status/sayhigab/skills/validar.yml?branch=main&style=flat-square&label=valida%C3%A7%C3%A3o)](https://github.com/sayhigab/skills/actions/workflows/validar.yml)

[Skills](#skills-disponíveis) · [Instalar](#instalar) · [Criar uma skill](#criar-uma-nova-skill) · [Estrutura](#estrutura)

</div>

---

Uma **skill** é uma pasta com instruções (`SKILL.md`) e, quando precisa, scripts e modelos que ensinam a IA a fazer uma tarefa específica do jeito certo. Você instala uma vez e ela entra em ação sozinha quando o pedido combina — não precisa lembrar de chamar.

Este repositório reúne as skills que eu desenvolvo. Cada uma funciona no **Claude** (Claude Code, Claude.ai e app) e tem uma versão para **ChatGPT** como GPT personalizado.

## Skills disponíveis

<!-- skills:inicio -->
| Skill | O que faz | Baixar |
| :-- | :-- | :-- |
| [**Aprimorar design de site**](skills/aprimorar-design-site)<br><sub>`aprimorar-design-site` · design</sub> | Melhora um site existente sem mudar a identidade — design, animações e performance — e corrige sozinha fontes e acentos quebrados. | [Claude](https://github.com/sayhigab/skills/raw/main/dist/aprimorar-design-site.skill) · [ChatGPT](https://github.com/sayhigab/skills/raw/main/dist/aprimorar-design-site-chatgpt.zip) |
<!-- skills:fim -->

<p align="center">
  <img src="exemplos/aprimorar-design-site/antes-depois.jpg" alt="Antes e depois da skill Aprimorar design de site: o site com acentos quebrados, fonte errada e layout estourado no celular, e a versão corrigida com a mesma identidade visual" width="560">
  <br><sub>Aprimorar design de site: mesmo site, mesma identidade — acentos, fontes e layout consertados.</sub>
</p>

## Instalar

<details open>
<summary><b>Claude Code</b> — recomendado, atualiza sozinho</summary>

<br>

Dentro do Claude Code, adicione este repositório como catálogo e instale a skill que quiser:

```text
/plugin marketplace add sayhigab/skills
/plugin install aprimorar-design-site@sayhigab-skills
```

Para receber novas versões: `/plugin marketplace update sayhigab-skills`.

Prefere copiar à mão? Coloque a pasta da skill (ex.: `skills/aprimorar-design-site`) em `~/.claude/skills/` para valer em todos os projetos, ou em `.claude/skills/` dentro de um projeto.

</details>

<details>
<summary><b>Claude.ai e app Claude</b> (web, desktop e celular)</summary>

<br>

1. Baixe o arquivo **Claude** (`.skill`) na [tabela de skills](#skills-disponíveis).
2. No Claude, abra **Configurações → Capacidades → Skills** e envie o arquivo.
3. Pronto. Peça normalmente — a skill entra quando o pedido combinar.

As skills precisam da execução de código ativada, que fica na mesma tela.

</details>

<details>
<summary><b>ChatGPT</b> (GPT personalizado)</summary>

<br>

1. Baixe o arquivo **ChatGPT** (`.zip`) na [tabela de skills](#skills-disponíveis) e descompacte.
2. No ChatGPT, vá em **Explorar GPTs → Criar → Configurar**.
3. Em **Instruções**, cole todo o conteúdo de `instrucoes.md`.
4. Em **Conhecimento**, envie os arquivos da pasta `conhecimento/`. Se ele recusar alguma extensão (como `.mjs`), renomeie para `.txt` — as instruções já sabem encontrar o arquivo.
5. Em **Capacidades**, ative **Interpretador de código e análise de dados**.

</details>

<details>
<summary><b>Codex e outros agentes</b></summary>

<br>

As skills seguem o formato aberto de Agent Skills (`SKILL.md` com frontmatter). No Codex da OpenAI, copie a pasta da skill para `~/.codex/skills/`. Outros agentes compatíveis leem a mesma pasta.

</details>

## Estrutura

```text
skills/                       uma pasta por skill
  aprimorar-design-site/
    SKILL.md                  instruções que a IA segue (o essencial)
    README.md                 página da skill aqui no GitHub
    chatgpt.md                versão das instruções para GPT personalizado
    scripts/  assets/         arquivos de apoio usados pela skill
exemplos/                     antes e depois de cada skill em ação
dist/                         pacotes prontos (.skill e .zip) — gerados
modelo/                       ponto de partida para uma skill nova
ferramentas/build.mjs         valida tudo e gera dist/, catálogo e a tabela acima
.claude-plugin/               catálogo para o /plugin do Claude Code — gerado
```

## Criar uma nova skill

1. Copie `modelo/` para `skills/nome-da-skill/` (minúsculas e hífens; o nome da pasta é o nome da skill).
2. Preencha o `SKILL.md`. A `description` é o que faz a IA decidir usar a skill, então diga **o que ela faz e quando usar**, com frases que alguém realmente diria. `metadata.titulo` e `metadata.resumo` aparecem na tabela.
3. Se fizer sentido, adicione `scripts/`, `assets/`, `references/`, um `chatgpt.md` (até 8.000 caracteres) e um exemplo em `exemplos/nome-da-skill/`.
4. Rode o build — ele valida a skill e atualiza pacotes, catálogo e README:

   ```bash
   node ferramentas/build.mjs
   ```

5. Faça commit de tudo, inclusive dos arquivos gerados. O GitHub Actions confere se ficou tudo em dia.

> Usando o Claude Code dentro deste repositório, é só pedir *"cria uma skill nova para…"*: o [`AGENTS.md`](AGENTS.md) explica o padrão para ele.

## Contribuir

Sugestões, correções e ideias de skill são bem-vindas — abra uma [issue](https://github.com/sayhigab/skills/issues) ou um pull request. Antes do PR, rode `node ferramentas/build.mjs` (precisa só do Node 18+).

## Licença

[MIT](LICENSE) — use, adapte e compartilhe à vontade.

---

<sub>**English:** Portuguese-language Agent Skills for Claude (Claude Code, Claude.ai, desktop) with ChatGPT custom-GPT versions. Install in Claude Code with `/plugin marketplace add sayhigab/skills`, or download the packages from the table above.</sub>

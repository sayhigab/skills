<div align="center">

# Skills

**Skills em português para o Claude e o ChatGPT.**

![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-16A34A?style=flat-square) <!-- selo:inicio -->![Skills](https://img.shields.io/badge/skills-1-6D28D9?style=flat-square)<!-- selo:fim --> ![Claude](https://img.shields.io/badge/Claude-Code%20%C2%B7%20.ai%20%C2%B7%20app-D97757?style=flat-square) ![ChatGPT](https://img.shields.io/badge/ChatGPT-GPT%20personalizado-10A37F?style=flat-square) [![Validação](https://img.shields.io/github/actions/workflow/status/sayhigab/skills/validar.yml?branch=main&style=flat-square&label=valida%C3%A7%C3%A3o)](https://github.com/sayhigab/skills/actions/workflows/validar.yml)

[Skills](#skills-disponíveis) · [Como instalar](#como-instalar) · [Como usar](#como-usar) · [Para desenvolvedores](#para-desenvolvedores)

</div>

## O que é isso?

Uma **skill** é um conjunto de instruções que ensina a inteligência artificial a fazer uma tarefa específica muito bem, do jeito que um especialista faria.

Você instala uma vez e esquece: sempre que pedir algo relacionado, a IA usa a skill sozinha. Não precisa de comando especial nem de lembrar o nome dela.

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

## Como instalar

Escolha onde você usa a IA.

### No Claude (site ou aplicativo)

1. Na [tabela acima](#skills-disponíveis), clique em **Claude** para baixar a skill.
2. Abra o Claude e entre em **Configurações → Capacidades**.
3. Deixe ligada a opção **Execução de código e criação de arquivos**.
4. Na parte **Skills**, envie o arquivo que você baixou.

### No ChatGPT

1. Na [tabela acima](#skills-disponíveis), clique em **ChatGPT** e descompacte o arquivo baixado.
2. No ChatGPT, abra **GPTs → Criar** e vá na aba **Configurar**.
3. Abra o arquivo `instrucoes.md`, copie todo o texto e cole no campo **Instruções**.
4. Em **Conhecimento**, envie os arquivos da pasta `conhecimento`.
5. Em **Capacidades**, ligue o **Interpretador de código**.
6. Salve. A partir daí, é só conversar com esse GPT.

### No Claude Code

Digite dentro do Claude Code:

```text
/plugin marketplace add sayhigab/skills
/plugin install aprimorar-design-site@sayhigab-skills
```

## Como usar

Peça do seu jeito, como pediria a uma pessoa. Por exemplo: *"melhora o visual do meu site"*. A IA percebe que o pedido combina com a skill e segue as instruções dela.

Cada skill tem uma página com exemplos de pedidos — é só clicar no nome dela na tabela.

---

## Para desenvolvedores

### Formato

As skills seguem o padrão aberto de **Agent Skills**: um `SKILL.md` com frontmatter YAML (`name`, `description`) e instruções em Markdown, mais recursos opcionais (`scripts/`, `assets/`, `references/`).

O carregamento é progressivo. Só `name` e `description` ficam sempre no contexto. O corpo do `SKILL.md` entra quando a skill é acionada, e os scripts rodam sem ocupar contexto. Por isso a `description` de cada skill é escrita para acionamento: diz o que a skill faz **e** em que situações usar.

### Compatibilidade

| Plataforma | Instalação | Scripts da skill |
| :-- | :-- | :-- |
| Claude Code | `/plugin` (abaixo) ou copiar a pasta para `~/.claude/skills/` | Rodam na sua máquina (Node 18+) |
| Claude.ai e app | Upload do `.skill` | Rodam no ambiente de execução de código do Claude |
| Codex (OpenAI) | Copiar a pasta para `~/.codex/skills/` | Rodam na sua máquina |
| ChatGPT | GPT personalizado (instruções + conhecimento) | Pelo Interpretador de código; sem Node, a IA aplica as regras manualmente |

### Claude Code

O repositório é um catálogo de plugins do Claude Code, e cada skill é um plugin separado — instale só as que quiser.

```text
/plugin marketplace add sayhigab/skills            # adiciona o catálogo
/plugin install <skill>@sayhigab-skills            # instala uma skill
/plugin marketplace update sayhigab-skills         # busca novas versões
```

Para usar sem o catálogo, copie `skills/<skill>` para `~/.claude/skills/` (todos os projetos) ou para `.claude/skills/` de um projeto.

### Build e CI

```bash
node ferramentas/build.mjs              # valida e gera tudo
node ferramentas/build.mjs --verificar  # só confere (é o que o CI roda)
```

Sem dependências, Node 18+. O build:

- **valida** cada skill: `name` em kebab-case igual ao da pasta, `description` com até 1.024 caracteres e sem `<` ou `>`, só campos aceitos pelo Claude.ai, valores YAML que precisariam de aspas, `metadata.titulo` e `metadata.resumo`, e `chatgpt.md` dentro do limite de 8.000 caracteres de um GPT;
- **gera** o `.skill` (Claude) e o `-chatgpt.zip` de cada skill, o catálogo `.claude-plugin/marketplace.json` e a tabela de skills deste README;
- produz **zips determinísticos** (sem compressão, data fixa, quebras de linha LF): o mesmo conteúdo gera os mesmos bytes em Windows, macOS e Linux, então o CI consegue conferir se os pacotes publicados estão em dia.

### Contribuir

Issues e pull requests são bem-vindos. Antes de abrir um PR, rode `node ferramentas/build.mjs` e inclua os arquivos gerados.

## Licença

[MIT](LICENSE).

<sub>**English:** Portuguese-language Agent Skills for Claude (Claude Code, Claude.ai, desktop) with ChatGPT custom-GPT versions. Install in Claude Code with `/plugin marketplace add sayhigab/skills`, or download the packages from the table above.</sub>

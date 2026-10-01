<h1 align="center">
  <img src="docs/assets/logo.svg" alt="" width="56" valign="middle" /> Skills
</h1>

<p align="center">
  <a href="https://github.com/sayhigab/skills/stargazers"><img src="https://img.shields.io/github/stars/sayhigab/skills?style=flat&amp;label=%E2%98%85&amp;color=7C3AED" alt="Estrelas no GitHub" /></a>
  <!-- selo:inicio --><img src="https://img.shields.io/badge/skills-1-7C3AED?style=flat" alt="1 skill(s)" /><!-- selo:fim -->
  <img src="https://img.shields.io/badge/licen%C3%A7a-MIT-7C3AED?style=flat" alt="Licença MIT" />
  <a href="https://github.com/sayhigab/skills/actions/workflows/validar.yml"><img src="https://img.shields.io/github/actions/workflow/status/sayhigab/skills/validar.yml?branch=main&amp;style=flat&amp;label=valida%C3%A7%C3%A3o" alt="Validação" /></a>
  <img src="https://img.shields.io/badge/Claude%20%7C%20ChatGPT%20%7C%20Codex-4493F8?style=flat-square" alt="Funciona no Claude, no ChatGPT e no Codex" />
</p>

<p align="center">
  <sub><b>Português</b> · <a href="docs/readme/README.en.md">English</a></sub>
</p>

<p align="center">
  <strong>Ensine a IA a trabalhar como especialista.</strong><br/>
  Skills são instruções prontas que você instala no Claude ou no ChatGPT. Depois disso, a IA faz certas tarefas<br/>do jeito que um especialista faria — e usa a skill sozinha sempre que o seu pedido combinar.
</p>

<h3 align="center"><a href="#instalar"><ins>Instalar uma skill</ins></a></h3>

## Skills

<!-- skills:inicio -->
<table>
<tr>
<td width="50%" valign="middle">

### Aprimorar design de site

Melhora um site existente sem mudar a identidade — design, animações e performance — e corrige sozinha fontes e acentos quebrados.

**[Baixar .skill](https://github.com/sayhigab/skills/raw/main/dist/aprimorar-design-site.skill)** — Claude e Codex<br>
**[Baixar .zip](https://github.com/sayhigab/skills/raw/main/dist/aprimorar-design-site-chatgpt.zip)** — ChatGPT (GPT personalizado)

[Detalhes →](skills/aprimorar-design-site)

</td>
<td width="50%">
  <a href="skills/aprimorar-design-site"><img src="exemplos/aprimorar-design-site/capa.jpg" alt="Aprimorar design de site" width="100%" /></a>
</td>
</tr>
</table>
<!-- skills:fim -->

**Em todas as skills:**

- **Em português** — instruções, exemplos e respostas pensados para quem fala português.
- **Funcionam sozinhas** — você pede do seu jeito e a IA percebe quando usar a skill. Nenhum comando para decorar.
- **Testadas de verdade** — cada uma é usada num caso real antes de ser publicada, com exemplo de antes e depois.
- **Leves** — nada para instalar além da própria skill; os scripts usam só o Node, sem dependências.
- **Grátis e abertas** — licença MIT: use, adapte e compartilhe.

---

## Onde funciona

No Claude e em qualquer agente compatível com o padrão aberto **Agent Skills** — e no ChatGPT como GPT personalizado.

<p>
  <a href="https://claude.ai"><kbd><img src="https://www.google.com/s2/favicons?domain=claude.ai&amp;sz=64" alt="" width="16" valign="middle" /> Claude (site e app)</kbd></a> &nbsp;
  <a href="https://code.claude.com/docs"><kbd><img src="https://www.google.com/s2/favicons?domain=claude.ai&amp;sz=64" alt="" width="16" valign="middle" /> Claude Code</kbd></a> &nbsp;
  <a href="https://chatgpt.com"><kbd><img src="https://www.google.com/s2/favicons?domain=chatgpt.com&amp;sz=64" alt="" width="16" valign="middle" /> ChatGPT</kbd></a> &nbsp;
  <a href="https://github.com/openai/codex"><kbd><img src="https://www.google.com/s2/favicons?domain=openai.com&amp;sz=64" alt="" width="16" valign="middle" /> Codex</kbd></a> &nbsp;
  <kbd>+ agentes compatíveis com Agent Skills</kbd>
</p>

---

## Instalar

Cada skill tem dois arquivos: o **`.skill`**, que funciona no Claude e no Codex, e o **`.zip`**, que monta um GPT personalizado no ChatGPT.

### Claude — site e aplicativo

1. No cartão da skill, clique em **Baixar .skill**.
2. No Claude, abra **Configurações → Capacidades** e deixe ligada a **Execução de código e criação de arquivos**.
3. Em **Skills**, envie o arquivo baixado. Pronto.

### Codex — aplicativo

1. No cartão da skill, clique em **Baixar .skill**.
2. Abra o arquivo baixado: o app do Codex instala a skill.

### ChatGPT

1. No cartão da skill, clique em **Baixar .zip** e descompacte o arquivo.
2. No ChatGPT, abra **GPTs → Criar → Configurar**.
3. Cole o texto de `instrucoes.md` em **Instruções** e envie os arquivos da pasta `conhecimento` em **Conhecimento**.
4. Em **Capacidades**, ligue o **Interpretador de código** e salve.

### Claude Code

```text
/plugin marketplace add sayhigab/skills
/plugin install aprimorar-design-site@sayhigab-skills
```

_Para receber atualizações: `/plugin marketplace update sayhigab-skills`._

### Outros agentes

Copie a pasta da skill (`skills/<nome>`) para a pasta de skills do seu agente — no Codex pelo terminal, `~/.codex/skills/`.

### Como usar

Peça do seu jeito, como pediria a uma pessoa — por exemplo, *"melhora o visual do meu site"*. A IA reconhece que o pedido combina com a skill e segue as instruções dela. A página de cada skill tem mais exemplos.

---

## Comunidade e suporte

- **Ideias:** tem uma tarefa que uma skill resolveria? [Sugira uma skill](https://github.com/sayhigab/skills/issues/new?template=ideia.yml).
- **Problemas:** algo não funcionou? [Conte o que aconteceu](https://github.com/sayhigab/skills/issues/new?template=problema.yml).
- **Apoie:** deixe uma [estrela](https://github.com/sayhigab/skills) para acompanhar as novas skills.

---

## Para desenvolvedores

### Formato

Cada skill segue o padrão **Agent Skills**: um `SKILL.md` com frontmatter YAML (`name`, `description`) e instruções em Markdown, mais scripts e arquivos de apoio opcionais.

O carregamento é progressivo: só `name` e `description` ficam sempre no contexto; o corpo do `SKILL.md` entra quando a skill é acionada, e os scripts rodam sem ocupar contexto. Por isso a `description` é escrita para acionamento — diz o que a skill faz **e** em que situações usar.

### Compatibilidade

| Plataforma | Instalação | Scripts da skill |
| :-- | :-- | :-- |
| Claude Code | `/plugin` ou cópia para `~/.claude/skills/` (usuário) ou `.claude/skills/` (projeto) | Rodam na sua máquina (Node 18+) |
| Claude (site e app) | Upload do `.skill` | Rodam no ambiente de execução de código do Claude |
| Codex | Abrir o `.skill` no app, ou cópia para `~/.codex/skills/` | Rodam na sua máquina |
| ChatGPT | GPT personalizado (instruções + conhecimento) | Pelo Interpretador de código; sem Node, a IA aplica as regras manualmente |

No Claude Code, o repositório é um catálogo de plugins e cada skill é um plugin separado — instale só as que quiser.

### Build e CI

```bash
node ferramentas/build.mjs              # valida e gera tudo
node ferramentas/build.mjs --verificar  # só confere (é o que o CI roda)
```

Sem dependências, Node 18+. O build:

- **valida** cada skill: `name` em kebab-case igual ao da pasta, `description` com até 1.024 caracteres e sem `<` ou `>`, só campos aceitos pelo Claude, valores YAML que precisariam de aspas e o limite de 8.000 caracteres das instruções de um GPT;
- **gera** os pacotes de cada skill (`.skill` e `-chatgpt.zip`), o catálogo `.claude-plugin/marketplace.json` e os cartões de skills dos READMEs;
- produz **zips determinísticos** (sem compressão, data fixa, quebras de linha LF): o mesmo conteúdo gera os mesmos bytes em qualquer sistema, então o CI confere se os pacotes publicados estão em dia.

### Contribuir

Issues e pull requests são bem-vindos. Antes de abrir um PR, rode `node ferramentas/build.mjs` e inclua os arquivos gerados.

<a href="https://github.com/sayhigab/skills/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sayhigab/skills" alt="Pessoas que contribuíram" />
</a>

## Licença

Gratuito e de código aberto sob a [licença MIT](LICENSE).

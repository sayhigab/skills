<h1 align="center">
  <img src="../assets/logo.svg" alt="" width="56" valign="middle" /> Skills
</h1>

<p align="center">
  <a href="https://github.com/sayhigab/skills/stargazers"><img src="https://img.shields.io/github/stars/sayhigab/skills?style=flat&amp;label=%E2%98%85&amp;color=7C3AED" alt="GitHub stars" /></a>
  <!-- selo:inicio --><img src="https://img.shields.io/badge/skills-1-7C3AED?style=flat" alt="1 skill(s)" /><!-- selo:fim -->
  <img src="https://img.shields.io/badge/license-MIT-7C3AED?style=flat" alt="MIT license" />
  <a href="https://github.com/sayhigab/skills/actions/workflows/validar.yml"><img src="https://img.shields.io/github/actions/workflow/status/sayhigab/skills/validar.yml?branch=main&amp;style=flat&amp;label=checks" alt="Checks" /></a>
  <img src="https://img.shields.io/badge/Claude%20%7C%20ChatGPT%20%7C%20Codex-4493F8?style=flat-square" alt="Works with Claude, ChatGPT and Codex" />
</p>

<p align="center">
  <sub><a href="../../README.md">Português</a> · <b>English</b></sub>
</p>

<p align="center">
  <strong>Teach your AI to work like a specialist.</strong><br/>
  Skills are ready-made instructions you install in Claude or ChatGPT. From then on, the AI handles certain tasks<br/>the way an expert would — and uses the skill on its own whenever your request fits.
</p>

<h3 align="center"><a href="#install"><ins>Install a skill</ins></a></h3>

> The skills are written in Portuguese and tuned for Portuguese-speaking users. The models follow them fine, but replies may default to Portuguese.

## Skills

<!-- skills:inicio -->
<table>
<tr>
<td width="50%" valign="middle">

### Website design polish

Improves an existing website without changing its identity — design, animations and performance — and automatically fixes broken fonts and accented characters.

**[Download .skill](https://github.com/sayhigab/skills/raw/main/dist/aprimorar-design-site.skill)** — Claude and Codex<br>
**[Download .zip](https://github.com/sayhigab/skills/raw/main/dist/aprimorar-design-site-chatgpt.zip)** — ChatGPT (custom GPT)

[Details (in Portuguese) →](../../skills/aprimorar-design-site)

</td>
<td width="50%">
  <a href="../../skills/aprimorar-design-site"><img src="../../exemplos/aprimorar-design-site/capa.jpg" alt="Website design polish" width="100%" /></a>
</td>
</tr>
</table>
<!-- skills:fim -->

**Every skill is:**

- **Portuguese-first** — instructions, examples and replies designed for Portuguese speakers.
- **Automatic** — ask in your own words and the AI knows when to use the skill. No commands to memorize.
- **Tested for real** — each one is used on a real case before release, with a before-and-after example.
- **Lightweight** — nothing to install besides the skill; scripts only need Node, with no dependencies.
- **Free and open** — MIT license: use it, adapt it, share it.

---

## Where it works

In Claude and any agent that supports the open **Agent Skills** standard — and in ChatGPT as a custom GPT.

<p>
  <a href="https://claude.ai"><kbd><img src="https://www.google.com/s2/favicons?domain=claude.ai&amp;sz=64" alt="" width="16" valign="middle" /> Claude (web and app)</kbd></a> &nbsp;
  <a href="https://code.claude.com/docs"><kbd><img src="https://www.google.com/s2/favicons?domain=claude.ai&amp;sz=64" alt="" width="16" valign="middle" /> Claude Code</kbd></a> &nbsp;
  <a href="https://chatgpt.com"><kbd><img src="https://www.google.com/s2/favicons?domain=chatgpt.com&amp;sz=64" alt="" width="16" valign="middle" /> ChatGPT</kbd></a> &nbsp;
  <a href="https://github.com/openai/codex"><kbd><img src="https://www.google.com/s2/favicons?domain=openai.com&amp;sz=64" alt="" width="16" valign="middle" /> Codex</kbd></a> &nbsp;
  <kbd>+ any Agent Skills–compatible agent</kbd>
</p>

---

## Install

Each skill comes in two files: the **`.skill`**, which works in Claude and Codex, and the **`.zip`**, which sets up a custom GPT in ChatGPT.

### Claude — web and app

1. On the skill's card, click **Download .skill**.
2. In Claude, open **Settings → Capabilities** and keep **Code execution and file creation** turned on.
3. Under **Skills**, upload the downloaded file. Done.

### Codex — app

1. On the skill's card, click **Download .skill**.
2. Open the downloaded file: the Codex app installs the skill.

### ChatGPT

1. On the skill's card, click **Download .zip** and unzip the file.
2. In ChatGPT, open **GPTs → Create → Configure**.
3. Paste the text of `instrucoes.md` into **Instructions** and upload the files from the `conhecimento` folder under **Knowledge**.
4. Under **Capabilities**, turn on **Code Interpreter** and save.

### Claude Code

```text
/plugin marketplace add sayhigab/skills
/plugin install aprimorar-design-site@sayhigab-skills
```

_To get updates: `/plugin marketplace update sayhigab-skills`._

### Other agents

Copy the skill's folder (`skills/<name>`) to your agent's skills folder — for the Codex CLI, `~/.codex/skills/`.

### Usage

Ask in your own words, as you would ask a person — for example, *"make my website look better"*. The AI recognizes that the request fits the skill and follows its instructions. Each skill's page has more examples.

---

## Community &amp; support

- **Ideas:** a task a skill could solve? [Suggest a skill](https://github.com/sayhigab/skills/issues/new?template=ideia.yml).
- **Problems:** something didn't work? [Tell us what happened](https://github.com/sayhigab/skills/issues/new?template=problema.yml).
- **Support:** leave a [star](https://github.com/sayhigab/skills) to follow new skills.

---

## For developers

### Format

Each skill follows the **Agent Skills** standard: a `SKILL.md` with YAML frontmatter (`name`, `description`) and Markdown instructions, plus optional scripts and assets.

Loading is progressive: only `name` and `description` stay in context; the `SKILL.md` body loads when the skill triggers, and scripts run without taking up context. That's why each `description` is written for triggering — it says what the skill does **and** when to use it.

### Compatibility

| Platform | Install | Skill scripts |
| :-- | :-- | :-- |
| Claude Code | `/plugin`, or copy to `~/.claude/skills/` (user) or `.claude/skills/` (project) | Run on your machine (Node 18+) |
| Claude (web and app) | Upload the `.skill` | Run in Claude's code execution environment |
| Codex | Open the `.skill` in the app, or copy to `~/.codex/skills/` | Run on your machine |
| ChatGPT | Custom GPT (instructions + knowledge) | Through Code Interpreter; without Node, the model applies the rules manually |

In Claude Code, the repository is a plugin marketplace and each skill is its own plugin — install only the ones you want.

### Build &amp; CI

```bash
node ferramentas/build.mjs              # validate and generate everything
node ferramentas/build.mjs --verificar  # check only (what CI runs)
```

No dependencies, Node 18+. The build:

- **validates** each skill: kebab-case `name` matching its folder, `description` up to 1,024 characters with no `<` or `>`, only frontmatter fields Claude accepts, YAML values that would need quoting, and the 8,000-character limit of a GPT's instructions;
- **generates** each skill's packages (`.skill` and `-chatgpt.zip`), the `.claude-plugin/marketplace.json` catalog and the skill cards in both READMEs;
- produces **deterministic zips** (stored, fixed timestamps, LF line endings): the same content yields the same bytes on any OS, so CI can verify the published packages are up to date.

### Contributing

Issues and pull requests are welcome. Before opening a PR, run `node ferramentas/build.mjs` and commit the generated files.

<a href="https://github.com/sayhigab/skills/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sayhigab/skills" alt="Contributors" />
</a>

## License

Free and open source under the [MIT License](../../LICENSE).

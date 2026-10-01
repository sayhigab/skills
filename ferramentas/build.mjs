#!/usr/bin/env node
// Valida as skills, empacota cada uma e atualiza os arquivos gerados do repositório.
//
//   node ferramentas/build.mjs              valida e gera tudo
//   node ferramentas/build.mjs --verificar  só confere (usado no CI): falha se algo gerado estiver desatualizado
//
// Gera, para cada pasta em skills/:
//   dist/<skill>.skill               pacote para enviar ao Claude.ai / app Claude
//   dist/<skill>-chatgpt.zip         instruções + arquivos de conhecimento para um GPT personalizado
// E também:
//   .claude-plugin/marketplace.json  catálogo para instalar pelo Claude Code (/plugin)
//   README.md                        tabela de skills e selo de contagem (entre os marcadores)
//
// Sem dependências. Node 18+.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERIFICAR = process.argv.includes('--verificar');

const REPO = 'sayhigab/skills';
const URL_REPO = `https://github.com/${REPO}`;
const DONO = { name: 'sayhigab', url: 'https://github.com/sayhigab' };
const MARKETPLACE = 'sayhigab-skills';

const CAMPOS_PERMITIDOS = new Set(['name', 'description', 'license', 'allowed-tools', 'metadata', 'compatibility']);
const FORA_DO_PACOTE = new Set(['README.md', 'chatgpt.md', 'evals']); // documentação para pessoas / ChatGPT / testes
const EXT_TEXTO = /\.(md|mdx|txt|html?|css|[cm]?[jt]sx?|json|ya?ml|svg|xml|py|sh|csv)$/i;
const LIMITE_GPT = 8000; // caracteres do campo "Instruções" de um GPT personalizado

const erros = [];
const avisos = [];
const rel = p => path.relative(RAIZ, p).split(path.sep).join('/');

// ---------- leitura ----------

// Frontmatter YAML simples: "chave: valor" por linha e um nível de "metadata:" recuado.
function lerFrontmatter(texto, arquivo) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) { erros.push(`${arquivo}: falta o frontmatter (bloco entre --- no topo)`); return null; }
  const dados = {};
  let pai = null;
  for (const linha of m[1].split(/\r?\n/)) {
    if (!linha.trim() || linha.trim().startsWith('#')) continue;
    const r = linha.match(/^(\s*)([\w-]+):\s*(.*)$/);
    if (!r) { erros.push(`${arquivo}: linha do frontmatter não entendida: "${linha.trim()}"`); continue; }
    const [, recuo, chave, bruto] = r;
    const aspas = bruto.match(/^(["'])(.*)\1$/);
    if (!aspas && (/:\s|\s#/.test(bruto) || /^[[{*&!|>%@`]/.test(bruto)))
      erros.push(`${arquivo}: o valor de "${chave}" tem caracteres especiais do YAML (": ", " #", etc.) — coloque entre aspas`);
    const valor = aspas ? aspas[2] : bruto;
    if (recuo) {
      if (!pai) { erros.push(`${arquivo}: "${chave}" está recuado sem um campo pai`); continue; }
      dados[pai][chave] = valor;
    } else if (bruto === '') {
      dados[chave] = {};
      pai = chave;
    } else {
      dados[chave] = valor;
      pai = null;
    }
  }
  return dados;
}

function listar(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !e.name.startsWith('.'))
    .flatMap(e => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? listar(p, base) : [path.relative(base, p).split(path.sep).join('/')];
    })
    .sort();
}

// Texto sempre com LF, para o pacote ser idêntico em Windows, macOS e Linux.
const ler = arquivo => {
  const dados = fs.readFileSync(arquivo);
  return EXT_TEXTO.test(arquivo) ? Buffer.from(dados.toString('utf8').replace(/\r\n/g, '\n'), 'utf8') : dados;
};

// ---------- validação ----------

const pastaSkills = path.join(RAIZ, 'skills');
const skills = [];
for (const nome of fs.readdirSync(pastaSkills).sort()) {
  const dir = path.join(pastaSkills, nome);
  if (!fs.statSync(dir).isDirectory()) continue;
  const arqSkill = path.join(dir, 'SKILL.md');
  const onde = rel(arqSkill);
  if (!fs.existsSync(arqSkill)) { erros.push(`skills/${nome}: falta o SKILL.md`); continue; }

  const texto = fs.readFileSync(arqSkill, 'utf8');
  const fm = lerFrontmatter(texto, onde);
  if (!fm) continue;
  const arquivos = listar(dir);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(nome) || nome.length > 64)
    erros.push(`skills/${nome}: o nome da pasta deve ser kebab-case (minúsculas, números e hífens), até 64 caracteres`);
  if (fm.name !== nome) erros.push(`${onde}: "name" (${fm.name}) deve ser igual ao nome da pasta (${nome})`);
  for (const chave of Object.keys(fm)) if (!CAMPOS_PERMITIDOS.has(chave)) erros.push(`${onde}: campo "${chave}" não é aceito no frontmatter`);
  if (!fm.description) erros.push(`${onde}: falta "description" (é o que faz a skill ser acionada)`);
  else {
    if (fm.description.length > 1024) erros.push(`${onde}: "description" tem ${fm.description.length} caracteres (máximo 1024)`);
    if (/[<>]/.test(fm.description)) erros.push(`${onde}: "description" não pode ter < ou >`);
  }
  const meta = typeof fm.metadata === 'object' ? fm.metadata : {};
  if (!meta.titulo) erros.push(`${onde}: falta "metadata.titulo" (nome amigável usado no README)`);
  if (!meta.resumo) erros.push(`${onde}: falta "metadata.resumo" (uma frase usada no README e no catálogo)`);
  if (arquivos.filter(a => a.endsWith('SKILL.md')).length > 1) erros.push(`skills/${nome}: tem mais de um SKILL.md`);
  const linhas = texto.split('\n').length;
  if (linhas > 500) avisos.push(`${onde}: ${linhas} linhas — mova detalhes para references/ (ideal < 500)`);
  if (!arquivos.includes('README.md')) avisos.push(`skills/${nome}: sem README.md (a página da skill no GitHub)`);

  let chatgpt = null;
  if (arquivos.includes('chatgpt.md')) {
    chatgpt = fs.readFileSync(path.join(dir, 'chatgpt.md'), 'utf8').replace(/\r\n/g, '\n');
    if (chatgpt.length > LIMITE_GPT) erros.push(`skills/${nome}/chatgpt.md: ${chatgpt.length} caracteres (o GPT aceita até ${LIMITE_GPT})`);
  }

  skills.push({ nome, dir, fm, meta, arquivos, chatgpt });
}
if (!skills.length) erros.push('nenhuma skill encontrada em skills/');

// ---------- zip determinístico (sem compressão, data fixa): mesmo conteúdo, mesmos bytes ----------

const TABELA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = buf => {
  let c = 0xFFFFFFFF;
  for (const b of buf) c = TABELA_CRC[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
};

function zip(entradas) {
  const locais = [], central = [];
  let offset = 0;
  for (const { nome, dados } of entradas) {
    const n = Buffer.from(nome, 'utf8');
    const crc = crc32(dados);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);      // versão mínima
    local.writeUInt16LE(0x0800, 6);  // nomes em UTF-8
    local.writeUInt16LE(0x21, 12);   // 01/01/1980
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(dados.length, 18);
    local.writeUInt32LE(dados.length, 22);
    local.writeUInt16LE(n.length, 26);
    const cab = Buffer.alloc(46);
    cab.writeUInt32LE(0x02014b50, 0);
    cab.writeUInt16LE(20, 4);
    cab.writeUInt16LE(20, 6);
    cab.writeUInt16LE(0x0800, 8);
    cab.writeUInt16LE(0x21, 14);
    cab.writeUInt32LE(crc, 16);
    cab.writeUInt32LE(dados.length, 20);
    cab.writeUInt32LE(dados.length, 24);
    cab.writeUInt16LE(n.length, 28);
    cab.writeUInt32LE(offset, 42);
    locais.push(local, n, dados);
    central.push(cab, n);
    offset += 30 + n.length + dados.length;
  }
  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(0x06054b50, 0);
  fim.writeUInt16LE(entradas.length, 8);
  fim.writeUInt16LE(entradas.length, 10);
  fim.writeUInt32LE(central.reduce((t, b) => t + b.length, 0), 12);
  fim.writeUInt32LE(offset, 16);
  return Buffer.concat([...locais, ...central, fim]);
}

// ---------- arquivos gerados ----------

const gerados = new Map(); // caminho relativo -> Buffer

for (const s of skills) {
  const noPacote = s.arquivos.filter(a => !FORA_DO_PACOTE.has(a.split('/')[0]));
  gerados.set(`dist/${s.nome}.skill`, zip(noPacote.map(a => ({ nome: `${s.nome}/${a}`, dados: ler(path.join(s.dir, a)) }))));

  if (s.chatgpt) {
    const conhecimento = noPacote.filter(a => a !== 'SKILL.md');
    const nomes = conhecimento.map(a => path.posix.basename(a));
    const repetido = nomes.find((n, i) => nomes.indexOf(n) !== i);
    if (repetido) erros.push(`skills/${s.nome}: dois arquivos chamados "${repetido}" — o pacote do ChatGPT junta tudo numa pasta só`);
    gerados.set(`dist/${s.nome}-chatgpt.zip`, zip([
      { nome: 'instrucoes.md', dados: Buffer.from(s.chatgpt, 'utf8') },
      ...conhecimento.map(a => ({ nome: `conhecimento/${path.posix.basename(a)}`, dados: ler(path.join(s.dir, a)) })),
    ]));
  }
}

const lista = v => (v ?? '').split(',').map(x => x.trim()).filter(Boolean);
const marketplace = {
  name: MARKETPLACE,
  description: 'Skills em português para Claude e ChatGPT, prontas para instalar.',
  owner: DONO,
  plugins: skills.map(s => ({
    name: s.nome,
    displayName: s.meta.titulo,
    description: s.meta.resumo,
    source: './',
    skills: [`./skills/${s.nome}`],
    category: s.meta.categoria || undefined,
    keywords: lista(s.meta['palavras-chave']).length ? lista(s.meta['palavras-chave']) : undefined,
    license: s.fm.license || undefined,
    author: { name: DONO.name },
    homepage: `${URL_REPO}/tree/main/skills/${s.nome}`,
  })),
};
gerados.set('.claude-plugin/marketplace.json', Buffer.from(JSON.stringify(marketplace, null, 2) + '\n', 'utf8'));

// README: tabela e selo entre marcadores; o resto do arquivo é escrito à mão.
const baixar = arq => `${URL_REPO}/raw/main/dist/${arq}`;
const tabela = [
  '| Skill | O que faz | Baixar |',
  '| :-- | :-- | :-- |',
  ...skills.map(s => {
    const downloads = [`[Claude](${baixar(`${s.nome}.skill`)})`];
    if (s.chatgpt) downloads.push(`[ChatGPT](${baixar(`${s.nome}-chatgpt.zip`)})`);
    const sub = [`\`${s.nome}\``, s.meta.categoria].filter(Boolean).join(' · ');
    return `| [**${s.meta.titulo}**](skills/${s.nome})<br><sub>${sub}</sub> | ${s.meta.resumo} | ${downloads.join(' · ')} |`;
  }),
].join('\n');
const selo = `![Skills](https://img.shields.io/badge/skills-${skills.length}-6D28D9?style=flat-square)`;

const arqReadme = path.join(RAIZ, 'README.md');
let readme = fs.readFileSync(arqReadme, 'utf8').replace(/\r\n/g, '\n');
for (const [marca, conteudo, quebra] of [['skills', tabela, '\n'], ['selo', selo, '']]) {
  const re = new RegExp(`(<!-- ${marca}:inicio -->)[\\s\\S]*?(<!-- ${marca}:fim -->)`);
  if (!re.test(readme)) erros.push(`README.md: faltam os marcadores <!-- ${marca}:inicio --> e <!-- ${marca}:fim -->`);
  readme = readme.replace(re, (_, ini, fim) => ini + quebra + conteudo + quebra + fim);
}
gerados.set('README.md', Buffer.from(readme, 'utf8'));

// Pacotes de skills que não existem mais
const pastaDist = path.join(RAIZ, 'dist');
const sobras = fs.existsSync(pastaDist)
  ? fs.readdirSync(pastaDist).map(a => `dist/${a}`).filter(a => !gerados.has(a) && !a.endsWith('.gitkeep'))
  : [];

// ---------- resultado ----------

for (const a of avisos) console.log(`aviso: ${a}`);
if (erros.length) {
  for (const e of erros) console.error(`erro: ${e}`);
  console.error(`\n${erros.length} erro(s). Nada foi gerado.`);
  process.exit(1);
}

const mudou = [...gerados].filter(([arq, dados]) => {
  const p = path.join(RAIZ, arq);
  return !fs.existsSync(p) || !fs.readFileSync(p).equals(dados);
}).map(([arq]) => arq);

if (VERIFICAR) {
  const pendentes = [...mudou, ...sobras.map(a => `${a} (sobrando)`)];
  if (pendentes.length) {
    console.error('Arquivos gerados desatualizados:\n' + pendentes.map(a => `  - ${a}`).join('\n'));
    console.error('\nRode "node ferramentas/build.mjs" e faça commit do resultado.');
    process.exit(1);
  }
  console.log(`OK: ${skills.length} skill(s) válida(s) e arquivos gerados em dia.`);
} else {
  for (const arq of mudou) {
    fs.mkdirSync(path.dirname(path.join(RAIZ, arq)), { recursive: true });
    fs.writeFileSync(path.join(RAIZ, arq), gerados.get(arq));
  }
  for (const a of sobras) fs.rmSync(path.join(RAIZ, a));
  console.log(`${skills.length} skill(s) válida(s).`);
  console.log(mudou.length || sobras.length
    ? [...mudou.map(a => `  atualizado: ${a}`), ...sobras.map(a => `  removido: ${a}`)].join('\n')
    : '  nada mudou.');
}

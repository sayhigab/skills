#!/usr/bin/env node
// Auditoria estática de um site existente (Node 18+, sem dependências).
//
// Com --fix corrige sozinho:
//   - acentuação quebrada por codificação errada (mojibake: "PromoÃ§Ã£o" -> "Promoção")
//   - arquivos salvos fora de UTF-8 (Latin-1/Windows-1252) -> UTF-8
//   - <meta charset> ausente ou diferente de utf-8
//   - Google Fonts sem display=swap e @font-face sem font-display
//   - font-family sem fonte genérica de reserva (sans-serif, serif, monospace)
// E aponta o que precisa de julgamento: caractere perdido (U+FFFD), fonte usada mas
// nunca carregada, arquivo de fonte inexistente, e problemas de performance/animação.
//
// Uso: node auditar.mjs <pasta-ou-arquivo> [--fix]

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const FIX = args.includes('--fix');
const ALVO = path.resolve(args.find(a => !a.startsWith('--')) ?? '.');
if (!fs.existsSync(ALVO)) { console.error(`Não encontrado: ${ALVO}`); process.exit(1); }
const RAIZ = fs.statSync(ALVO).isDirectory() ? ALVO : path.dirname(ALVO);

const PASTAS_IGNORADAS = new Set(['node_modules', 'dist', 'build', 'out', 'vendor', 'coverage']);
const ARQ_IGNORADOS = /(^|[.-])min\.(js|css)$|^(package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$/i;
const EXT_TEXTO = /\.(html?|css|scss|sass|less|[cm]?[jt]sx?|vue|svelte|astro|php|mdx?|json|txt|xml|svg|liquid|njk|hbs|ejs|twig|erb)$/i;
const EXT_ESTILO = /\.(html?|css|scss|sass|less|[cm]?[jt]sx?|vue|svelte|astro|php|liquid|njk|hbs|ejs|twig|erb)$/i;
const EXT_IMG = /\.(png|jpe?g|gif|bmp|tiff?|webp|avif)$/i;

const GENERICAS = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif',
  'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong', 'inherit', 'initial', 'unset', 'revert', 'revert-layer']);
const SISTEMA = new Set(('arial,arial black,helvetica,helvetica neue,times,times new roman,georgia,verdana,tahoma,trebuchet ms,' +
  'courier,courier new,segoe ui,segoe ui emoji,segoe ui symbol,-apple-system,blinkmacsystemfont,sf pro text,sf pro display,' +
  'apple color emoji,noto color emoji,consolas,monaco,menlo,sfmono-regular,liberation mono,lucida console,lucida grande,' +
  'lucida sans unicode,impact,comic sans ms,palatino,palatino linotype,book antiqua,garamond,calibri,cambria,candara,optima,' +
  'avenir,avenir next,gill sans,futura,geneva,century gothic,baskerville,didot,andale mono').split(','));
const ICONES = /icon|awesome|material|symbol|glyph|remix|feather|ionic/i;

const rel = f => path.relative(RAIZ, f).split(path.sep).join('/') || path.basename(f);
const linhaDe = (texto, i) => texto.slice(0, i).split('\n').length;
const kb = b => `${Math.round(b / 1024)} KB`;
// Mesmo texto com os comentários trocados por espaços (posições preservadas): o que está comentado não conta.
const semComentarios = s => s.replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g, c => c.replace(/[^\n]/g, ' '));

const grupos = { corrigido: [], quebrado: [], performance: [], animacao: [], aviso: [] };
const add = (g, msg) => { if (!grupos[g].includes(msg)) grupos[g].push(msg); };

// ---------- texto quebrado (mojibake) ----------
// Bytes 0x80-0x9F do Windows-1252 que viram outros caracteres Unicode.
const CP1252 = new Map([[0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84], [0x2026, 0x85], [0x2020, 0x86],
  [0x2021, 0x87], [0x02C6, 0x88], [0x2030, 0x89], [0x0160, 0x8A], [0x2039, 0x8B], [0x0152, 0x8C], [0x017D, 0x8E],
  [0x2018, 0x91], [0x2019, 0x92], [0x201C, 0x93], [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B], [0x0153, 0x9C], [0x017E, 0x9E], [0x0178, 0x9F]]);
const byteDe = c => { const n = c?.codePointAt(0); return n >= 0x80 && n <= 0xFF ? n : CP1252.get(n); };
const utf8 = new TextDecoder('utf-8', { fatal: true });

// Texto UTF-8 que foi lido como Windows-1252: reagrupa os caracteres em bytes e decodifica de novo.
// Só troca sequências que formam UTF-8 válido, então texto correto não é afetado.
function desfazerMojibake(texto) {
  const original = texto;
  let total = 0;
  if (/[\u00C2-\u00F4]/.test(texto)) for (let rodada = 0; rodada < 3; rodada++) { // até 3 camadas de codificação dupla
    const cs = Array.from(texto);
    let saida = '', trocas = 0;
    for (let i = 0; i < cs.length;) {
      const b0 = byteDe(cs[i]);
      const n = b0 >= 0xC2 && b0 <= 0xDF ? 2 : b0 >= 0xE0 && b0 <= 0xEF ? 3 : b0 >= 0xF0 && b0 <= 0xF4 ? 4 : 0;
      if (n) {
        const bytes = [b0];
        while (bytes.length < n) {
          const b = byteDe(cs[i + bytes.length]);
          if (!(b >= 0x80 && b <= 0xBF)) break;
          bytes.push(b);
        }
        if (bytes.length === n) {
          try {
            saida += utf8.decode(Uint8Array.from(bytes)); i += n; trocas++;
            continue;
          } catch { /* não era UTF-8 válido: mantém */ }
        }
      }
      saida += cs[i++];
    }
    if (!trocas) break;
    texto = saida;
    if (rodada === 0) total = trocas; // camadas extras não contam como novos defeitos
  }
  // Sobras de sequências que perderam um byte invisível no caminho:
  //  - "â€" incompleto = aspas de fechamento (E2 80 9D; o 9D não existe no Windows-1252 e some ou vira "?")
  //  - "Ã " solto antes de minúscula = "à" (C3 A0; o espaço não separável virou espaço comum)
  for (const [re, para] of [[/\u00E2\u20AC\uFFFD?/g, '\u201D'], [/(?<!\p{L})\u00C3 (?=\s?\p{Ll})/gu, '\u00E0']])
    texto = texto.replace(re, () => { total++; return para; });
  return { texto, total, exemplo: total ? exemploDe(original, texto) : null };
}

// Primeira palavra que mudou, antes → depois (ex.: "PromoÃ§Ã£o" → "Promoção")
function exemploDe(antes, depois) {
  let i = 0;
  while (antes[i] === depois[i]) i++;
  const ini = Math.max(antes.lastIndexOf(' ', i), antes.lastIndexOf('\n', i), antes.lastIndexOf('>', i)) + 1;
  const palavra = (s, de) => s.slice(de).match(/^[^\s<]{0,40}/)[0];
  return `"${palavra(antes, ini)}" → "${palavra(depois, ini)}"`;
}

// ---------- coleta de arquivos ----------
function* listar(p) {
  if (fs.statSync(p).isFile()) { yield p; return; }
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const f = path.join(p, e.name);
    if (e.isDirectory() && !PASTAS_IGNORADAS.has(e.name)) yield* listar(f);
    else if (e.isFile()) yield f;
  }
}

const docs = [];
const imagens = [];
for (const f of listar(ALVO)) {
  const nome = path.basename(f);
  if (EXT_IMG.test(nome)) { imagens.push([f, fs.statSync(f).size]); continue; }
  if (!EXT_TEXTO.test(nome) || ARQ_IGNORADOS.test(nome)) continue;
  const buf = fs.readFileSync(f);
  if (buf.length > 1.5e6) continue;
  if ((buf[0] === 0xFF && buf[1] === 0xFE) || (buf[0] === 0xFE && buf[1] === 0xFF) || buf.includes(0)) {
    add('aviso', `${rel(f)}: parece UTF-16 ou binário — não alterado`);
    continue;
  }
  const bom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  let texto, convertido = false;
  try { texto = utf8.decode(buf); } catch {
    texto = new TextDecoder('windows-1252').decode(buf);
    convertido = true;
    add('corrigido', `${rel(f)}: arquivo estava em Latin-1/Windows-1252 → convertido para UTF-8`);
  }
  docs.push({ f, texto, original: convertido ? null : texto, bom });
}

// ---------- fontes carregadas em algum lugar do projeto ----------
const carregadas = new Set();
let fonteExterna = false; // Typekit, next/font/local etc.: não dá para saber as famílias
for (const d of docs) {
  const texto = semComentarios(d.texto);
  for (const [, corpo] of texto.matchAll(/@font-face\s*\{([^}]*)\}/gi)) {
    const m = corpo.match(/font-family\s*:\s*["']?([^;"'}]+)/i);
    if (m) carregadas.add(m[1].trim().toLowerCase());
  }
  for (const [url] of texto.matchAll(/fonts\.(?:googleapis\.com|bunny\.net)\/(?:css2?|icon)\?[^"'\s)>]+/gi)) {
    for (const [, v] of url.replace(/&amp;/g, '&').matchAll(/family=([^&]+)/g))
      for (const fam of decodeURIComponent(v).split('|')) carregadas.add(fam.split(':')[0].replace(/\+/g, ' ').trim().toLowerCase());
  }
  for (const [, nome] of texto.matchAll(/@fontsource(?:-variable)?\/([\w-]+)/g)) carregadas.add(nome.replace(/-/g, ' ').toLowerCase());
  for (const [, nomes] of texto.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]next\/font\/google['"]/g))
    for (const n of nomes.split(',')) carregadas.add(n.trim().split(/\s/)[0].replace(/_/g, ' ').toLowerCase());
  if (/use\.typekit\.net|fonts\.adobe\.com|next\/font\/local|fonts\.cdnfonts\.com|fast\.fonts\.net/.test(texto)) fonteExterna = true;
}

// Bibliotecas de ícone usadas sem ser carregadas: os ícones aparecem como palavra ("menu") ou quadrado
const projeto = docs.map(d => semComentarios(d.texto)).join('\n');
let iconesCarregados = false;
for (const [lib, usa, carrega] of [
  ['Material Icons/Symbols', /class(?:Name)?=\{?["'`][^"'`]*\bmaterial-(?:icons|symbols)/, /Material\+(?:Icons|Symbols)|material-(?:icons|symbols)[\w-]*\.css|@material-symbols|fontsource(?:-variable)?\/material|material-icons\/iconfont|material-design-icons/i],
  ['Font Awesome', /class(?:Name)?=\{?["'`][^"'`]*\b(?:fa[srlbd]?\s+fa-|fa-(?:solid|regular|brands)\b)/, /font-?awesome/i],
  ['Bootstrap Icons', /class(?:Name)?=\{?["'`][^"'`]*\bbi\s+bi-/, /bootstrap-icons/i],
]) {
  if (carrega.test(projeto)) iconesCarregados = true;
  else if (usa.test(projeto)) add('quebrado', `Ícones ${lib} são usados mas a biblioteca nunca é carregada — aparecem como texto ou quadrado`);
}

// ---------- análise e correções por arquivo ----------
const naoCarregadas = new Map(); // família -> [locais]
const semFallback = [];
const animacaoLayout = [], transicaoAll = [];
let temMovimento = false, temReducedMotion = false;

function genericaPara(fam) {
  if (/mono|code|courier|consol/i.test(fam)) return 'monospace';
  if (/(^|\s)serif|garamond|times|georgia|playfair|merriweather|lora|baskerville|didot|bodoni|crimson|cormorant|caslon|fraunces|libre|spectral|prata|cinzel/i.test(fam) && !/sans/i.test(fam)) return 'serif';
  return 'sans-serif';
}

for (const doc of docs) {
  const { f } = doc;
  let t = doc.texto;
  const ehHtml = /\.(html?|php|astro|liquid|njk|hbs|ejs|twig|erb|vue|svelte)$/i.test(f) && /<head[\s>]/i.test(t);

  // Mojibake
  const mj = desfazerMojibake(t);
  if (mj.total) {
    add('corrigido', `${rel(f)}: ${mj.total} caractere(s) com acentuação quebrada (ex.: ${mj.exemplo})`);
    t = mj.texto;
  }

  // Caractere perdido: precisa ser reconstruído pelo contexto
  let achados = 0;
  for (const m of t.matchAll(/\uFFFD/g)) {
    if (++achados > 5) break;
    const trecho = t.slice(Math.max(0, m.index - 25), m.index + 25).replace(/\s+/g, ' ').trim();
    add('quebrado', `${rel(f)}:${linhaDe(t, m.index)} caractere perdido "\uFFFD" em "${trecho}" — reconstrua pela palavra`);
  }

  if (ehHtml) {
    const vivo = semComentarios(t);
    // charset
    const meta = vivo.match(/<meta\s+charset\s*=\s*["']?([\w-]+)["']?[^>]*>/i)
      || vivo.match(/<meta\s+http-equiv\s*=\s*["']?content-type["']?[^>]*charset=([\w-]+)[^>]*>/i);
    if (!meta) {
      add('corrigido', `${rel(f)}: faltava <meta charset="utf-8"> (sem ele o navegador pode adivinhar errado e quebrar acentos)`);
      t = t.replace(/<head(\s[^>]*)?>(\r?\n)?([ \t]*)/i, (h, _, nl = '\n', ind) => `${h.trimEnd()}${nl}${ind}<meta charset="utf-8">${nl}${ind}`);
    } else if (!/^utf-?8$/i.test(meta[1])) {
      add('corrigido', `${rel(f)}: charset declarado era "${meta[1]}" → trocado para utf-8`);
      t = t.replace(meta[0], '<meta charset="utf-8">');
    }
    if (!/<html[^>]*\slang=/i.test(t)) add('aviso', `${rel(f)}: <html> sem atributo lang (ex.: lang="pt-BR") — afeta leitores de tela e hifenização`);
    if (!/<meta[^>]+name=["']?viewport/i.test(t)) add('aviso', `${rel(f)}: sem <meta name="viewport"> — o site não se ajusta ao celular`);

    // performance
    const head = vivo.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? '';
    for (const [tag] of head.matchAll(/<script\b[^>]*\bsrc=[^>]*>/gi))
      if (!/\b(defer|async)\b|type=["']?module/i.test(tag)) add('performance', `${rel(f)}: script bloqueando a renderização no <head>: ${tag.match(/src=["']?([^"'\s>]+)/i)[1]} — use defer`);
    if (/jquery[\w.-]*\.js/i.test(vivo)) add('performance', `${rel(f)}: carrega jQuery — se usado só para pouca coisa, troque por JS nativo`);
    if (/fonts\.googleapis\.com/.test(vivo) && !/rel=["']?preconnect[^>]+fonts\.gstatic\.com|fonts\.gstatic\.com[^>]+rel=["']?preconnect/i.test(vivo))
      add('performance', `${rel(f)}: usa Google Fonts sem <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`);
    const imgs = [...vivo.matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);
    const semDim = imgs.filter(i => !/\swidth=/i.test(i) || !/\sheight=/i.test(i)).length;
    const semLazy = imgs.filter(i => !/\sloading=/i.test(i)).length;
    const semAlt = imgs.filter(i => !/\salt=/i.test(i)).length;
    if (semDim) add('performance', `${rel(f)}: ${semDim} <img> sem width/height (a página "pula" ao carregar)`);
    if (semLazy > 1) add('performance', `${rel(f)}: ${semLazy} <img> sem loading="lazy" (use nas que ficam abaixo da dobra)`);
    if (semAlt) add('aviso', `${rel(f)}: ${semAlt} <img> sem alt`);
  }

  // Google Fonts sem display=swap
  t = t.replace(/(?:https?:)?\/\/fonts\.(?:googleapis\.com|bunny\.net)\/(?:css2?|icon)\?[^"'\s)>]+/gi, url => {
    if (/display=/.test(url)) return url;
    add('corrigido', `${rel(f)}: Google Fonts sem display=swap (texto invisível enquanto a fonte carrega) → adicionado`);
    return `${url}&display=swap`;
  });

  if (EXT_ESTILO.test(f)) {
    // @font-face: arquivo existe? font-display?
    let vivo = semComentarios(t);
    t = t.replace(/@font-face\s*\{([^}]*)\}/gi, (bloco, corpo, idx) => {
      if (vivo[idx] !== t[idx]) return bloco; // comentado
      const linha = linhaDe(t, idx);
      for (const [, u] of corpo.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
        if (/^(data:|https?:|\/\/)/i.test(u)) continue;
        const limpo = decodeURI(u.split(/[?#]/)[0]);
        const candidatos = limpo.startsWith('/')
          ? ['', 'public', 'static', 'src'].map(b => path.join(RAIZ, b, limpo))
          : [path.resolve(path.dirname(f), limpo)];
        if (!candidatos.some(c => fs.existsSync(c))) add('quebrado', `${rel(f)}:${linha} arquivo de fonte não existe: ${u}`);
      }
      if (/font-display/i.test(corpo)) return bloco;
      add('corrigido', `${rel(f)}:${linha} @font-face sem font-display → adicionado font-display: swap`);
      return bloco.replace('{', '{\n  font-display: swap;');
    });

    // font-family: fonte carregada? tem reserva genérica? (ignora o descritor dentro de @font-face)
    vivo = semComentarios(t);
    const faces = [...vivo.matchAll(/@font-face\s*\{[^}]*\}/gi)].map(m => [m.index, m.index + m[0].length]);
    t = t.replace(/(font-family\s*:\s*)([^;{}\n<>]+)/gi, (m, pre, v, idx) => {
      if (vivo[idx] !== t[idx] || faces.some(([a, b]) => idx > a && idx < b)) return m;
      let corpo = v;
      for (const q of ['"', "'", '`']) if ((corpo.split(q).length - 1) % 2) corpo = corpo.slice(0, corpo.lastIndexOf(q));
      const resto = v.slice(corpo.length);
      const [, valor, sufixo] = corpo.match(/^([\s\S]*?)(\s*(?:!important)?\s*)$/i);
      if (!valor || /[$@{(]|#\{/.test(valor)) return m; // variáveis, interpolação: não mexe
      const fams = valor.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      const primeira = fams[0]?.toLowerCase();
      if (!primeira || GENERICAS.has(primeira)) return m;
      const local = `${rel(f)}:${linhaDe(t, idx)}`;
      if (!SISTEMA.has(primeira) && !carregadas.has(primeira) && !fonteExterna && !(iconesCarregados && ICONES.test(primeira))) {
        if (!naoCarregadas.has(fams[0])) naoCarregadas.set(fams[0], []);
        naoCarregadas.get(fams[0]).push(local);
      }
      if (GENERICAS.has(fams.at(-1).toLowerCase()) || ICONES.test(primeira)) return m;
      semFallback.push(local);
      return pre + valor + `, ${genericaPara(fams[0])}` + sufixo + resto;
    });

    // animações
    vivo = semComentarios(t);
    if (/\b(transition|animation)\s*:/i.test(vivo)) temMovimento = true;
    if (/prefers-reduced-motion/i.test(vivo)) temReducedMotion = true;
    for (const m of vivo.matchAll(/transition(?:-property)?\s*:\s*all\b/gi)) transicaoAll.push(`${rel(f)}:${linhaDe(t, m.index)}`);
    for (const m of vivo.matchAll(/transition(?:-property)?\s*:[^;{}]*?\b(width|height|top|left|right|bottom|margin|padding)\b/gi))
      animacaoLayout.push(`${rel(f)}:${linhaDe(t, m.index)} (${m[1]})`);
    for (const m of vivo.matchAll(/@keyframes\s+([\w-]+)\s*\{/gi)) {
      let prof = 1, i = m.index + m[0].length;
      for (; i < vivo.length && prof; i++) prof += vivo[i] === '{' ? 1 : vivo[i] === '}' ? -1 : 0;
      const prop = vivo.slice(m.index, i).match(/[{;\s](width|height|top|left|right|bottom|margin[\w-]*|padding[\w-]*)\s*:/i);
      if (prop) animacaoLayout.push(`${rel(f)}:${linhaDe(t, m.index)} @keyframes ${m[1]} (${prop[1]})`);
    }
  }

  doc.texto = t;
}

for (const [fam, locais] of naoCarregadas)
  add('quebrado', `Fonte "${fam}" é usada mas não é carregada em nenhum lugar — o navegador mostra outra no lugar (${locais.slice(0, 2).join(', ')}${locais.length > 2 ? ` +${locais.length - 2}` : ''})`);
if (semFallback.length)
  add('corrigido', `${semFallback.length} font-family sem fonte de reserva genérica → adicionada (ex.: ${semFallback.slice(0, 3).join(', ')})`);
if (transicaoAll.length)
  add('animacao', `transition: all em ${transicaoAll.length} lugar(es) — liste só as propriedades animadas (${transicaoAll.slice(0, 3).join(', ')})`);
for (const a of animacaoLayout) add('animacao', `${a} anima propriedade de layout — troque por transform/opacity`);
if (temMovimento && !temReducedMotion) add('animacao', 'Há animações mas nenhum @media (prefers-reduced-motion: reduce)');
for (const [f, tam] of imagens.sort((a, b) => b[1] - a[1]))
  if (tam > 300 * 1024) add('performance', `${rel(f)}: imagem de ${kb(tam)} — reduza para o tamanho exibido e use WebP/AVIF`);

// ---------- grava ----------
let gravados = 0;
if (FIX) for (const d of docs) {
  if (d.texto === d.original) continue;
  fs.writeFileSync(d.f, (d.bom ? '\uFEFF' : '') + d.texto, 'utf8');
  gravados++;
}

// ---------- relatório ----------
const titulos = {
  corrigido: FIX ? 'CORRIGIDO AUTOMATICAMENTE' : 'CORRIGÍVEL (rode com --fix)',
  quebrado: 'QUEBRADO — precisa de ajuste manual',
  performance: 'PERFORMANCE',
  animacao: 'ANIMAÇ\u00C3O',
  aviso: 'AVISOS',
};
console.log(`Auditoria de ${ALVO} — ${docs.length} arquivo(s) de texto, ${imagens.length} imagem(ns)${FIX ? `, ${gravados} arquivo(s) gravado(s)` : ''}`);
for (const [g, itens] of Object.entries(grupos)) {
  if (!itens.length) continue;
  console.log(`\n[${titulos[g]}] (${itens.length})`);
  for (const i of itens.slice(0, 15)) console.log(`  - ${i}`);
  if (itens.length > 15) console.log(`  … e mais ${itens.length - 15}`);
}
if (!Object.values(grupos).some(g => g.length)) console.log('\nNada encontrado.');

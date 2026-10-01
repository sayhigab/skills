// Diagnóstico da página já renderizada. Cole no console do navegador (ou rode com a ferramenta
// de executar JavaScript) e leia o objeto retornado. Rode antes e depois das mudanças para comparar.
// Pega o que a análise do código não vê: texto vindo de API/banco, fontes que não carregaram de fato,
// imagens quebradas, rolagem horizontal, alvos de toque pequenos, contraste e tempos reais.
(async () => {
  await document.fonts.ready;
  const out = {};
  const todos = [...document.querySelectorAll('body, body *')];
  const css = el => getComputedStyle(el);
  const visivel = el => { const r = el.getBoundingClientRect(), s = css(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && +s.opacity > 0; };
  const nome = el => el.id ? `#${el.id}` : el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const comTexto = todos.filter(el => !/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName)
    && [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim()) && visivel(el));

  // 1. Texto quebrado: mojibake ("Ã§", "â€™") ou caractere perdido "\uFFFD"
  const QUEBRADO = /[\u00C2-\u00F4][\u0080-\u00BF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2013\u2014\u2018-\u201E\u2020-\u2022\u2026\u2030\u2039\u203A\u20AC\u2122]|\uFFFD/;
  const textos = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (tw.nextNode()) {
    const n = tw.currentNode;
    if (!/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(n.parentElement?.tagName) && QUEBRADO.test(n.nodeValue)) textos.push(n.nodeValue.trim().slice(0, 80));
  }
  for (const el of document.querySelectorAll('[alt],[title],[placeholder],[aria-label]'))
    for (const a of ['alt', 'title', 'placeholder', 'aria-label']) { const v = el.getAttribute(a); if (v && QUEBRADO.test(v)) textos.push(`${a}="${v.slice(0, 60)}"`); }
  if (QUEBRADO.test(document.title)) textos.push(`<title> ${document.title}`);
  out.textoQuebrado = [...new Set(textos)].slice(0, 15);

  // 2. Fontes: a primeira família de cada texto está sendo desenhada de verdade?
  const ctx = document.createElement('canvas').getContext('2d');
  const AMOSTRA = 'mmmwwwiiilllÁçã@#0123';
  const renderiza = fam => ['monospace', 'serif'].some(base => {
    ctx.font = `72px ${base}`; const w = ctx.measureText(AMOSTRA).width;
    ctx.font = `72px "${fam}", ${base}`; return ctx.measureText(AMOSTRA).width !== w;
  });
  const GENERICA = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[\w-]+|emoji|math|fangsong|-apple-system|blinkmacsystemfont)$/i;
  const usadas = new Map();
  for (const el of comTexto) {
    const fam = css(el).fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
    if (GENERICA.test(fam)) continue;
    const u = usadas.get(fam) ?? { n: 0, ex: nome(el) }; u.n++; usadas.set(fam, u);
  }
  out.fontesNaoRenderizadas = [...usadas].filter(([f]) => !renderiza(f)).map(([f, u]) => `"${f}" em ${u.n} elemento(s), ex.: ${u.ex} — o navegador está usando a reserva`);
  out.fontesComErro = [...document.fonts].filter(f => f.status === 'error').map(f => `${f.family} ${f.weight} ${f.style}`);
  // Ícones de fonte (Material, Font Awesome, Bootstrap Icons) sem a fonte: viram palavra ou quadrado
  const primeira = s => s.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
  const ICONE = /icon|awesome|symbol|material/i;
  out.iconesQuebrados = [...document.querySelectorAll('[class*="material-icons"], [class*="material-symbols"], [class^="fa-"], [class*=" fa-"], [class~="fa"], [class~="fas"], [class~="far"], [class~="fab"], [class~="bi"]')]
    .filter(el => {
      const s = css(el), a = getComputedStyle(el, '::before');
      const ok = ICONE.test(primeira(s)) && renderiza(primeira(s));
      const okAntes = a.content !== 'none' && ICONE.test(primeira(a)) && renderiza(primeira(a));
      return visivel(el) && !ok && !okAntes;
    }).slice(0, 8).map(el => `${nome(el)} mostrando "${el.textContent.trim().slice(0, 20)}"`);

  // 3. Imagens
  const imgs = [...document.images];
  out.imagensQuebradas = imgs.filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map(i => i.getAttribute('src'));
  out.imagensMaioresQueOExibido = imgs.filter(i => i.clientWidth && !/\.svg/i.test(i.currentSrc) && i.naturalWidth > 2 * i.clientWidth * devicePixelRatio)
    .slice(0, 8).map(i => `${i.currentSrc.split('/').pop()}: ${i.naturalWidth}px exibida em ${i.clientWidth}px`);

  // 4. Rolagem horizontal: elementos que saem da tela sem o pai sair (inclui invisíveis — eles também empurram a página)
  const W = document.documentElement.clientWidth;
  out.rolagemHorizontal = document.documentElement.scrollWidth > W
    ? todos.filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > W + 1 && (el === document.body || el.parentElement.getBoundingClientRect().right <= W + 1); })
      .slice(0, 6).map(el => `${nome(el)} (vai até ${Math.round(el.getBoundingClientRect().right)}px, tela ${W}px)${visivel(el) ? '' : ' — invisível, mas empurra a página'}`)
    : [];

  // 5. Alvos de toque menores que 24×24 (links dentro de frases não contam; o <label> do campo conta como área de toque)
  const pequeno = r => r.width < 24 || r.height < 24;
  out.alvosPequenos = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button], [onclick]')]
    .filter(el => visivel(el) && pequeno(el.getBoundingClientRect()) && ![...(el.labels ?? [])].some(l => !pequeno(l.getBoundingClientRect()))
      && !(el.tagName === 'A' && css(el).display === 'inline'))
    .slice(0, 10).map(el => { const r = el.getBoundingClientRect(); return `${nome(el)} ${Math.round(r.width)}×${Math.round(r.height)}`; });

  // 6. Contraste de texto (WCAG AA: 4.5:1, ou 3:1 em texto grande)
  const rgb = s => s.startsWith('rgb') ? s.match(/[\d.]+/g).map(Number) : null;
  const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const fundo = el => {
    for (let e = el; e; e = e.parentElement) {
      const s = css(e);
      if (s.backgroundImage !== 'none') return null; // imagem/gradiente: não dá para medir
      const c = rgb(s.backgroundColor);
      if (!c) return null;
      if ((c[3] ?? 1) > 0.9) return c.slice(0, 3);
    }
    return [255, 255, 255];
  };
  out.contrasteBaixo = comTexto.flatMap(el => {
    const s = css(el), fg0 = rgb(s.color), bg = fundo(el);
    if (!fg0 || !bg) return [];
    const a = fg0[3] ?? 1, fg = fg0.slice(0, 3).map((v, i) => v * a + bg[i] * (1 - a));
    const [l1, l2] = [lum(fg), lum(bg)].sort((x, y) => y - x), razao = (l1 + 0.05) / (l2 + 0.05);
    const px = parseFloat(s.fontSize), grande = px >= 24 || (px >= 18.66 && +s.fontWeight >= 700);
    return razao < (grande ? 3 : 4.5) ? [`${nome(el)} ${razao.toFixed(2)}:1 "${el.textContent.trim().slice(0, 30)}"`] : [];
  }).slice(0, 10);

  // 7. Tempos e peso
  const nav = performance.getEntriesByType('navigation')[0];
  let lcp = 0, cls = 0;
  try { new PerformanceObserver(l => { lcp = l.getEntries().at(-1)?.startTime ?? lcp; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
  try { new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) cls += e.value; })).observe({ type: 'layout-shift', buffered: true }); } catch {}
  await new Promise(r => setTimeout(r, 300));
  const recursos = performance.getEntriesByType('resource');
  const peso = r => r.transferSize || r.encodedBodySize || 0;
  const ms = v => v ? `${Math.round(v)} ms` : '-';
  out.tempos = {
    respostaServidor: ms(nav?.responseStart), domPronto: ms(nav?.domContentLoadedEventEnd), carregado: ms(nav?.loadEventEnd),
    maiorElementoVisivel_LCP: ms(lcp), pulosDeLayout_CLS: +cls.toFixed(3), requisicoes: recursos.length,
    pesoTotal: `${Math.round(recursos.reduce((t, r) => t + peso(r), 0) / 1024)} KB`,
  };
  out.recursosMaisPesados = recursos.filter(peso).sort((a, b) => peso(b) - peso(a)).slice(0, 5)
    .map(r => `${r.name.split('?')[0].split('/').pop() || r.name} ${Math.round(peso(r) / 1024)} KB`);

  out.semProblemas = Object.keys(out).filter(k => Array.isArray(out[k]) && !out[k].length);
  for (const k of out.semProblemas) delete out[k];
  return out;
})();

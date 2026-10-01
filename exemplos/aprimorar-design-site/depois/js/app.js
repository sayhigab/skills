// Menu no celular
const topo = document.querySelector('.topo');
const menuBtn = document.querySelector('.menu-btn');
const alternarMenu = aberto => {
  topo.classList.toggle('aberto', aberto);
  menuBtn.setAttribute('aria-expanded', String(aberto));
  menuBtn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
};
menuBtn.addEventListener('click', () => alternarMenu(!topo.classList.contains('aberto')));
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => alternarMenu(false)));

// Assinatura
const msg = document.getElementById('msg');
document.getElementById('form-assinatura').addEventListener('submit', e => {
  e.preventDefault();
  const moagem = document.getElementById('moagem').value;
  msg.classList.remove('visivel');
  msg.textContent = `Pronto! Sua assinatura com moagem “${moagem}” foi registrada. Você receberá um e-mail de confirmação.`;
  requestAnimationFrame(() => msg.classList.add('visivel'));
});

// Entrada suave dos blocos ao rolar (uma vez só)
const revelar = document.querySelectorAll('.revelar');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entradas => entradas.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visivel');
    obs.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  revelar.forEach(el => obs.observe(el));
} else {
  revelar.forEach(el => el.classList.add('visivel'));
}

// Botões "?" de ajuda: mantém o balão na tela, abre no toque, fecha com Esc
const posicionarAjuda = a => {
  const tip = a.querySelector('[role="tooltip"]');
  tip.style.setProperty('--ajuda-x', '0px');
  a.classList.remove('abaixo');
  const r = tip.getBoundingClientRect();
  if (r.left < 8) tip.style.setProperty('--ajuda-x', `${8 - r.left}px`);
  else if (r.right > innerWidth - 8) tip.style.setProperty('--ajuda-x', `${innerWidth - 8 - r.right}px`);
  if (r.top < 8) a.classList.add('abaixo');
};
const fecharAjudas = exceto => document.querySelectorAll('.ajuda.aberto').forEach(a => {
  if (a === exceto) return;
  a.classList.remove('aberto');
  a.querySelector('button').setAttribute('aria-expanded', 'false');
});
document.addEventListener('click', e => {
  const btn = e.target.closest('.ajuda > button');
  const a = btn?.parentElement;
  fecharAjudas(a);
  if (!a) return;
  const abrir = !a.classList.contains('aberto');
  a.classList.toggle('aberto', abrir);
  a.classList.remove('calado');
  btn.setAttribute('aria-expanded', String(abrir));
  if (abrir) posicionarAjuda(a);
});
for (const ev of ['pointerover', 'focusin']) document.addEventListener(ev, e => {
  const a = e.target.closest?.('.ajuda');
  if (!a) return;
  if (ev === 'focusin') a.classList.remove('calado');
  if (!a.classList.contains('aberto')) posicionarAjuda(a);
});
document.addEventListener('pointerout', e => {
  const a = e.target.closest?.('.ajuda');
  if (a && !a.contains(e.relatedTarget)) a.classList.remove('calado');
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  fecharAjudas();
  alternarMenu(false);
  document.querySelectorAll('.ajuda').forEach(a => a.classList.add('calado'));
});

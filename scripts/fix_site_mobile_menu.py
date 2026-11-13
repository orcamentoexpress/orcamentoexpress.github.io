from pathlib import Path

root = Path(__file__).resolve().parents[1]
path = root / 'index.html'
html = path.read_text(encoding='utf-8')

css_marker = '.menu{display:none;background:none;border:0;color:var(--ink);font-size:25px}'
css_add = css_marker + '.menu.is-open{color:var(--coral)}'
if '.menu.is-open' not in html:
    if css_marker not in html:
        raise SystemExit('CSS do botão menu não encontrado')
    html = html.replace(css_marker, css_add, 1)

media_marker = '@media(max-width:800px){.links{display:none}'
media_add = '@media(max-width:800px){.links{display:none}.links.is-open{display:flex;position:absolute;top:72px;left:0;right:0;background:rgba(251,248,241,.98);flex-direction:column;align-items:stretch;padding:14px 24px 18px;gap:4px;border-bottom:1px solid rgba(20,43,36,.1);box-shadow:0 14px 28px rgba(20,43,36,.12)}.links.is-open a{padding:10px 6px}.links.is-open .nav-cta{text-align:center;margin-top:4px}'
if '.links.is-open' not in html:
    if media_marker not in html:
        raise SystemExit('media query do menu não encontrada')
    html = html.replace(media_marker, media_add, 1)

script = '''<script>
(function(){
  const button = document.querySelector('.menu');
  const links = document.querySelector('.links');
  if (!button || !links) return;
  const close = () => {
    links.classList.remove('is-open');
    button.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Abrir menu');
  };
  button.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    button.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  links.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  window.addEventListener('resize', () => { if (window.innerWidth > 800) close(); });
})();
</script>'''
if "querySelector('.menu')" not in html:
    html = html.replace('</body>', script + '\n</body>', 1)

path.write_text(html, encoding='utf-8')
print('menu mobile da home corrigido')

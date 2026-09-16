/* Blog do Orçamento Express: conteúdo editorial em blog/posts.json. */
(async () => {
  const list = document.querySelector('#post-list');
  if (!list) return;
  const BASE = 'https://orcamentoexpress.github.io';
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const absoluteUrl = (path) => `${BASE}/${String(path || '').replace(/^\.\.\//, '')}`;
  const setMeta = (selector, attribute, value) => document.querySelector(selector)?.setAttribute(attribute, value);
  const setSocialMeta = (post, url) => {
    document.title = `${post.title} | Orçamento Express`;
    setMeta('meta[name="description"]', 'content', post.description);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:type"]', 'content', 'article');
    setMeta('meta[property="og:title"]', 'content', post.title);
    setMeta('meta[property="og:description"]', 'content', post.description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:image"]', 'content', absoluteUrl(post.image));
    setMeta('meta[name="twitter:title"]', 'content', post.title);
    setMeta('meta[name="twitter:description"]', 'content', post.description);
    setMeta('meta[name="twitter:image"]', 'content', absoluteUrl(post.image));
    setMeta('meta[name="keywords"]', 'content', (post.keywords || []).join(', '));
    setMeta('meta[property="article:published_time"]', 'content', post.date);
    setMeta('meta[property="article:modified_time"]', 'content', post.date);
  };
  const cta = '<aside class="article-cta"><h2>Crie orçamentos profissionais com mais rapidez</h2><p>O Orçamento Express ajuda você a registrar custos, calcular lucro, gerar PDF e enviar a proposta pelo WhatsApp.</p><p><a class="back" href="teste-gratis.html">Teste o gerador de orçamento grátis →</a></p><p><a class="back" href="index.html#comprar">Conheça o Orçamento Express completo →</a></p></aside>';
  try {
    const response = await fetch('blog/posts.json');
    if (!response.ok) throw new Error('Não foi possível carregar os artigos.');
    const posts = await response.json();
    const slug = new URLSearchParams(location.search).get('post');
    const post = posts.find((item) => item.slug === slug);
    if (post) {
      const url = `${BASE}/blog.html?post=${encodeURIComponent(post.slug)}`;
      document.querySelector('.hero')?.setAttribute('hidden', '');
      setSocialMeta(post, url);
      list.className = 'article';
      const sections = (post.content || []).map((section) => {
        if (typeof section === 'string') return `<p>${esc(section)}</p>`;
        return `<section><h2>${esc(section.heading)}</h2><p>${esc(section.text)}</p></section>`;
      }).join('');
      const related = posts.filter((item) => item.slug !== post.slug && (post.keywords || []).some((keyword) => (item.keywords || []).some((other) => other.includes(keyword.split(' ')[0])))).slice(0, 3);
      const relatedHtml = related.length ? `<section class="related"><h2>Leia também</h2><ul>${related.map((item) => `<li><a class="back" href="blog.html?post=${encodeURIComponent(item.slug)}">${esc(item.title)} →</a></li>`).join('')}</ul></section>` : '';
      list.innerHTML = `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Início</a> <span>›</span> <a href="blog.html">Blog</a> <span>›</span> <span>${esc(post.title)}</span></nav><div class="post-meta">${esc(post.category)} · ${new Date(`${post.date}T12:00:00`).toLocaleDateString('pt-BR')}</div><h1>${esc(post.title)}</h1><p class="article-lead">${esc(post.description)}</p><img src="${esc(post.image)}" alt="${esc(post.title)}" loading="eager">${sections}${relatedHtml}${cta}`;
      const schema = {'@context':'https://schema.org','@type':'BlogPosting','headline':post.title,'description':post.description,'datePublished':post.date,'dateModified':post.date,'author':{'@type':'Organization',name:post.author},'publisher':{'@type':'Organization',name:'Orçamento Express',url:BASE},'image':absoluteUrl(post.image),'mainEntityOfPage':{'@type':'WebPage','@id':url},'keywords':(post.keywords || []).join(', ')};
      const breadcrumb = {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem',position:1,name:'Início',item:`${BASE}/`},{'@type':'ListItem',position:2,name:'Blog',item:`${BASE}/blog.html`},{'@type':'ListItem',position:3,name:post.title,item:url}]};
      document.querySelector('#blog-schema').textContent = JSON.stringify([schema, breadcrumb]);
      return;
    }
    list.innerHTML = posts.map((item) => `<article class="post-card"><img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy"><div class="post-body"><div class="post-meta">${esc(item.category)} · ${new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR')}</div><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><a class="read" href="blog.html?post=${encodeURIComponent(item.slug)}">Ler artigo completo →</a></div></article>`).join('');
    const itemList = {'@context':'https://schema.org','@type':'ItemList',itemListElement:posts.map((item,index)=>({'@type':'ListItem',position:index+1,url:`${BASE}/blog.html?post=${encodeURIComponent(item.slug)}`,name:item.title}))};
    document.querySelector('#blog-schema').textContent = JSON.stringify(itemList);
  } catch (error) {
    list.innerHTML = '<p class="empty">O blog está sendo atualizado. Volte em alguns instantes.</p>';
    console.error(error);
  }
})();

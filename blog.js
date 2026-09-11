/* Blog do Orçamento Express: os conteúdos são mantidos em blog/posts.json. */
(async () => {
  const list = document.querySelector('#post-list');
  if (!list) return;
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  try {
    const response = await fetch('blog/posts.json');
    if (!response.ok) throw new Error('Não foi possível carregar os artigos.');
    const posts = await response.json();
    const slug = new URLSearchParams(location.search).get('post');
    const post = posts.find((item) => item.slug === slug);
    if (post) {
      document.querySelector('.hero')?.setAttribute('hidden', '');
      document.title = `${post.title} | Orçamento Express`;
      document.querySelector('meta[name="description"]')?.setAttribute('content', post.description);
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://orcagestor.github.io/blog.html?post=${encodeURIComponent(post.slug)}`);
      list.className = 'article';
      list.innerHTML = `<a class="back" href="blog.html">← Voltar ao blog</a><div class="post-meta">${esc(post.category)} · ${new Date(`${post.date}T12:00:00`).toLocaleDateString('pt-BR')}</div><h1>${esc(post.title)}</h1><p style="color:#6b7280;font-size:18px">${esc(post.description)}</p><img src="${esc(post.image)}" alt="${esc(post.title)}" loading="eager"><div class="content">${post.content.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}</div><p><a class="back" href="index.html#comprar">Conheça o Orçamento Express →</a></p>`;
      const schema = { '@context':'https://schema.org', '@type':'BlogPosting', headline:post.title, description:post.description, datePublished:post.date, author:{'@type':'Organization',name:post.author}, image:`https://orcagestor.github.io/${post.image.replace('../','')}`, mainEntityOfPage:location.href };
      document.querySelector('#blog-schema').textContent = JSON.stringify(schema);
      return;
    }
    list.innerHTML = posts.map((item) => `<article class="post-card"><img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy"><div class="post-body"><div class="post-meta">${esc(item.category)} · ${new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR')}</div><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><a class="read" href="blog.html?post=${encodeURIComponent(item.slug)}">Ler artigo completo →</a></div></article>`).join('');
    const itemList = { '@context':'https://schema.org','@type':'ItemList',itemListElement:posts.map((item,index)=>({'@type':'ListItem',position:index+1,url:`https://orcagestor.github.io/blog.html?post=${item.slug}`,name:item.title}))};
    document.querySelector('#blog-schema').textContent = JSON.stringify(itemList);
  } catch (error) {
    list.innerHTML = `<p class="empty">O blog está sendo atualizado. Volte em alguns instantes.</p>`;
    console.error(error);
  }
})();

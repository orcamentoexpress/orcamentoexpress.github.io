# Orçamento Express — SEO e blog

A página foi organizada para apresentar o Orçamento Express a profissionais e pequenas empresas que precisam criar propostas, controlar custos, acompanhar margem e enviar orçamentos pelo WhatsApp.

## Conteúdo implementado

A página inicial agora contém uma seção de vantagens, um preview do blog, três textos iniciais, dados estruturados, sitemap, robots.txt, feed RSS e a página de verificação do Google fornecida no pacote original.

O blog é alimentado pelo arquivo `blog/posts.json`. Para adicionar uma publicação, inclua um objeto com `slug`, `title`, `description`, `date`, `author`, `category`, `image`, `keywords` e `content`. O `content` é um array de parágrafos. A página `blog.html` monta os cards e as páginas individuais a partir desse JSON.

## Imagens

As imagens da galeria e a demonstração agora podem ser clicadas. O site abre um lightbox em tela cheia, com fechamento por botão, clique fora da imagem ou tecla Escape. A experiência também funciona em telas pequenas.

## Google

O pacote inclui `googlef61385477a9e6238.html` na raiz, preservado do envio original. Depois do deploy, confirme no Google Search Console se o arquivo está acessível e envie `https://orcagestor.github.io/sitemap.xml`. O SEO técnico melhora a compreensão do site, mas não garante posição específica no Google: indexação e ranking dependem também de autoridade, qualidade do conteúdo, concorrência, velocidade e histórico do domínio.

## Publicação

Publique o conteúdo da pasta do site diretamente no GitHub Pages ou Cloudflare Pages. Não publique o ZIP interno dentro de outro diretório: `index.html`, `blog.html`, `blog.js`, `blog/`, `img/`, `sitemap.xml`, `robots.txt` e o arquivo de verificação do Google precisam ficar na raiz pública do domínio.

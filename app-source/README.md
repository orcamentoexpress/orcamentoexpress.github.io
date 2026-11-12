# 📄 Orçamento Express (PWA Offline)

> Sistema moderno, responsivo e 100% offline para emissão de orçamentos e propostas comerciais profissionais com múltiplos estilos de PDF, integração WhatsApp, controle de clientes, carteira financeira com gráficos e sincronização em nuvem via Google Sheets.

Desenvolvido por **[Saulomgg](https://saulomgg.github.io)**.

---

## 🚀 Principais Funcionalidades

- **📱 PWA & 100% Offline**: Funciona em qualquer dispositivo (celular, tablet e computador) sem necessidade de internet. Pode ser instalado na tela inicial com ícone oficial.
- **🎨 5 Estilos Visuais de PDF**:
  - *Moderno*: Linhas limpas, minimalista com gradientes azuis/índigo.
  - *Executivo*: Corporativo em Navy Blue & Gold com tarja formal.
  - *Emerald*: Verde tecnológico e cartões de destaque.
  - *Clássico*: Bordô e papiro com serifas tradicionais.
  - *Cupom / OS Rápida*: Formato compacto de alta densidade.
- **⚡ Pagamento Instantâneo com PIX**: Geração automática de QR Code no padrão BACEN e chave copia-e-cola no próprio documento PDF.
- **💬 Envio Direto para WhatsApp**: Disparo automático com mensagem formatada via `wa.me` e compartilhamento nativo de arquivo PDF pelo celular (Web Share API).
- **👥 Gestão Completa de Clientes**: Cadastro rápido, métricas de pedidos, total investido e histórico de orçamentos por cliente.
- **💼 Carteira Financeira & Ganhos**: Gráfico de barras mensal interativo com **Recharts** filtrando propostas com status *Concluído*, taxa de conversão, ticket médio e resumo de status.
- **📊 Exportação CSV**: Relatório detalhado dos orçamentos concluídos compatível com Excel e Google Sheets.
- **☁️ Sincronização em Nuvem (Google Apps Script)**: Código pronto para criar um banco de dados gratuito em planilha do Google Sheets, permitindo sincronizar celulares e PCs sem custos.
- **💾 Backup Manual**: Exportação e importação de arquivo `.json` de segurança.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** & **TypeScript**
- **Vite 8**
- **Tailwind CSS 4**
- **vite-plugin-pwa** (Service Worker & Manifest PWA)
- **jsPDF** & **html2canvas** (Exportação de PDF em alta resolução)
- **Recharts** (Gráficos financeiros interativos)
- **QRCode** (Geração de QR Code PIX BACEN)
- **Lucide React** (Ícones modernos)
- **Canvas-Confetti** (Microinterações)

---

## 📦 Como Instalar e Rodar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/saulomgg/orcamento-express.git
cd orcamento-express
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Para gerar a versão de produção:
```bash
npm run build
```

---

## 🌐 Como Publicar gratuitamente no GitHub Pages

O repositório já inclui o workflow `.github/workflows/deploy.yml`. Depois de enviar o código para o GitHub:

1. Abra **Settings > Pages** no repositório.
2. Em **Build and deployment**, escolha **GitHub Actions**.
3. Faça push na branch `main` ou execute o workflow manualmente em **Actions**.

O site ficará disponível em `https://saulomgg.github.io/orcamento-express/`. O workflow injeta automaticamente o caminho do repositório no Vite, então os assets e o PWA funcionam fora da raiz do domínio.

---

## ☁️ Como Configurar a Nuvem Gratuita no Google Sheets

1. Abra o [Google Sheets](https://sheets.new) e crie uma planilha em branco.
2. Acesse o menu **Extensões** > **Apps Script**.
3. Copie o código pronto disponível na aba **Ajustes** dentro do aplicativo e cole no editor.
4. Clique em **Implantar** > **Nova Implantação**.
5. Tipo: **App da Web** | Executar como: **Eu** | Quem tem acesso: **Qualquer pessoa**.
6. Copie a URL do Web App gerada e cole no aplicativo na aba **Ajustes**.

---

## 📄 Licença e Créditos

Desenvolvido por **Saulomgg** - [saulomgg.github.io](https://saulomgg.github.io).  
Licença: MIT.

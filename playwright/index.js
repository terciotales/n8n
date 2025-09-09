const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Importa o módulo de scraping
const scrapeService = require('./app/tools/scrape');

// Middleware para parsing JSON
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Playwright service running');
});

app.post('/scrape', async (req, res) => {
  try {
    const { url, returnType, code } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    if (!returnType || !['markdown', 'html', 'links', 'screenshot'].includes(returnType)) {
      return res.status(400).json({
        error: 'returnType deve ser: markdown, html, links ou screenshot'
      });
    }

    const result = await scrapeService.scrape(url, returnType, code, req);
    res.json(result);

  } catch (error) {
    console.error('Erro no scraping:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

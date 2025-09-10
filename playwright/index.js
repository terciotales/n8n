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
		const {url, formats, code} = req.body;

		if (!url) {
			return res.status(400).json({error: 'URL é obrigatória'});
		}

		if (!formats || !Array.isArray(formats) || formats.length === 0) {
			return res.status(400).json({error: 'formats deve ser um array não vazio'});
		}

		const validFormats = ['markdown', 'html', 'links', 'screenshot'];

		for (const format of formats) {
			if (!validFormats.includes(format)) {
				return res.status(400).json({
					error: 'formats deve ser: markdown, html, links ou screenshot',
				});
			}
		}

		const result = await scrapeService.scrape(url, formats, code, req);
		res.json(result);

	} catch (error) {
		console.error('Erro no scraping:', error);
		res.status(500).json({error: error.message});
	}
});

app.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}`);
});

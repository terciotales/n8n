const {chromium} = require('playwright');
const TurndownService = require('turndown');
const fs = require('fs');
const path = require('path');

class ScrapeService {
	async scrape(url, returnType, customCode = null, req = null) {
		let browser;

		try {
			browser = await chromium.launch({
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
			});

			const page = await browser.newPage();

			await page.goto(url, {waitUntil: 'domcontentloaded'});

			console.log('capturando');

			// Espera a página carregar completamente
			await page.waitForTimeout(5000);

			// Se código customizado for fornecido, executa ele APÓS a página carregar
			if (customCode) {
				await this.executeCustomCode(page, customCode);
				// Aguarda um pouco para que o código customizado tenha efeito
				await page.waitForTimeout(1000);
			}

			let result;

			switch (returnType) {
				case 'html':
					result = await this.getHTML(page);
					break;
				case 'markdown':
					result = await this.getMarkdown(page);
					break;
				case 'links':
					result = await this.getLinks(page);
					break;
				case 'screenshot':
					result = await this.getScreenshot(page, req);
					break;
				default:
					throw new Error('Tipo de retorno inválido');
			}

			return {
				success: true,
				url,
				returnType,
				data: result,
				timestamp: new Date().toISOString(),
			};

		} catch (error) {
			throw new Error(`Erro no scraping: ${error.message}`);
		} finally {
			if (browser) {
				await browser.close();
			}
		}
	}

	async executeCustomCode(page, code) {
		try {
			// Executa código JavaScript customizado na página
			await page.evaluate((userCode) => {
				try {
					// Avalia o código do usuário em um contexto seguro
					eval(userCode);
				} catch (error) {
					console.warn('Erro no código customizado do usuário:', error.message);
				}
			}, code);
		} catch (error) {
			console.warn('Erro ao executar código customizado:', error.message);
			// Não falha o scraping por causa do código customizado
		}
	}

	async getHTML(page) {
		return await page.content();
	}

	async getMarkdown(page) {
		const html = await page.content();
		const turndownService = new TurndownService({
			headingStyle: 'atx',
			codeBlockStyle: 'fenced',
		});
		return turndownService.turndown(html);
	}

	async getLinks(page) {
		return await page.evaluate(() => {
			const links = Array.from(document.querySelectorAll('a[href]'));
			return links.map(link => ({
				text: link.textContent.trim(),
				href: link.href,
				title: link.title || null,
			})).filter(link => link.text && link.href);
		});
	}

	async getScreenshot(page, req) {
		const screenshot = await page.screenshot({
			fullPage: true,
			type: 'png',
		});

		// Gera nome único para o arquivo
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const filename = `screenshot-${timestamp}.png`;

		// Garante que a pasta screenshots existe
		const screenshotsDir = path.join(__dirname, '../../../public/screenshots');
		if (!fs.existsSync(screenshotsDir)) {
			fs.mkdirSync(screenshotsDir, {recursive: true});
		}

		const filepath = path.join(screenshotsDir, filename);

		// Salva o screenshot no arquivo
		fs.writeFileSync(filepath, screenshot);

		// Verifica se o arquivo foi criado com sucesso
		if (fs.existsSync(filepath)) {
			console.log(`Screenshot salvo em: ${filepath}`);

			// Constrói a URL completa acessível
			if (req) {
				const protocol = req.protocol || 'http';
				const host = req.get('host') || 'localhost:3000';
				const fullUrl = `${protocol}://${host}/public/screenshots/${filename}`;
				return fullUrl;
			} else {
				// Fallback para URL relativa se req não estiver disponível
				return `/public/screenshots/${filename}`;
			}
		} else {
			console.error('Erro ao salvar o screenshot');
			throw new Error('Falha ao salvar screenshot');
		}
	}
}

module.exports = new ScrapeService();

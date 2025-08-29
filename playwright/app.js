const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = 8000;

app.get('/health', (req, res) => {
  res.json({ status: 'okasas' });
});

app.get('/screenshot', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const buffer = await page.screenshot();
    await browser.close();
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Playwright server running on port ${PORT}`);
});


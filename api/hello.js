// api/hello.js
const puppeteer = require('puppeteer');

export default async function handler(req, res) {
  const { link } = req.query;

  if (!link) {
    return res.status(400).json({ error: 'O link é obrigatório.' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    // Navega até o link
    await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });

    // Espera o HTML carregar
    await page.waitForSelector('body', { timeout: 60000 });
    const htmlContent = await page.content();

    // Extrai o código do imóvel
    const regex = /publisher_house_id\s*=\s*"([\w-]+)"/;
    const match = htmlContent.match(regex);

    await browser.close();

    if (match && match[1]) {
      return res.status(200).json({ property_code: match[1] });
    } else {
      return res.status(404).json({ error: 'Código do imóvel não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao processar o link:', error.message);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

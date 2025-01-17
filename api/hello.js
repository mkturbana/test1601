const puppeteer = require('puppeteer');

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export default async function handler(req, res) {
  // Permitir apenas o método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const { link } = req.body;

  if (!link || !isValidURL(link)) {
    return res.status(400).json({ error: 'O link é obrigatório e deve ser uma URL válida.' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
    const htmlContent = await page.content();

    const regex = /publisher_house_id\s*=\s*"([\w-]+)"/;
    const match = htmlContent.match(regex);

    if (match && match[1]) {
      return res.status(200).json({ property_code: match[1] });
    } else {
      return res.status(404).json({ error: 'Código do imóvel não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao processar o link:', error.message);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

  }
}

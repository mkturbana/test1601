import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { link } = req.body;

    if (!link) {
      return res.status(400).json({ error: 'O link é obrigatório.' });
    }

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(link);

      const content = await page.content();
      const regex = /publisher_house_id\s*=\s*"([\w-]+)"/;
      const match = content.match(regex);

      await browser.close();

      if (match && match[1]) {
        return res.status(200).json({ property_code: match[1] });
      } else {
        return res.status(404).json({ error: 'Código do imóvel não encontrado.' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}

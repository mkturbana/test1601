const puppeteer = require('puppeteer'); // Usado para lidar com páginas dinâmicas

// Valida se a string é uma URL válida
function isValidURL(string) {
  try {
    new URL(string);
    return true; // Retorna "true" para URLs válidas
  } catch (_) {
    return false; // Retorna "false" para URLs inválidas
  }
}

// Função para extrair o código do imóvel com Puppeteer
async function extractPropertyCodeWithPuppeteer(link) {
  let browser;
  try {
    console.log(`Iniciando o processo de extração com Puppeteer para o link: ${link}`);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Reduz restrições de segurança
    });
    const page = await browser.newPage();

    console.log('Configurando o User-Agent...');
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    console.log('Bloqueando recursos desnecessários (imagens, fontes, etc.)...');
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log('Navegando até o link...');
    await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Esperando o seletor <body> estar disponível...');
    await page.waitForSelector('body', { timeout: 60000 });

    console.log('Carregando conteúdo HTML...');
    const htmlContent = await page.content();

    console.log('Extraindo o código do imóvel com regex...');
    const regex = /publisher_house_id\s*=\s*"([\w-]+)"/;
    const match = htmlContent.match(regex);

    if (match && match[1]) {
      console.log(`Código do imóvel encontrado: ${match[1]}`);
      return match[1];
    }

    console.error('Erro: Código do imóvel não encontrado no HTML.');
    return null;
  } catch (error) {
    console.error('Erro ao processar o Puppeteer:', error.message);
    return null;
  } finally {
    if (browser) {
      console.log('Fechando o navegador...');
      await browser.close();
    }
  }
}

// Handler principal da API (Serverless Function)
module.exports = async (req, res) => {
  console.log('Recebendo requisição:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Método ${req.method} não permitido. Use POST.` });
  }

  const { link } = req.body;

  // Validação do link
  if (!link || !isValidURL(link)) {
    console.error('Erro: Link inválido ou ausente na requisição.');
    return res.status(400).json({ error: 'O link é obrigatório e deve ser uma URL válida.' });
  }

  try {
    console.log(`Tentando extrair o código do imóvel do link: ${link}`);
    const propertyCode = await extractPropertyCodeWithPuppeteer(link);

    if (!propertyCode) {
      console.error(`Erro: Código do imóvel não encontrado no link: ${link}`);
      return res.status(404).json({ error: 'Código do imóvel não encontrado.' });
    }

    console.log(`Código do imóvel extraído com sucesso: ${propertyCode}`);
    res.json({ property_code: propertyCode });
  } catch (error) {
    console.error('Erro ao processar a requisição:', error.message);
    res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  }
};

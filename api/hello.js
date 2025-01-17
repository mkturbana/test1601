const puppeteer = require('puppeteer');

// Função para validar se uma string é uma URL válida
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export default async function handler(req, res) {
  const { link } = req.query;

  // Validação do parâmetro `link`
  if (!link || !isValidURL(link)) {
    return res.status(400).json({ error: 'O link é obrigatório e deve ser uma URL válida.' });
  }

  let browser;
  try {
    console.log(`Recebido link: ${link}`);

    // Lançar o navegador headless
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    console.log('Configurando o User-Agent...');
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    console.log('Bloqueando recursos desnecessários...');
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

    // Salvar o HTML carregado para debug (opcional)
    // fs.writeFileSync('debug_page.html', htmlContent);
    // console.log('HTML salvo no arquivo debug_page.html.');

    console.log('Extraindo o código do imóvel com regex...');
    const regex = /publisher_house_id\s*=\s*"([\w-]+)"/;
    const match = htmlContent.match(regex);

    if (match && match[1]) {
      console.log(`Código do imóvel encontrado: ${match[1]}`);
      return res.status(200).json({ property_code: match[1] });
    } else {
      console.error('Erro: Código do imóvel não encontrado.');
      return res.status(404).json({ error: 'Código do imóvel não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao processar o link:', error.message);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  } finally {
    if (browser) {
      console.log('Fechando o navegador...');
      await browser.close();
    }
  }
}

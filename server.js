const express = require('express');
const puppeteer = require('puppeteer'); // Usado para lidar com páginas dinâmicas

const app = express();
app.use(express.json());

// Função para extrair o código do imóvel com Puppeteer
async function extractPropertyCodeWithPuppeteer(link) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Reduz restrições de segurança
        });
        const page = await browser.newPage();

        console.log(`Abrindo o link com Puppeteer: ${link}`);

        // Configurar User-Agent
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );

        // Bloquear recursos desnecessários
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Navegar até o link
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });

        // Esperar seletor específico
        await page.waitForSelector('body', { timeout: 60000 });

        // Obter HTML completo
        const htmlContent = await page.content();
        console.log('HTML carregado pelo Puppeteer:\n', htmlContent.substring(0, 1000)); // Exibe os primeiros 1000 caracteres

        // Regex para capturar o valor de 'publisher_house_id'
        const regex = /publisher_house_id\s*=\s*"([\w-]+)"/;
        const match = htmlContent.match(regex);

        await browser.close();

        if (match && match[1]) {
            console.log(`Código do imóvel encontrado com Puppeteer: ${match[1]}`);
            return match[1];
        }

        console.error('Erro: Código do imóvel não encontrado no HTML carregado pelo Puppeteer.');
        return null;
    } catch (error) {
        console.error('Erro ao extrair com Puppeteer:', error.message);
        return null;
    }
}

// Endpoint para processar o link
app.post('/extract-property-code', async (req, res) => {
    console.log('Recebendo requisição:', req.body);

    const { link } = req.body;

    if (!link) {
        console.error('Erro: Link ausente na requisição.');
        return res.status(400).json({ error: 'O link é obrigatório.' });
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
});


// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

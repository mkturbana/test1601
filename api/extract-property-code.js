const { isValidURL, extractPropertyCodeWithPuppeteer } = require('./utils');

export default async function handler(req, res) {
  console.log('Recebendo requisição:', req.body);

  // Permitir apenas o método POST
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
}

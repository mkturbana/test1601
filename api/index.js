export default function handler(req, res) {
  // Define o header padrão para todas as respostas
  res.setHeader("Content-Type", "application/json");

  // Verifica o método da requisição
  if (req.method === "GET") {
    // Resposta para requisições GET
    res.status(200).json({ message: "Bem-vindo à API principal!" });
  } else if (req.method === "POST") {
    try {
      // Validação do corpo da requisição (verifica se é JSON válido)
      const { link } = req.body || {};  // Esperando o link aqui

      // Verifica se o link está presente
      if (!link) {
        // Caso o link esteja ausente, retorna mensagem padrão
        return res.status(400).json({ error: "O link é obrigatório." });
      }

      // Resposta personalizada com o link
      res.status(200).json({ message: `Link recebido: ${link}` });
    } catch (error) {
      // Erro ao processar o corpo da requisição (JSON inválido, etc.)
      console.error("Erro no corpo da requisição:", error.message);
      res.status(400).json({ error: "Corpo da requisição inválido." });
    }
  } else {
    // Tratamento para métodos não suportados
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}

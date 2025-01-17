export default function handler(req, res) {
  // Define o cabeçalho padrão
  res.setHeader("Content-Type", "application/json");

  // Verifica primeiro o método POST
  if (req.method === "POST") {
    try {
      // Validação do corpo da requisição
      const { link } = req.body || {}; // Espera o campo "link" no corpo da requisição

      // Verifica se o link está presente
      if (!link) {
        // Caso o link esteja ausente, retorna mensagem padrão
        return res.status(400).json({ error: "O link é obrigatório." });
      }

      // Resposta de sucesso para o método POST
      return res.status(200).json({ message: `Link recebido: ${link}` });
    } catch (error) {
      // Captura erros no corpo da requisição
      console.error("Erro no corpo da requisição:", error.message);
      return res.status(400).json({ error: "Corpo da requisição inválido." });
    }
  }

  // Outros métodos tratados após o POST
  if (req.method === "GET") {
    // Resposta para o método GET
    return res.status(200).json({ message: "Bem-vindo à API principal!" });
  }

  // Tratamento de métodos não suportados
  res.setHeader("Allow", ["POST", "GET"]);
  res.status(405).end(`Método ${req.method} não permitido`);
}

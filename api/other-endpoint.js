export default function handler(req, res) {
  if (req.method === "GET") {
    // Exemplo de resposta para requisições GET
    res.status(200).json({ message: "Você acessou o outro endpoint!" });
  } else if (req.method === "POST") {
    // Exemplo de resposta para requisições POST
    const { dados } = req.body;
    res.status(200).json({ recebido: dados });
  } else {
    // Método HTTP não suportado
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({ message: "API funcionando!" });
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}

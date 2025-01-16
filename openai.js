const axios = require("axios"); // Certifique-se de que o Axios está instalado: npm install axios

const apiKey = "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"; // Substitua pela sua chave de API OpenAI

async function callOpenAI() {
    try {
        // Configuração da requisição para a OpenAI
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions", // Endpoint da API
            {
                model: "gpt-4-0613", // Modelo a ser usado
                messages: [
                    {
                        role: "user",
                        content:
                            "Qual é o código deste imóvel? https://www.imovelweb.com.br/propriedades/terreno-a-venda-8711-m-por-r$-4.500.000-00-campo-3004711996.html"
                    }
                ],
                functions: [
                    {
                        name: "get_property_code",
                        description: "Obtém o código do imóvel a partir de um link fornecido.",
                        parameters: {
                            type: "object",
                            properties: {
                                link: {
                                    type: "string",
                                    description: "URL do imóvel para buscar o código."
                                }
                            },
                            required: ["link"]
                        }
                    }
                ],
                function_call: {
                    name: "get_property_code"
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`, // "Bearer" como parte de uma string interpolada
                    "Content-Type": "application/json"
                }
            }
        );

        // Processar a resposta da OpenAI
        const functionCall = response.data.choices[0].message.function_call;

        console.log("Função chamada pela OpenAI:", functionCall);

        // Exemplo de chamada ao backend com os argumentos recebidos
        if (functionCall.name === "get_property_code") {
            const args = JSON.parse(functionCall.arguments);
            console.log(
                "Chamando backend para extrair código da propriedade com o link:",
                args.link
            );

            // Aqui você chamaria sua API backend
            const propertyResponse = await axios.post(
                "http://localhost:3000/extract-property-code", // Endpoint para extrair o código do imóvel
                { link: args.link }
            );

            console.log("Código do imóvel extraído:", propertyResponse.data.property_code);
        }
    } catch (error) {
        console.error(
            "Erro ao chamar a API OpenAI ou Backend:",
            error.response?.data || error.message
        );
    }
}

callOpenAI();

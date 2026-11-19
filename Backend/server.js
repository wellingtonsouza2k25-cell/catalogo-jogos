const express = require("express");
const app = express();
const cors = require('cors');

const jogosRoutes = require("./jogos.routes");

app.use(cors());
app.use(express.json());

// Middleware para registrar as requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Rotas dos jogos
app.use(jogosRoutes);

// Tratamento de rotas inexistentes
app.use((req, res) => {
    res.status(404).json({
        erro: "Rota não encontrada."
    });
});

// Tratamento de erros (JSON inválido no corpo e falhas inesperadas),
// sempre respondendo em JSON no mesmo formato { erro }
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            erro: "JSON inválido no corpo da requisição."
        });
    }

    console.error(err);
    res.status(500).json({
        erro: "Erro interno do servidor."
    });
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
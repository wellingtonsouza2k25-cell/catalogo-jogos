const express = require("express");
const app = express();

const jogosRoutes = require("./routes/jogos.routes");

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

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
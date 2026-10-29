
const express = require("express");
const router = express.Router();

let jogos = [
    {
        id: 1,
        titulo: "Pro Evolution Soccer 2021",
        plataforma: "PC, PS4, Xbox One, Android, iOS",
        genero: "Esporte, Simulação",
        anoLancamento: 2020
    }
];

let proximoId = 2;

router.get("/jogos", (req, res) => {
    res.json(jogos);
});

router.get("/jogos/:id", (req, res) => {
    const id = Number(req.params.id);
    const jogo = jogos.find(j => j.id === id);

    if (jogo) {
        res.status(200).json(jogo);
    } else {
        res.status(404).json({
            erro: "Jogo não encontrado."
        });
    }
});

router.post("/jogos", (req, res) => {
    const titulo = req.body.titulo;
    const plataforma = req.body.plataforma;
    const genero = req.body.genero;
    const anoLancamento = req.body.anoLancamento;

    if (!titulo || !plataforma || !genero || !anoLancamento) {
        res.status(400).json({
            erro: "Dados obrigatórios ausentes."
        });
    } else {
        const novoJogo = {
            id: proximoId,
            titulo: titulo,
            plataforma: plataforma,
            genero: genero,
            anoLancamento: anoLancamento
        };

        jogos.push(novoJogo);

        proximoId++;

        res.status(201).json(novoJogo);
    }
});

router.put("/jogos/:id", (req, res) => {
    const id = Number(req.params.id);
    const jogo = jogos.find(j => j.id === id);

    const titulo = req.body.titulo;
    const plataforma = req.body.plataforma;
    const genero = req.body.genero;
    const anoLancamento = req.body.anoLancamento;

    if (!jogo) {
        res.status(404).json({
            erro: "Jogo não encontrado."
        });
    } else if (!titulo || !plataforma || !genero || !anoLancamento) {
        res.status(400).json({
            mensagem: "Dados obrigatórios."
        });
    } else {
        jogo.titulo = titulo;
        jogo.plataforma = plataforma;
        jogo.genero = genero;
        jogo.anoLancamento = anoLancamento;

        res.status(200).json(jogo);
    }
});

router.delete("/jogos/:id", (req, res) => {
    const id = Number(req.params.id);
    const indice = jogos.findIndex(j => j.id === id);

    if (indice === -1) {
        res.status(404).json({
            erro: "Jogo não encontrado."
        });
    } else {
        jogos.splice(indice, 1);
        res.sendStatus(204);
    }
});

module.exports = router;

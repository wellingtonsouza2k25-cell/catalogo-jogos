
const express = require("express");
const router = express.Router();
const db = require("./database");

let jogos = [];

router.get("/api/jogos", (req, res) => {
    const jogos = db.prepare(`
        SELECT id, titulo, plataforma, genero, anoLancamento
        FROM jogos
        ORDER BY id
    `).all();

    res.json(jogos);
});

router.get("/api/jogos/:id", (req, res) => {
    const id = Number(req.params.id);
    
    if (!id) {
        return res.status(400).json({
            erro: "O ID deve ser um número inteiro positivo."
        })
    };

    const jogo = db.prepare(`
        SELECT id, titulo, plataforma, genero, anoLancamento
        FROM jogos
        WHERE id = ?
    `).get(id);
    
    if(!jogo) {
        return res.status(404).json({
            erro: "Jogo não encontrado."
        });
    }

    return res.json(jogo);
});

router.post("/api/jogos", (req, res) => {
    const {titulo, plataforma, genero, anoLancamento} = req.body;
    const anoLancamentoNumero = Number(anoLancamento);

    if (!titulo || !plataforma || !anoLancamento) {
        return res.status(400).json({ 
            erro: "Dados obrigatórios ausentes." 
        });
    }

    const jogo = db.prepare(`
        INSERT INTO jogos (titulo, plataforma, genero, anoLancamento)
        VALUES (?, ?, ?, ?)
    `).run(titulo.trim(), plataforma, genero, anoLancamentoNumero);

    const jogoCriado = db.prepare(`
        SELECT id, titulo, plataforma, genero, anoLancamento
        FROM jogos
        WHERE id = ?
    `).get(jogo.lastInsertRowid);

    res.status(201).json(jogoCriado);
});

router.put("/api/jogos/:id", (req, res) => {
    const id = Number(req.params.id);
    const {titulo, plataforma, genero, anoLancamento} = req.body;
    const anoLancamentoNumero = Number(anoLancamento);
    
    const jogo = db.prepare(`
        SELECT id 
        FROM jogos
        WHERE id = ?
    `).get(id);

    if(!id) {
        return res.status(400).json({
            erro: "ID inválido."
        });
    }

    if (titulo.trim().length < 3) {
        return res.status(400).json({
            erro: "O nome deve ter pelo menos 3 caracteres."
        });
    }

    if (!Number.isInteger(anoLancamentoNumero) || anoLancamentoNumero <= 0) {
        return res.status(400).json({
            erro: "O ano lançamento deve ser um número inteiro positivo"
        });
    }

    if (!jogo) {
        return res.status(404).json({
            erro: "Jogo não encontrado."
        });
    }

    db.prepare(`
        UPDATE jogos
        SET titulo = ?, plataforma = ?, genero = ?, anoLancamento = ?
        WHERE id = ?
    `).run(titulo, plataforma, genero, anoLancamentoNumero, id);

    return res.json(
        db.prepare(`
            SELECT id, titulo, plataforma, genero, anoLancamento
            FROM jogos
            WHERE id = ?
        `).get(id)
    );

});

router.delete("/api/jogos/:id", (req, res) => {
    const id = Number(req.params.id);
    const jogo = db.prepare(`
        SELECT id 
        FROM jogos
        WHERE id = ?
    `).get(id);

    if (!jogo) {
        return res.status(404).json({
            erro: "Jogo não encontrado."
        });
    }

    db.prepare(`
        DELETE FROM jogos
        WHERE id = ?
    `).run(id);

    res.json("Jogo excluído com sucesso.");
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("./database");

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

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: "O ID deve ser um número inteiro positivo."
        });
    }

    const jogo = db.prepare(`
        SELECT id, titulo, plataforma, genero, anoLancamento
        FROM jogos
        WHERE id = ?
    `).get(id);

    if (!jogo) {
        return res.status(404).json({
            erro: `Jogo com ID ${id} não encontrado.`
        });
    }

    return res.json(jogo);
});

router.post("/api/jogos", (req, res) => {
    const { titulo, plataforma, genero, anoLancamento } = req.body;
    const anoLancamentoNumero = Number(anoLancamento);

    if (!titulo || !plataforma || !anoLancamento) {
        return res.status(400).json({
            erro: "Dados obrigatórios ausentes."
        });
    }

    if (titulo.trim().length < 3) {
        return res.status(400).json({
            erro: "O título deve ter pelo menos 3 caracteres."
        });
    }

    if (!Number.isInteger(anoLancamentoNumero) || anoLancamentoNumero <= 0) {
        return res.status(400).json({
            erro: "O ano de lançamento deve ser um número inteiro positivo."
        });
    }

    const jogo = db.prepare(`
        INSERT INTO jogos (titulo, plataforma, genero, anoLancamento)
        VALUES (?, ?, ?, ?)
    `).run(titulo.trim(), plataforma.trim(), genero ? genero.trim() : null, anoLancamentoNumero);

    const jogoCriado = db.prepare(`
        SELECT id, titulo, plataforma, genero, anoLancamento
        FROM jogos
        WHERE id = ?
    `).get(jogo.lastInsertRowid);

    res.status(201).json(jogoCriado);
});

router.put("/api/jogos/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: "ID inválido."
        });
    }

    const jogo = db.prepare(`
        SELECT id
        FROM jogos
        WHERE id = ?
    `).get(id);

    if (!jogo) {
        return res.status(404).json({
            erro: `Não foi possível atualizar: jogo com ID ${id} não encontrado.`
        });
    }

    const { titulo, plataforma, genero, anoLancamento } = req.body;
    const anoLancamentoNumero = Number(anoLancamento);

    if (!titulo || titulo.trim().length < 3) {
        return res.status(400).json({
            erro: "O nome deve ter pelo menos 3 caracteres."
        });
    }

    if (!plataforma || !plataforma.trim()) {
        return res.status(400).json({
            erro: "A plataforma é obrigatória."
        });
    }

    if (!Number.isInteger(anoLancamentoNumero) || anoLancamentoNumero <= 0) {
        return res.status(400).json({
            erro: "O ano de lançamento deve ser um número inteiro positivo."
        });
    }

    db.prepare(`
        UPDATE jogos
        SET titulo = ?, plataforma = ?, genero = ?, anoLancamento = ?
        WHERE id = ?
    `).run(titulo.trim(), plataforma.trim(), genero ? genero.trim() : null, anoLancamentoNumero, id);

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

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: "ID inválido."
        });
    }

    const jogo = db.prepare(`
        SELECT id
        FROM jogos
        WHERE id = ?
    `).get(id);

    if (!jogo) {
        return res.status(404).json({
            erro: `Não foi possível excluir: jogo com ID ${id} não encontrado.`
        });
    }

    db.prepare(`
        DELETE FROM jogos
        WHERE id = ?
    `).run(id);

    return res.json({
        mensagem: `Jogo excluído com sucesso! (ID ${id})`,
        id
    });
});

module.exports = router;
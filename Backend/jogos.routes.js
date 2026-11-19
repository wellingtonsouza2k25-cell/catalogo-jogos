const express = require("express");
const router = express.Router();
const db = require("./database");

// ---------- Consultas reutilizáveis ----------

const buscarTodos = db.prepare(`
    SELECT id, titulo, plataforma, genero, anoLancamento
    FROM jogos
    ORDER BY id
`);

const buscarPorId = db.prepare(`
    SELECT id, titulo, plataforma, genero, anoLancamento
    FROM jogos
    WHERE id = ?
`);

// Menor ID livre: se o 1 não existe, é o 1; senão, é o primeiro "buraco" na
// sequência (ex.: existem 1, 2, 4 -> devolve 3) ou, sem buracos, o maior ID + 1.
const buscarMenorIdLivre = db.prepare(`
    SELECT CASE
        WHEN NOT EXISTS (SELECT 1 FROM jogos WHERE id = 1) THEN 1
        ELSE (
            SELECT MIN(j.id) + 1
            FROM jogos j
            WHERE NOT EXISTS (SELECT 1 FROM jogos x WHERE x.id = j.id + 1)
        )
    END AS id
`);

const inserirJogo = db.prepare(`
    INSERT INTO jogos (id, titulo, plataforma, genero, anoLancamento)
    VALUES (?, ?, ?, ?, ?)
`);

const atualizarJogo = db.prepare(`
    UPDATE jogos
    SET titulo = ?, plataforma = ?, genero = ?, anoLancamento = ?
    WHERE id = ?
`);

const excluirJogo = db.prepare(`
    DELETE FROM jogos
    WHERE id = ?
`);

// Escolher o ID e inserir acontecem juntos, na mesma transação.
const cadastrarJogo = db.transaction((dados) => {
    const { id } = buscarMenorIdLivre.get();
    inserirJogo.run(id, dados.titulo, dados.plataforma, dados.genero, dados.anoLancamento);
    return id;
});

// ---------- Validações compartilhadas (POST e PUT usam as mesmas regras) ----------

function lerId(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function textoLimpo(valor) {
    return typeof valor === "string" ? valor.trim() : "";
}

function validarJogo(corpo) {
    const { titulo, plataforma, genero, anoLancamento } = corpo ?? {};

    const tituloLimpo = textoLimpo(titulo);
    const plataformaLimpa = textoLimpo(plataforma);
    const generoLimpo = textoLimpo(genero);
    const ano = Number(anoLancamento);

    // O título só precisa ter 1 caractere (depois de remover espaços das pontas)
    if (!tituloLimpo || !plataformaLimpa || !anoLancamento) {
        return { erro: "Dados obrigatórios ausentes." };
    }

    if (!Number.isInteger(ano) || ano <= 0) {
        return { erro: "O ano de lançamento deve ser um número inteiro positivo." };
    }

    return {
        dados: {
            titulo: tituloLimpo,
            plataforma: plataformaLimpa,
            genero: generoLimpo || null,
            anoLancamento: ano
        }
    };
}

// ---------- Rotas ----------

router.get("/api/jogos", (req, res) => {
    res.json(buscarTodos.all());
});

router.get("/api/jogos/:id", (req, res) => {
    const id = lerId(req.params.id);

    if (!id) {
        return res.status(400).json({
            erro: "O ID deve ser um número inteiro positivo."
        });
    }

    const jogo = buscarPorId.get(id);

    if (!jogo) {
        return res.status(404).json({
            erro: "Jogo não encontrado."
        });
    }

    res.json(jogo);
});

router.post("/api/jogos", (req, res) => {
    const { erro, dados } = validarJogo(req.body);

    if (erro) {
        return res.status(400).json({ erro });
    }

    const idCriado = cadastrarJogo(dados);

    res.status(201).json(buscarPorId.get(idCriado));
});

router.put("/api/jogos/:id", (req, res) => {
    const id = lerId(req.params.id);

    if (!id) {
        return res.status(400).json({
            erro: "O ID deve ser um número inteiro positivo."
        });
    }

    const { erro, dados } = validarJogo(req.body);

    if (erro) {
        return res.status(400).json({ erro });
    }

    if (!buscarPorId.get(id)) {
        return res.status(404).json({
            erro: "Jogo não encontrado."
        });
    }

    atualizarJogo.run(dados.titulo, dados.plataforma, dados.genero, dados.anoLancamento, id);

    res.json(buscarPorId.get(id));
});

router.delete("/api/jogos/:id", (req, res) => {
    const id = lerId(req.params.id);

    if (!id) {
        return res.status(400).json({
            erro: "O ID deve ser um número inteiro positivo."
        });
    }

    if (!buscarPorId.get(id)) {
        return res.status(404).json({
            erro: "Jogo não encontrado."
        });
    }

    excluirJogo.run(id);

    res.json({ mensagem: "Jogo excluído com sucesso." });
});

module.exports = router;

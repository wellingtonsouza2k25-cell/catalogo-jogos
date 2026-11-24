document.addEventListener("DOMContentLoaded", () => {
    const botaoSalvar = document.getElementById('btn-salvar');
    const botaoCancelar = document.getElementById('btn-cancelar');
    const tbody = document.querySelector('.tabela-jogos tbody');
    const campoBusca = document.getElementById('pesquisarID');
    const mensagemAviso = document.getElementById('mensagemAviso');
    const mensagemSemResultados = document.getElementById('mensagemSemResultados');

    const modalEditar = document.getElementById('modal-editar');
    const btnFecharEditar = document.getElementById('btn-fechar-editar');
    const btnConfirmarEditar = document.getElementById('btn-confirmar-editar');

    const modalExcluir = document.getElementById('modal-excluir');
    const btnFecharExcluir = document.getElementById('btn-fechar-excluir');
    const btnConfirmarExcluir = document.getElementById('btn-confirmar-excluir');
    const spanNomeExcluir = document.getElementById('excluir-nome-jogo');

    let idParaExcluir = null;
    let linhaParaExcluir = null;
    let linhaParaEditar = null;
    let timerAviso = null;

    function escaparHtml(valor) {
        return String(valor ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function criarElementoLinha(jogo) {
        const tr = document.createElement('tr');
        tr.dataset.id = jogo.id;

        tr.innerHTML = `
            <td>${jogo.id}</td>
            <td>${escaparHtml(jogo.titulo)}</td>
            <td>${escaparHtml(jogo.plataforma)}</td>
            <td>${escaparHtml(jogo.genero)}</td>
            <td>${escaparHtml(jogo.anoLancamento)}</td>
            <td class="td-acoes">
                <button class="btn-acao edit" data-id="${jogo.id}" title="Editar">
                    <img src="icons/edit.png" alt="Editar">
                </button>
                <button class="btn-acao delete" data-id="${jogo.id}" title="Excluir">
                    <img src="icons/trash.png" alt="Excluir">
                </button>
            </td>
        `;
        return tr;
    }

    function adicionarLinhaNaTabela(jogo) {
        const novaLinha = criarElementoLinha(jogo);
        const linhaSeguinte = Array.from(tbody.children)
            .find(linha => Number(linha.dataset.id) > Number(jogo.id));

        tbody.insertBefore(novaLinha, linhaSeguinte || null);
    }

    function aplicarFiltroPorId() {
        const termo = campoBusca.value.trim();
        const idBuscado = termo === '' ? null : String(Number(termo));
        let encontrados = 0;

        tbody.querySelectorAll('tr').forEach(linha => {
            const corresponde = idBuscado === null || linha.dataset.id === idBuscado;
            linha.hidden = !corresponde;
            if (corresponde) encontrados++;
        });

        if (mensagemSemResultados) {
            if (idBuscado !== null && encontrados === 0) {
                mensagemSemResultados.textContent = `Nenhum jogo encontrado com o ID ${idBuscado}.`;
                mensagemSemResultados.hidden = false;
            } else {
                mensagemSemResultados.textContent = '';
                mensagemSemResultados.hidden = true;
            }
        }
    }

    campoBusca.addEventListener('input', () => {
        campoBusca.value = campoBusca.value.replace(/\D/g, '');
        aplicarFiltroPorId();
    });

    async function carregarJogos() {
        try {
            const resposta = await fetch("http://localhost:3000/api/jogos");
            if (!resposta.ok) {
                throw new Error("Erro ao carregar a lista de jogos.");
            }

            const listaJogos = await resposta.json();
            tbody.innerHTML = '';

            listaJogos.forEach(jogo => {
                adicionarLinhaNaTabela(jogo);
            });
            aplicarFiltroPorId();
        } catch (erro) {
            console.error("Erro ao buscar jogos:", erro.message);
        }
    }

    carregarJogos();

    function mostrarMensagemSucesso(texto) {
        clearTimeout(timerAviso);
        mensagemAviso.classList.remove('erro');
        mensagemAviso.classList.add('sucesso');
        mensagemAviso.textContent = texto;

        timerAviso = setTimeout(() => {
            mensagemAviso.textContent = "";
            mensagemAviso.classList.remove('sucesso');
        }, 3000);
    }

    function mostrarMensagemErro(texto) {
        clearTimeout(timerAviso);
        mensagemAviso.classList.remove('sucesso');
        mensagemAviso.classList.add('erro');
        mensagemAviso.textContent = texto;

        timerAviso = setTimeout(() => {
            mensagemAviso.textContent = "";
            mensagemAviso.classList.remove('erro');
        }, 3000);
    }

    botaoSalvar.addEventListener("click", async () => {
        const titulo = document.getElementById('titulo').value;
        const plataforma = document.getElementById('plataforma').value;
        const genero = document.getElementById('genero').value;
        const anoLancamento = document.getElementById('ano').value;

        const dadosJogo = {
            titulo,
            plataforma,
            genero,
            anoLancamento: Number(anoLancamento)
        };

        try {
            const resposta = await fetch("http://localhost:3000/api/jogos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosJogo)
            });

            if (!resposta.ok) {
                const erroData = await resposta.json();
                throw new Error(erroData.erro || "Erro ao cadastrar o jogo.");
            }

            const resultado = await resposta.json();
            adicionarLinhaNaTabela(resultado);
            aplicarFiltroPorId();

            limparFormularioCadastro();
            mostrarMensagemSucesso(`Jogo cadastrado com sucesso! (ID ${resultado.id})`);
        } catch (erro) {
            mostrarMensagemErro(erro.message);
        }
    });

    function limparFormularioCadastro() {
        document.getElementById('titulo').value = '';
        document.getElementById('plataforma').value = '';
        document.getElementById('genero').value = '';
        document.getElementById('ano').value = '';
        document.getElementById('titulo').focus();
    }

    botaoCancelar.addEventListener("click", limparFormularioCadastro);

    tbody.addEventListener("click", (event) => {
        const botaoEditar = event.target.closest('.edit');
        const botaoDeletar = event.target.closest('.delete');

        if (botaoEditar) {
            const tr = botaoEditar.closest('tr');
            const celulas = tr.querySelectorAll('td');

            linhaParaEditar = tr;
            document.getElementById('edit-id').value = botaoEditar.dataset.id;
            document.getElementById('edit-titulo').value = celulas[1].textContent;
            document.getElementById('edit-plataforma').value = celulas[2].textContent;
            document.getElementById('edit-genero').value = celulas[3].textContent;
            document.getElementById('edit-ano').value = celulas[4].textContent;

            modalEditar.classList.add('ativo');
            return;
        }

        if (botaoDeletar) {
            const tr = botaoDeletar.closest('tr');
            const tituloJogo = tr.querySelectorAll('td')[1].textContent;

            idParaExcluir = botaoDeletar.dataset.id;
            linhaParaExcluir = tr;
            spanNomeExcluir.textContent = `"${tituloJogo}"`;

            modalExcluir.classList.add('ativo');
        }
    });

    btnConfirmarEditar.addEventListener("click", async () => {
        const idJogo = document.getElementById('edit-id').value;
        const dadosAtualizados = {
            titulo: document.getElementById('edit-titulo').value,
            plataforma: document.getElementById('edit-plataforma').value,
            genero: document.getElementById('edit-genero').value,
            anoLancamento: Number(document.getElementById('edit-ano').value)
        };

        try {
            const resposta = await fetch(`http://localhost:3000/api/jogos/${idJogo}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosAtualizados)
            });

            if (!resposta.ok) {
                const erroData = await resposta.json();
                throw new Error(erroData.erro || "Erro ao atualizar o jogo.");
            }

            const jogoAtualizado = await resposta.json();

            if (linhaParaEditar) {
                const celulas = linhaParaEditar.querySelectorAll('td');
                celulas[1].textContent = jogoAtualizado.titulo;
                celulas[2].textContent = jogoAtualizado.plataforma;
                celulas[3].textContent = jogoAtualizado.genero || '';
                celulas[4].textContent = jogoAtualizado.anoLancamento;
            }

            fecharModalEditar();
            mostrarMensagemSucesso("Jogo atualizado com sucesso!");
        } catch (erro) {
            console.error("Erro ao editar:", erro.message);
            mostrarMensagemErro(erro.message);
        }
    });

    btnConfirmarExcluir.addEventListener("click", async () => {
        if (!idParaExcluir) return;

        const idExcluido = idParaExcluir;

        try {
            const resposta = await fetch(`http://localhost:3000/api/jogos/${idExcluido}`, {
                method: "DELETE"
            });

            if (!resposta.ok) {
                const erroData = await resposta.json();
                throw new Error(erroData.erro || "Erro ao excluir o jogo.");
            }

            const resultado = await resposta.json();
            const textoSucesso = typeof resultado === "string"
                ? `Jogo excluído com sucesso! (ID ${idExcluido})`
                : (resultado?.mensagem || `Jogo excluído com sucesso! (ID ${idExcluido})`);

            if (linhaParaExcluir) {
                linhaParaExcluir.remove();
            }
            aplicarFiltroPorId();

            fecharModalExcluir();
            mostrarMensagemSucesso(textoSucesso);
        } catch (erro) {
            console.error("Erro ao deletar:", erro.message);
            mostrarMensagemErro(erro.message);
        }
    });

    function fecharModalEditar() {
        modalEditar.classList.remove('ativo');
        linhaParaEditar = null;
    }

    function fecharModalExcluir() {
        modalExcluir.classList.remove('ativo');
        idParaExcluir = null;
        linhaParaExcluir = null;
    }

    btnFecharEditar.addEventListener("click", fecharModalEditar);
    btnFecharExcluir.addEventListener("click", fecharModalExcluir);

    modalEditar.addEventListener("click", (e) => {
        if (e.target === modalEditar) fecharModalEditar();
    });

    modalExcluir.addEventListener("click", (e) => {
        if (e.target === modalExcluir) fecharModalExcluir();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            fecharModalEditar();
            fecharModalExcluir();
        }
    });
});
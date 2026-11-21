document.addEventListener("DOMContentLoaded", () => {
    const botaoSalvar = document.getElementById('btn-salvar');
    const botaoCancelar = document.getElementById('btn-cancelar');
    const tbody = document.querySelector('.tabela-jogos tbody');

    // Elementos do Modal de Edição
    const modalEditar = document.getElementById('modal-editar');
    const btnFecharEditar = document.getElementById('btn-fechar-editar');
    const btnConfirmarEditar = document.getElementById('btn-confirmar-editar');

    // Elementos do Modal de Exclusão
    const modalExcluir = document.getElementById('modal-excluir');
    const btnFecharExcluir = document.getElementById('btn-fechar-excluir');
    const btnConfirmarExcluir = document.getElementById('btn-confirmar-excluir');
    const spanNomeExcluir = document.getElementById('excluir-nome-jogo');

    // Variáveis de controle para saber qual jogo está sendo editado ou excluído
    let idParaExcluir = null;
    let linhaParaExcluir = null;
    let linhaParaEditar = null;

    // Cria uma linha na tabela com os dados do jogo
    function criarElementoLinha(jogo) {
        const tr = document.createElement('tr');
        tr.dataset.id = jogo.id;

        tr.innerHTML = `
            <td>${jogo.id}</td>
            <td>${jogo.titulo}</td>
            <td>${jogo.plataforma}</td>
            <td>${jogo.genero || ''}</td>
            <td>${jogo.anoLancamento}</td>
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
        tbody.appendChild(novaLinha);
    }

    // Carregar jogos salvos no BD
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
        } catch (erro) {
            console.error("Erro ao buscar jogos:", erro.message);
        }
    }

    carregarJogos();

    // --- PESQUISAR JOGO POR ID (GET /api/jogos/:id) ---
    const inputPesquisa = document.getElementById('pesquisarID');
    let timerPesquisa;

    async function buscarJogoPorId() {
        if (!inputPesquisa) return;

        const termo = inputPesquisa.value.trim();

        // Se apagar a pesquisa, recarrega todos os jogos
        if (termo === '') {
            carregarJogos();
            return;
        }

        const id = Number(termo);

        if (!Number.isInteger(id) || id <= 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">Digite um ID numérico válido.</td>
                </tr>
            `;
            return;
        }

        try {
            const resposta = await fetch(`http://localhost:3000/api/jogos/${id}`);

            if (!resposta.ok) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center;">Nenhum jogo encontrado com o ID ${id}.</td>
                    </tr>
                `;
                return;
            }

            const jogo = await resposta.json();
            tbody.innerHTML = '';
            adicionarLinhaNaTabela(jogo);
        } catch (erro) {
            console.error("Erro ao buscar jogo por ID:", erro.message);
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">Erro ao consultar o servidor.</td>
                </tr>
            `;
        }
    }

    if (inputPesquisa) {
        inputPesquisa.addEventListener("input", () => {
            clearTimeout(timerPesquisa);
            timerPesquisa = setTimeout(buscarJogoPorId, 250);
        });

        inputPesquisa.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                clearTimeout(timerPesquisa);
                buscarJogoPorId();
            }
        });
    }

    // --- CADASTRAR JOGO (POST) ---
    botaoSalvar.addEventListener("click", async (event) => {
        event.preventDefault();

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

            const mensagemCadastrado = document.getElementById("mensagemAviso");

            mensagemCadastrado.textContent = "Jogo cadastrado com sucesso!";
            mensagemCadastrado.style.color = "blue";

            setTimeout(() => {
                mensagemCadastrado.textContent = "";
            }, 2000);

            limparFormularioCadastro();

        } catch (erro) {
           const mensagemErro = document.getElementById("mensagemAviso");

           mensagemErro.textContent = erro.message;
           mensagemErro.style.color = "red";

           setTimeout(() => {
            mensagemErro.textContent = "";
           }, 2000);
        }
    });

    function limparFormularioCadastro() {
        document.getElementById('titulo').value = '';
        document.getElementById('plataforma').value = '';
        document.getElementById('genero').value = '';
        document.getElementById('ano').value = '';
    }

    botaoCancelar.addEventListener("click", limparFormularioCadastro);

    // --- CLIQUES NA TABELA (ABRIR MODAL DE EDITAR OU EXCLUIR) ---
    tbody.addEventListener("click", (event) => {
        const botaoEditar = event.target.closest('.edit');
        const botaoDeletar = event.target.closest('.delete');

        // 1. Abrir Modal de Edição
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

        // 2. Abrir Modal de Exclusão
        if (botaoDeletar) {
            const tr = botaoDeletar.closest('tr');
            const tituloJogo = tr.querySelectorAll('td')[1].textContent;

            idParaExcluir = botaoDeletar.dataset.id;
            linhaParaExcluir = tr;
            spanNomeExcluir.textContent = `"${tituloJogo}"`;

            modalExcluir.classList.add('ativo');
        }
    });

    // --- SALVAR EDIÇÃO (PUT) ---
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

            // Atualiza os dados diretamente na linha da tabela sem precisar recarregar a página
            if (linhaParaEditar) {
                const celulas = linhaParaEditar.querySelectorAll('td');
                celulas[1].textContent = jogoAtualizado.titulo;
                celulas[2].textContent = jogoAtualizado.plataforma;
                celulas[3].textContent = jogoAtualizado.genero || '';
                celulas[4].textContent = jogoAtualizado.anoLancamento;
            }

            fecharModalEditar();
        } catch (erro) {
            console.error("Erro ao editar:", erro.message);
            alert("Erro: " + erro.message);
        }
    });

    // --- CONFIRMAR EXCLUSÃO (DELETE) ---
    btnConfirmarExcluir.addEventListener("click", async () => {
        if (!idParaExcluir) return;

        try {
            const resposta = await fetch(`http://localhost:3000/api/jogos/${idParaExcluir}`, {
                method: "DELETE"
            });

            if (!resposta.ok) {
                const erroData = await resposta.json();
                throw new Error(erroData.erro || "Erro ao excluir o jogo.");
            }

            if (linhaParaExcluir) {
                linhaParaExcluir.remove();
            }

            fecharModalExcluir();
        } catch (erro) {
            console.error("Erro ao deletar:", erro.message);
            alert("Erro: " + erro.message);
        }
    });

    // --- FUNÇÕES PARA FECHAR OS MODAIS ---
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

    // Fechar ao clicar fora do card (no fundo escuro)
    modalEditar.addEventListener("click", (e) => {
        if (e.target === modalEditar) fecharModalEditar();
    });

    modalExcluir.addEventListener("click", (e) => {
        if (e.target === modalExcluir) fecharModalExcluir();
    });

    // Fechar ao pressionar a tecla ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            fecharModalEditar();
            fecharModalExcluir();
        }
    });
});
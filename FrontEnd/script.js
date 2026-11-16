// Espera carregar o HTML por completo
document.addEventListener("DOMContentLoaded", () => {
    const botaoSalvar = document.getElementById('btn-salvar');
    const botaoCancelar = document.getElementById('btn-cancelar')
    const botaoDeletar = document.getElementById('btn-deletar')
    const tbody = document.querySelector('.tabela-jogos tbody');

    // Função para adicionar novas linhas na tabela
    function adicionarLinhaNaTabela(jogo) {
        const novaLinha = document.createElement('tr');

        novaLinha.innerHTML = `
            <td>${jogo.id}</td>
            <td>${jogo.titulo}</td>
            <td>${jogo.plataforma}</td>
            <td>${jogo.genero}</td>
            <td>${jogo.anoLancamento}</td>
            <td class="td-acoes">
                <button class="btn-acao edit" title="Editar">
                    <img src="/FrontEnd/icons/edit.png" alt="Editar">
                </button>
                <button class="btn-acao delete" data-id="${jogo.id}" title="Excluir">
                    <img src="/FrontEnd/icons/trash.png" alt="Excluir">
                </button>
            </td>
        `;

        tbody.appendChild(novaLinha);
    }

    // Função para carregar jogos salvos no BD.
    async function carregarJogos() {
        try {
            const resposta = await fetch("http://localhost:3000/api/jogos");
            if (!resposta.ok) {
                throw new Error("Erro ao carregar a lista de jogos.");
            }

            const listaJogos = await resposta.json();
            
            // Limpa o tbody antes de preencher
            tbody.innerHTML = '';

            // Cria uma linha para cada jogo salvo no banco
            listaJogos.forEach(jogo => {
                adicionarLinhaNaTabela(jogo);
            });

        } catch (erro) {
            console.error("Erro ao buscar jogos:", erro.message);
        }
    }

    carregarJogos();

    botaoSalvar.addEventListener("click", async function (event) {

        // Evita navegador recarregar
        event.preventDefault();

        // Pega os valores dos inputs
        const titulo = document.getElementById('titulo').value;
        const plataforma = document.getElementById('plataforma').value;
        const genero = document.getElementById('genero').value;
        const anoLancamento = document.getElementById('ano').value;

        // Monta o objeto que vai ser enviado para o Backend
        const dadosJogo = {
            titulo, plataforma, genero, anoLancamento: Number(anoLancamento)
        }

        try {
            // Envia a requisição POST para a API
            const resposta = await fetch("http://localhost:3000/api/jogos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dadosJogo)
            });

            if (!resposta.ok) {
                const erroData = await resposta.json();
                throw new Error(erroData.erro || "Erro ao cadastrar o jogo.");
            }

            const resultado = await resposta.json();

            adicionarLinhaNaTabela(resultado);
            
            alert("Jogo cadastrado com sucesso!");

            document.getElementById('titulo').value = '';
            document.getElementById('plataforma').value = '';
            document.getElementById('genero').value = '';
            document.getElementById('ano').value = '';

        } catch (erro) {
            console.log("Erro na requisição", erro.message);
            alert("Erro: " + erro.message);
        }
    });

    botaoCancelar.addEventListener("click", async function (event) {

        document.getElementById('titulo').value = '';
        document.getElementById('plataforma').value = '';
        document.getElementById('genero').value = '';
        document.getElementById('ano').value = '';

    });

    tbody.addEventListener("click", async (event) => {

        const botaoDeletar = event.target.closest('.delete');

        if(!botaoDeletar) return;

        const idJogo = botaoDeletar.dataset.id;

        const confirmou = confirm("Tem certeza que deseja excluir este jogo?");
        
        if (!confirmou) return;

        try {
            const resposta = await fetch(`http://localhost:3000/api/jogos/${idJogo}`, {
                method: "DELETE"
            });

            if(!resposta.ok) {
                const erroData = await resposta.json();
                throw new Error(erroData.erro || "Erro ao excluir o jogo.");
            }

            console.log("Jogo apagado do banco com sucesso!");

            botaoDeletar.closest('tr').remove();

        } catch (erro) {
            console.error("Erro ao deletar:", erro.message);
            alert("Erro: " + erro.message);
        }
    })

})
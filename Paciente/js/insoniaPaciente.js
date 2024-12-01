document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.querySelector(".save-button");
    const arrowLeft = document.querySelector(".arrow-left");
    const arrowRight = document.querySelector(".arrow-right");
    const mensagemSemDadosDiv = document.getElementById("mensagem-sem-dados"); // Div para a mensagem de "Sem Registros"
    const authToken = localStorage.getItem("token");

    let currentMonth = new Date().getMonth(); // Mês atual
    let currentYear = new Date().getFullYear(); // Ano atual
    let insoniaChart = null;

    const nomePaciente = localStorage.getItem("nome-paciente"); // Recupera o nome do paciente
    const nomePacienteSpan = document.getElementById("nome-paciente");

    if (nomePaciente) {
        nomePacienteSpan.textContent = nomePaciente; // Preenche o campo com o nome
    } else {
        nomePacienteSpan.textContent = "Paciente não identificado"; // Mensagem padrão caso não encontre o nome
    }
    
    const email = localStorage.getItem("email-paciente");
    if (!email) {
        alert("E-mail não encontrado. Por favor, faça login novamente.");
        window.location.href = "loginPaciente.html"; // Redireciona para o login
    }
    
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const menuIcon = document.getElementById('icon-toggle'); // Ícone do menu
    const dropdownMenu = document.getElementById('menu-dropdown'); // Dropdown do menu
    const perfilItem = dropdownMenu.querySelector('.meu-perfil'); // Link "Meu Perfil"
    const sairItem = dropdownMenu.querySelector('.sair'); // Link "Sair"

    if (menuIcon && dropdownMenu) {
        // Alternar a exibição do menu ao clicar no ícone
        menuIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique feche o menu imediatamente
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
        });

        // Fechar o menu ao clicar fora dele
        document.addEventListener('click', (event) => {
            if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });

        // Navegar para a página "Meu Perfil"
        perfilItem.addEventListener('click', () => {
            window.location.href = "../Paciente/profilePaciente.html"; // Ajuste o caminho se necessário
        });

        // Navegar para a HomePage ao clicar em "Sair"
        sairItem.addEventListener('click', () => {
            // Opcional: Limpar localStorage ou outros dados de sessão aqui, se necessário
            window.location.href = "../HomePage/homepage.html"; // Ajuste o caminho se necessário
        });
    } else {
        console.error('Menu dropdown ou elementos do menu não encontrados no DOM.');
    }
    
    // Atualiza o título do mês no gráfico
    function atualizarLegendaMes() {
        const legendaMes = `${monthNames[currentMonth]} ${currentYear}`;
        if (insoniaChart) {
            insoniaChart.options.plugins.legend.labels.generateLabels = () => [
                {
                    text: legendaMes,
                    fillStyle: "#2CABAA",
                    strokeStyle: "#2CABAA",
                    lineWidth: 1
                }
            ];
            insoniaChart.update();
        }
    }

    // Função para carregar dados do gráfico
    async function carregarDadosGrafico() {
        try {
            const response = await fetch(`http://localhost:3000/api/insonia/${email}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Erro ao carregar dados");

            const data = await response.json();

            // Filtra os dados para o mês e ano selecionados
            const filteredData = data.data.filter(item => {
                const itemDate = new Date(item.data);
                return (
                    itemDate.getMonth() === currentMonth &&
                    itemDate.getFullYear() === currentYear
                );
            });

            // Ordena os dados pelas datas
            filteredData.sort((a, b) => new Date(a.data) - new Date(b.data));

            atualizarGrafico(filteredData);

            // Exibe ou esconde a mensagem "Sem Registros"
            if (filteredData.length === 0) {
                exibirMensagemSemDados();
            } else {
                esconderMensagemSemDados();
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            atualizarGrafico([]);
            exibirMensagemSemDados();
        }
    }

    // Função para exibir mensagem "Sem Registros"
    function exibirMensagemSemDados() {
        mensagemSemDadosDiv.style.display = "block"; // Exibe a mensagem
    }

    // Função para esconder mensagem "Sem Registros"
    function esconderMensagemSemDados() {
        mensagemSemDadosDiv.style.display = "none"; // Esconde a mensagem
    }

    // Função para salvar o registro
    async function salvarRegistro() {
        const dataInput = document.getElementById("dataInput").value.trim();
        const horaDormirInput = document.getElementById("horaDormirInput").value.trim();
        const horaAcordarInput = document.getElementById("horaAcordarInput").value.trim();
        const vezesAcordouInput = document.getElementById("vezesAcordouInput").value.trim();
        const qualidadeInput = document.getElementById("qualidadeInput").value.trim();

        if (!dataInput || !horaDormirInput || !horaAcordarInput || !vezesAcordouInput || !qualidadeInput) {
            alert("Preencha todos os campos!");
            return;
        }

        const dataISO = ajustarDataParaUTC(dataInput);

        try {
            const response = await fetch("http://localhost:3000/api/insonia/", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    data: dataISO,
                    horaDormir: horaDormirInput,
                    horaAcordar: horaAcordarInput,
                    quantQueAcordou: parseInt(vezesAcordouInput, 10),
                    qualidadeSono: qualidadeInput,
                }),
            });

            if (!response.ok) throw new Error("Erro ao salvar registro.");

            alert("Registro salvo com sucesso!");
            limparCampos();
            carregarDadosGrafico();
        } catch (error) {
            console.error("Erro ao salvar registro:", error);
            alert("Erro ao salvar registro.");
        }
    }

    // Função para limpar os campos de entrada
    function limparCampos() {
        document.getElementById("dataInput").value = "";
        document.getElementById("horaDormirInput").value = "";
        document.getElementById("horaAcordarInput").value = "";
        document.getElementById("vezesAcordouInput").value = "";
        document.getElementById("qualidadeInput").value = "";
    }

    // Função para ajustar a data para UTC
    function ajustarDataParaUTC(data) {
        if (!data || !/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
            throw new Error("Data inválida. O formato correto é DD/MM/AAAA.");
        }
        const [dia, mes, ano] = data.split("/");
        return new Date(`${ano}-${mes}-${dia}T12:00:00Z`).toISOString(); // Ajuste para meio-dia UTC
    }

    // Função para atualizar o gráfico
    function atualizarGrafico(data) {
        const canvas = document.getElementById("insoniaChart");
        const ctx = canvas.getContext("2d");

        const dias = data.length > 0 ? data.map(item => new Date(item.data).getDate()) : [1];
        const quantQueAcordou = data.length > 0 ? data.map(item => item.quantQueAcordou || 0) : [0];
        const horasDormir = data.map(item => item.horaDormir || "N/A");
        const horasAcordar = data.map(item => item.horaAcordar || "N/A");
        const qualidadeSono = data.map(item => item.qualidadeSono || "Não informada");

        if (insoniaChart) insoniaChart.destroy();

        insoniaChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: dias,
                datasets: [
                    {
                        label: `${monthNames[currentMonth]} ${currentYear}`,
                        data: quantQueAcordou,
                        borderColor: "#2CABAA",
                        backgroundColor: "rgba(44, 171, 170, 0.2)",
                        pointBackgroundColor: "#2CABAA",
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    tooltip: {
                        callbacks: {
                            title: (context) => `Dia: ${context[0].label}`,
                            label: (context) => {
                                const index = context.dataIndex;
                                return [
                                    `Qualidade: ${qualidadeSono[index]}`,
                                    `Hora de Dormir: ${horasDormir[index]}`,
                                    `Hora de Acordar: ${horasAcordar[index]}`,
                                    `Vezes Acordou: ${quantQueAcordou[index]}`,
                                ];
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 1,
                        },
                        title: {
                            display: true,
                            text: "Quantas vezes acordou",
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Dias do Mês",
                        },
                    },
                },
            },
        });
    }

    // Navegar pelos meses
    function alterarMes(direcao) {
        currentMonth += direcao;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        carregarDadosGrafico();
        atualizarLegendaMes(); // Atualiza a legenda ao mudar de mês
    }

    // Adiciona eventos de clique para os spans
    arrowLeft.addEventListener("click", () => alterarMes(-1));
    arrowRight.addEventListener("click", () => alterarMes(1));
    saveButton.addEventListener("click", salvarRegistro);

    carregarDadosGrafico(); // Carrega os dados iniciais
});
// Função para voltar à página menuMedico.html
function goBack() {
    window.location.href = 'menuPaciente.html'; // Redireciona para a página menuMedico.html
}
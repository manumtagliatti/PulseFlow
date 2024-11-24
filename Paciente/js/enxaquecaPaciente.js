document.addEventListener("DOMContentLoaded", () => {
    const prevMonthSpan = document.getElementById("prev-month");
    const nextMonthSpan = document.getElementById("next-month");
    const saveButton = document.querySelector(".save-button");
    const authToken = localStorage.getItem("authToken");
    let enxaquecaChart = null;

    let currentMonth = new Date().getMonth(); // Mês atual (0-11)
    let currentYear = new Date().getFullYear(); // Ano atual
    const nomePaciente = localStorage.getItem("nome-paciente"); // Recupera o nome do paciente
    const nomePacienteSpan = document.getElementById("nome-paciente");

    if (nomePaciente) {
        nomePacienteSpan.textContent = nomePaciente; // Preenche o campo com o nome
    } else {
        nomePacienteSpan.textContent = "Paciente não identificado"; // Mensagem padrão caso não encontre o nome
    }
    
    const email = localStorage.getItem("email");
    if (!email) {
        alert("E-mail não encontrado. Por favor, faça login novamente.");
        window.location.href = "loginPaciente.html"; // Redireciona para o login
    }
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Atualiza o título do mês no gráfico
    function atualizarLegendaMes() {
        const legendaMes = `${monthNames[currentMonth]} ${currentYear}`;
        if (enxaquecaChart) {
            enxaquecaChart.options.plugins.legend.labels.generateLabels = () => [
                {
                    text: legendaMes,
                    fillStyle: "#2CABAA",
                    strokeStyle: "#2CABAA",
                    lineWidth: 1
                }
            ];
            enxaquecaChart.update();
        }
    }

    // Função para carregar dados do gráfico
    async function carregarDadosGrafico() {
        try {
            const response = await fetch(`http://localhost:3000/api/enxaqueca/${email}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
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

            atualizarGrafico(filteredData || []);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    }

    // Função para salvar o registro
    async function salvarRegistro() {
        const dataInput = document.getElementById("dataInput").value.trim();
        const horaInput = document.getElementById("horaInput").value.trim();
        const intensidadeInput = document.getElementById("intensidadeInput").value.trim();

        if (!dataInput || !horaInput || !intensidadeInput) {
            alert("Preencha todos os campos!");
            return;
        }

        const dataISO = ajustarDataParaUTC(dataInput);

        try {
            const response = await fetch("http://localhost:3000/api/enxaqueca/", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    data: dataISO,
                    hora: horaInput,
                    intensidadeDor: parseInt(intensidadeInput, 10)
                })
            });

            if (!response.ok) throw new Error("Erro ao salvar o registro.");

            alert("Registro salvo com sucesso!");
            limparCampos(); // Limpa os campos após o registro ser salvo
            carregarDadosGrafico(); // Atualiza os dados do gráfico
        } catch (error) {
            console.error("Erro ao salvar registro:", error);
            alert("Erro ao salvar registro.");
        }
    }

    function ajustarDataParaUTC(data) {
        if (!data || !/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
            throw new Error("Data inválida. O formato correto é DD/MM/AAAA.");
        }
        const [dia, mes, ano] = data.split("/");
        return new Date(`${ano}-${mes}-${dia}T12:00:00Z`).toISOString(); // Ajuste para meio-dia UTC
    }

    // Função para limpar os campos de entrada
    function limparCampos() {
        const dataInput = document.getElementById("dataInput");
        const horaInput = document.getElementById("horaInput");
        const intensidadeInput = document.getElementById("intensidadeInput");

        dataInput.value = "";
        horaInput.value = "";
        intensidadeInput.value = "";
    }

    // Função para atualizar o gráfico
    function atualizarGrafico(data) {
        const ctx = document.getElementById("enxaquecaChart").getContext("2d");

        // Ordenar os dados pela data
        const sortedData = data.sort((a, b) => new Date(a.data) - new Date(b.data));

        const dias = sortedData.map(item => new Date(item.data).getDate());
        const intensidades = sortedData.map(item => item.intensidadeDor);
        const horas = sortedData.map(item => item.hora);

        if (enxaquecaChart) enxaquecaChart.destroy();

        enxaquecaChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: dias,
                datasets: [
                    {
                        label: `${monthNames[currentMonth]} ${currentYear}`,
                        data: intensidades,
                        borderColor: "#2CABAA",
                        backgroundColor: "rgba(44, 171, 170, 0.2)",
                        fill: true
                    }
                ]
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
                                    `Intensidade: ${intensidades[index]}`,
                                    `Hora: ${horas[index]}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
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
    prevMonthSpan.addEventListener("click", () => alterarMes(-1));
    nextMonthSpan.addEventListener("click", () => alterarMes(1));
    saveButton.addEventListener("click", salvarRegistro);

    carregarDadosGrafico(); // Carrega os dados iniciais
});

document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("meu-botao");
    const prevMonthSpan = document.getElementById("prev-month");
    const nextMonthSpan = document.getElementById("next-month");
    const mensagemSemDados = document.getElementById("mensagem-sem-dados");
    const authToken = localStorage.getItem("token");
    const baseURL = 'http://localhost:3000';
    let pressaoChart = null;

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    const nomePaciente = localStorage.getItem("nome-paciente"); 
    const nomePacienteSpan = document.getElementById("nome-paciente");

    if (nomePaciente) {
        nomePacienteSpan.textContent = nomePaciente; 
    } else {
        nomePacienteSpan.textContent = "Paciente não identificado"; 
    }

    const email = localStorage.getItem("email-paciente");
    if (!email) {
        alert("E-mail não encontrado. Por favor, faça login novamente.");
        window.location.href = "loginPaciente.html"; 
    }

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const menuIcon = document.getElementById('icon-toggle');
    const dropdownMenu = document.getElementById('menu-dropdown');
    const perfilItem = dropdownMenu.querySelector('.meu-perfil');
    const sairItem = dropdownMenu.querySelector('.sair');

    if (menuIcon && dropdownMenu) {
        menuIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
        });

        document.addEventListener('click', (event) => {
            if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });

        if (perfilItem) {
            perfilItem.addEventListener('click', () => {
                window.location.href = "../Paciente/profilePaciente.html";
            });
        }

        if (sairItem) {
            sairItem.addEventListener('click', () => {
                window.location.href = "../HomePage/homepage.html";
            });
        }
    }

    function atualizarLegendaMes() {
        const legendElement = document.getElementById("current-month");
        if (legendElement) {
            legendElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }
    }

    async function carregarDadosGrafico() {
        try {
            const response = await fetch(`${baseURL}/api/pressaoArterial/${email}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Erro ao carregar dados");

            const data = await response.json();
            const filteredData = data.data.filter(item => {
                const itemDate = new Date(item.data);
                return (
                    itemDate.getMonth() === currentMonth &&
                    itemDate.getFullYear() === currentYear
                );
            });

            const sortedData = filteredData.sort((a, b) => new Date(a.data) - new Date(b.data));
            const dias = sortedData.map(item => new Date(item.data).getDate());
            const pressao = sortedData.map(item => item.pressao);
            const horas = sortedData.map(item => item.hora);

            if (sortedData.length === 0) {
                mostrarMensagemSemDados();
            } else {
                esconderMensagemSemDados();
            }

            atualizarGrafico(dias, pressao, horas);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            mostrarMensagemSemDados();
            atualizarGrafico([], [], []);
        }
    }

    function salvarRegistro() {
        const dataInput = document.getElementById("input-data").value.trim();
        const pressaoInput = document.getElementById("input-pressao").value.trim();

        if (!dataInput || !pressaoInput) {
            alert("Preencha todos os campos!");
            return;
        }

        const dataISO = ajustarDataParaUTC(dataInput);

        fetch(`${baseURL}/api/pressaoArterial`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                data: dataISO,
                pressao: parseInt(pressaoInput, 10),
            }),
        })
            .then(response => {
                if (!response.ok) throw new Error("Erro ao salvar o registro.");
                alert("Registro salvo com sucesso!");
                limparCampos();
                carregarDadosGrafico();
            })
            .catch(error => {
                console.error("Erro ao salvar registro:", error);
                alert("Erro ao salvar registro.");
            });
    }

    function ajustarDataParaUTC(data) {
        if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            throw new Error("Data inválida. O formato correto é YYYY-MM-DD.");
        }
        const [ano, mes, dia] = data.split("-");
        return new Date(`${ano}-${mes}-${dia}T12:00:00Z`).toISOString(); 
    }

    function limparCampos() {
        document.getElementById("input-data").value = "";
        document.getElementById("input-pressao").value = "";
    }

    function atualizarGrafico(dias, pressao, horas) {
        const ctx = document.getElementById("grafico-pressao").getContext("2d");

        if (pressaoChart) pressaoChart.destroy();

        pressaoChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: dias,
                datasets: [
                    {
                        label: "Pressão Arterial",
                        data: pressao,
                        borderColor: "#2CABAA",
                        backgroundColor: "rgba(44, 171, 170, 0.2)",
                        fill: true,
                        pointRadius: 5,
                        pointBackgroundColor: "#2CABAA",
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
                                    `Pressão Arterial: ${context.raw} mmHg`,
                                    `Hora: ${horas[index]}`,
                                ];
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 10,
                        },
                        title: {
                            display: true,
                            text: "Pressão Arterial (mmHg)",
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

    function mostrarMensagemSemDados() {
        if (mensagemSemDados) mensagemSemDados.style.display = "block";
    }

    function esconderMensagemSemDados() {
        if (mensagemSemDados) mensagemSemDados.style.display = "none";
    }

    function alterarMes(direcao) {
        currentMonth += direcao;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        atualizarLegendaMes();
        carregarDadosGrafico();
    }

    if (prevMonthSpan) prevMonthSpan.addEventListener("click", () => alterarMes(-1));
    if (nextMonthSpan) nextMonthSpan.addEventListener("click", () => alterarMes(1));
    if (saveButton) saveButton.addEventListener("click", salvarRegistro);

    atualizarLegendaMes();
    carregarDadosGrafico();
});

// Função para voltar à página menuMedico.html
function goBack() {
    window.location.href = 'menuPaciente.html'; // Redireciona para a página menuMedico.html
}

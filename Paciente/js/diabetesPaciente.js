document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("enviar-dados");
    const prevMonthSpan = document.getElementById("prev-month");
    const nextMonthSpan = document.getElementById("next-month");
    const mensagemSemDados = document.getElementById("mensagem-sem-dados");
    const authToken = localStorage.getItem("token");
    const baseURL = 'http://localhost:3000';
    let diabetesChart = null;

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

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

    //menu para navegar para home-page e perfil
    const menuIcon = document.getElementById('icon-toggle');
    const dropdownMenu = document.getElementById('menu-dropdown');
    const perfilItem = dropdownMenu.querySelector('.meu-perfil');
    const sairItem = dropdownMenu.querySelector('.sair');

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
            window.location.href = "../Paciente/profilePaciente.html"; // Ajuste o caminho caso necessário
        });

        // Navegar para a HomePage ao clicar em "Sair"
        sairItem.addEventListener('click', () => {
            window.location.href = "../HomePage/homepage.html"; // Ajuste o caminho caso necessário
        });
    } else {
        console.error('Menu dropdown ou elementos do menu não encontrados no DOM.');
    }

    function atualizarLegendaMes() {
        const legendElement = document.getElementById("current-month");
        if (legendElement) {
            legendElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }
    }

    async function carregarDadosGrafico() {
        try {
            const response = await fetch(`${baseURL}/api/diabetes/${email}`, {
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

            // Ordena os dados pelos dias
            const sortedData = filteredData.sort((a, b) => new Date(a.data) - new Date(b.data));

            const dias = sortedData.map(item => new Date(item.data).getDate());
            const glicemias = sortedData.map(item => item.nivelGlicemia);
            const horas = sortedData.map(item => item.hora);

            if (sortedData.length === 0) {
                mostrarMensagemSemDados();
            } else {
                esconderMensagemSemDados();
            }

            atualizarGrafico(dias, glicemias, horas);

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            mostrarMensagemSemDados();
            atualizarGrafico([], [], []);
        }
    }

    function salvarRegistro() {
        const dataInput = document.getElementById("inputData").value.trim();
        const horaInput = document.getElementById("inputHora").value.trim();
        const glicemiaInput = document.getElementById("inputGlicemia").value.trim();

        if (!dataInput || !horaInput || !glicemiaInput) {
            alert("Preencha todos os campos!");
            return;
        }

        const dataISO = ajustarDataParaUTC(dataInput);

        fetch(`${baseURL}/api/diabetes`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                data: dataISO,
                hora: horaInput,
                nivelGlicemia: parseInt(glicemiaInput, 10),
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
        return new Date(`${ano}-${mes}-${dia}T12:00:00Z`).toISOString(); // Define como meio-dia UTC
    }

    function limparCampos() {
        document.getElementById("inputData").value = "";
        document.getElementById("inputHora").value = "";
        document.getElementById("inputGlicemia").value = "";
    }

    function atualizarGrafico(dias, glicemias, horas) {
        const ctx = document.getElementById("grafico-glicemia").getContext("2d");

        if (diabetesChart) diabetesChart.destroy();

        // Calculando o valor mínimo e máximo das glicemias para ajustar o eixo Y
        const minGlicemia = Math.min(...glicemias);
        const maxGlicemia = Math.max(...glicemias);

        diabetesChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: dias,
                datasets: [
                    {
                        label: "Nível de Glicemia",
                        data: glicemias,
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
                                    `Nível de Glicemia: ${context.raw} mg/dL`,
                                    `Hora: ${horas[index]}`,
                                ];
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: minGlicemia - (maxGlicemia - minGlicemia) * 0.1, // Ajuste do mínimo com uma margem
                        max: maxGlicemia + (maxGlicemia - minGlicemia) * 0.1, // Ajuste do máximo com uma margem
                        ticks: {
                            stepSize: 50,
                        },
                        title: {
                            display: true,
                            text: "Nível de Glicemia (mg/dL)",
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
        mensagemSemDados.style.display = "block";
    }

    function esconderMensagemSemDados() {
        mensagemSemDados.style.display = "none";
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

    prevMonthSpan.addEventListener("click", () => alterarMes(-1));
    nextMonthSpan.addEventListener("click", () => alterarMes(1));
    saveButton.addEventListener("click", salvarRegistro);

    atualizarLegendaMes();
    carregarDadosGrafico();
});
// Função para voltar à página menuMedico.html
function goBack() {
    window.location.href = 'menuPaciente.html'; // Redireciona para a página menuMedico.html
}

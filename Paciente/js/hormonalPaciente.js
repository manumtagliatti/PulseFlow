document.addEventListener("DOMContentLoaded", async () => {
    const authToken = localStorage.getItem("authToken");
    const baseURL = 'http://localhost:3000'; // Ajuste para o endereço do backend
    const email = localStorage.getItem("email-paciente");
    const nomePaciente = localStorage.getItem("nome-paciente");
    let hormonalChart = null;
    let currentDate = new Date(); // Data atual
    let currentMonth = currentDate.getMonth(); // Mês atual (0-11)
    let currentYear = currentDate.getFullYear(); // Ano atual


    // Verifica o token e o e-mail
    if (!authToken || !email) {
        alert("Sessão inválida. Por favor, faça login novamente.");
        window.location.href = "loginPaciente.html";
        return;
    }

    // Atualiza o nome do paciente no DOM
    const nomePacienteSpan = document.getElementById("nome-paciente");
    if (nomePaciente) {
        nomePacienteSpan.textContent = nomePaciente; // Preenche o campo com o nome
    } else {
        nomePacienteSpan.textContent = "Paciente não identificado"; // Mensagem padrão
    }

    // Configura navegação do menu
    setupMenuNavigation();

    // Configura eventos do botão de salvar
    document.getElementById("salvar-medicao").addEventListener("click", salvarRegistro);

    // Configura navegação dos meses
    const prevMonth = document.getElementById("prev-month");
    const nextMonth = document.getElementById("next-month");
    prevMonth.addEventListener("click", () => alterarMes(-1));
    nextMonth.addEventListener("click", () => alterarMes(1));

    // Atualiza o gráfico
    atualizarLegendaMes();
    await carregarDadosGrafico();

    function setupMenuNavigation() {
        const menuIcon = document.getElementById("icon-toggle");
        const dropdownMenu = document.getElementById("menu-dropdown");

        menuIcon.addEventListener("click", () => {
            dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
        });

        document.addEventListener("click", (event) => {
            if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.style.display = "none";
            }
        });

        document.querySelector(".meu-perfil").addEventListener("click", () => {
            window.location.href = "profilePaciente.html";
        });

        document.querySelector(".sair").addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "../HomePage/homepage.html";
        });
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const salvarButton = document.getElementById("salvar-medicao");
        const inputData = document.getElementById("input-data");
        const inputHormonio = document.getElementById("input-hormonio");
        const inputDosagem = document.getElementById("input-dosagem");
    
        if (!salvarButton || !inputData || !inputHormonio || !inputDosagem) {
            console.error("Elementos de entrada ou botão não encontrados no DOM.");
            return;
        }
    
        salvarButton.addEventListener("click", salvarRegistro);
    });
    
    async function carregarDadosGrafico() {
        try {
            console.log(`Carregando dados para o e-mail: ${email}`);
        
            const response = await fetch(`${baseURL}/api/hormonal/${email}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
        
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
        
            const { data } = await response.json();
            console.log("Dados recebidos:", data);
        
            const registrosDoMes = filtrarRegistrosPorMes(data);
        
            if (registrosDoMes.length === 0) {
                console.log("Nenhum registro encontrado para o mês selecionado.");
                mostrarMensagemSemDados();
                atualizarGrafico([]); // Inicializa o gráfico vazio
            } else {
                esconderMensagemSemDados();
                atualizarGrafico(registrosDoMes);
            }
        } catch (error) {
            console.error("Erro ao carregar dados hormonais:", error);
            mostrarMensagemSemDados();
            atualizarGrafico([]); // Inicializa o gráfico vazio mesmo com erro
        }
    }
    

    function salvarRegistro() {
        const dataInput = document.getElementById("input-data").value;
        const hormonio = document.getElementById("input-hormonio").value.trim();
        const dosagem = document.getElementById("input-dosagem").value.trim();
    
        if (!dataInput || !hormonio || !dosagem) {
            alert("Por favor, preencha todos os campos!");
            return;
        }
    
        // Ajusta a data para UTC para evitar problemas de fuso horário
        const data = new Date(dataInput);
        data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    
        fetch(`${baseURL}/api/hormonal`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                email,
                data: data.toISOString(),
                hormonio,
                dosagem,
            }),
        })
            .then((response) => {
                if (!response.ok) throw new Error("Erro ao salvar o registro.");
                alert("Registro salvo com sucesso!");
                limparCampos(); // Limpa os campos após salvar
                carregarDadosGrafico(); // Atualiza o gráfico
            })
            .catch((error) => {
                console.error("Erro ao salvar registro:", error);
                alert("Erro ao salvar o registro.");
            });
    }
    
    // Função para limpar os campos de entrada
    function limparCampos() {
        document.getElementById("input-data").value = "";
        document.getElementById("input-hormonio").value = "";
        document.getElementById("input-dosagem").value = "";
    }
    
    function filtrarRegistrosPorMes(registros) {
        return registros.filter((registro) => {
            const registroData = new Date(registro.data);
            return (
                registroData.getMonth() === currentMonth &&
                registroData.getFullYear() === currentYear
            );
        });
    }

    function atualizarGrafico(registros) {
        // Ordena os registros por data
        const registrosOrdenados = registros.sort((a, b) => new Date(a.data) - new Date(b.data));
    
        const labels = registrosOrdenados.map((r) => new Date(r.data).getDate());
        const dosagens = registrosOrdenados.map((r) => r.dosagem);
        const hormonios = registrosOrdenados.map((r) => r.hormonio); // Adiciona o hormônio às tooltips
    
        if (hormonalChart) hormonalChart.destroy();
    
        hormonalChart = new Chart(document.getElementById("grafico-hormonal").getContext("2d"), {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Dosagem Hormonal",
                        data: dosagens,
                        borderColor: "rgba(44, 171, 170, 1)",
                        backgroundColor: "rgba(44, 171, 170, 0.2)",
                        fill: true,
                        pointRadius: 5,
                        tension: 0.3,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Garante que o gráfico mantenha a dimensão definida
                plugins: {
                    legend: { display: true },
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => {
                                const index = tooltipItem.dataIndex;
                                return [
                                    `Hormônio: ${hormonios[index]}`, // Mostra apenas o hormônio
                                    `Dosagem: ${tooltipItem.raw}`, // Mostra a dosagem
                                ];
                            },
                            title: () => null, // Remove o título (dia) da tooltip
                        },
                    },
                },
                scales: {
                    y: { title: { display: true, text: "Dosagem Hormonal" }, min: 0, max: 5 },
                    x: { title: { display: true, text: "Dias do Mês" } },
                },
            },
        });
    }
   
    function alterarMes(delta) {
        currentMonth += delta;
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
    

    function atualizarLegendaMes() {
        const monthNames = [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
        ];
        document.getElementById("current-month").textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    

    function mostrarMensagemSemDados() {
        document.getElementById("mensagem-sem-dados").style.display = "block";
    }

    function esconderMensagemSemDados() {
        document.getElementById("mensagem-sem-dados").style.display = "none";
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const mensagemSemDados = document.getElementById("mensagem-sem-dados");
    const saveButton = document.querySelector(".save-button");
    const arrowLeft = document.querySelector(".arrow-left");
    const arrowRight = document.querySelector(".arrow-right");
    const authToken = localStorage.getItem("authToken");
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let asmaChart = null;
    let registros = [];

    const nomePaciente = localStorage.getItem("nome-paciente"); // Recupera o nome do paciente
    const nomePacienteSpan = document.getElementById("nome-paciente");

    if (nomePaciente) {
        nomePacienteSpan.textContent = nomePaciente; // Preenche o campo com o nome
    } else {
        nomePacienteSpan.textContent = "Paciente não identificado"; // Mensagem padrão caso não encontre o nome
    }

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const email = localStorage.getItem("email-paciente");
    if (!email) {
        alert("E-mail não encontrado. Por favor, faça login novamente.");
        window.location.href = "loginPaciente.html"; // Redireciona para o login
    }

    //botao superior para redirecionar para a homePage e perfil
    // Configurar o botão do dropdown
        // Configuração do menu dropdown
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
                window.location.href = "../Paciente/profilePaciente.html";
            });
    
            // Navegar para a HomePage ao clicar em "Sair"
            sairItem.addEventListener('click', () => {
                window.location.href = "../HomePage/homepage.html";
            });
        } else {
            console.error('Menu dropdown ou elementos do menu não encontrados no DOM.');
        }    

    // Função para carregar dados do gráfico do backend
    async function carregarDadosGrafico(email, authToken) {
        try {
            const response = await fetch(`http://localhost:3000/api/asma/${email}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Erro ao carregar dados do gráfico");

            const data = await response.json();
            registros = data.data || [];

            // Filtrar dados por mês e ano
            const filteredData = registros.filter(
                (item) =>
                    new Date(item.dataCrise).getMonth() === currentMonth &&
                    new Date(item.dataCrise).getFullYear() === currentYear
            );

            // Ordenar os dados pelo dia
            filteredData.sort((a, b) => new Date(a.dataCrise) - new Date(b.dataCrise));

            atualizarGrafico(filteredData);

            // Preencher os campos com o último registro
            if (filteredData.length > 0) preencherCampos(filteredData[filteredData.length - 1]);

            if(filteredData.length === 0)  mensagemSemDados.style.display = "block";
            else mensagemSemDados.style.display = "none";
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            exibirMensagemSemDados();
        }
    }

    async function salvarRegistro() {
        try {
            if (!authToken) {
                alert("Você não está autenticado. Por favor, faça login novamente.");
                window.location.href = "login.html"; // Redirecione para a página de login
                return;
            }
    
            const dataCriseInput = document.getElementById("dataCrise").value.trim();
            const horaCrise = document.getElementById("horaCrise").value.trim();
            const tempoDuracaoCrise = document.getElementById("tempoDuracaoCrise").value.trim();
            const intensidadeCrise = parseInt(document.getElementById("intensidadeCrise").value.trim(), 10);
            const horarioMedicao = document.getElementById("horarioMedicao").value.trim();
    
            if (!dataCriseInput || !horaCrise || !tempoDuracaoCrise || isNaN(intensidadeCrise)) {
                alert("Todos os campos devem ser preenchidos corretamente!");
                return;
            }
    
            const dataCrise = ajustarDataParaUTC(dataCriseInput); // Validar e ajustar a data
    
            const response = await fetch("http://localhost:3000/api/asma/", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    dataCrise,
                    horaCrise,
                    tempoDuracaoCrise,
                    intensidadeCrise,
                    horarioMedicao
                })
            });
    
            if (response.status === 401) {
                alert("Sessão expirada. Por favor, faça login novamente.");
                window.location.href = "login.html"; // Redirecione para a página de login
                return;
            }
    
            if (!response.ok) throw new Error("Erro ao salvar registro");
    
            alert("Registro salvo com sucesso!");
            limparCampos(); // Limpa os campos após salvar
            carregarDadosGrafico(email, authToken); // Atualiza o gráfico
        } catch (error) {
            console.error("Erro ao salvar registro:", error);
            alert(error.message || "Erro ao salvar registro. Tente novamente.");
        }
    }
    
    
    function atualizarGrafico(data) {
        const ctx = document.getElementById("asmaChart").getContext("2d");
    
        // Extrair os dias e intensidades dos registros salvos
        const dias = data.map(item => new Date(item.dataCrise).getDate());
        const intensidades = data.map(item => item.intensidadeCrise);
    
        if (asmaChart) asmaChart.destroy();
    
        asmaChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: dias, // Dias com registros no eixo X
                datasets: [
                    {
                        label: `${monthNames[currentMonth]} ${currentYear}`, // Legenda do gráfico
                        data: intensidades,
                        borderColor: "#2CABAA",
                        backgroundColor: "rgba(44, 171, 170, 0.2)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: "#2CABAA"
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                        labels: {
                            color: "#333"
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                return `Dia: ${context[0].label}`;
                            },
                            label: function (context) {
                                const index = context.dataIndex;
                                const registro = data[index];
                                return [
                                    `Intensidade: ${registro.intensidadeCrise}`,
                                    `Hora da Crise: ${registro.horaCrise}`,
                                    `Duração: ${registro.tempoDuracaoCrise}`,
                                    `Horário Medicação: ${registro.horarioMedicao || "Não informado"}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 10, // Limite máximo para 10
                        title: {
                            display: true,
                            text: "Intensidade da Crise",
                            color: "#333"
                        },
                        ticks: {
                            stepSize: 1, // Incrementos de 1 em 1
                            callback: function (value) {
                                return value; // Mostrar os valores diretamente
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Dias com Registros",
                            color: "#333"
                        }
                    }
                }
            }
        });
    }
    
    
    
    function ajustarDataParaUTC(data) {
        // Ajustar para aceitar o formato brasileiro DD/MM/AAAA
        if (!data || !/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
            throw new Error("Data inválida. O formato correto é DD/MM/AAAA.");
        }
        const [dia, mes, ano] = data.split("/");
        return new Date(ano, mes - 1, dia).toISOString();
    }
    
    function limparCampos() {
        // Reseta os valores e placeholders
        document.getElementById("dataCrise").value = "";
        document.getElementById("dataCrise").placeholder = "Data da crise";
        document.getElementById("horaCrise").value = "";
        document.getElementById("horaCrise").placeholder = "Hora da crise";
        document.getElementById("tempoDuracaoCrise").value = "";
        document.getElementById("tempoDuracaoCrise").placeholder = "Duração da crise (em minutos)";
        document.getElementById("intensidadeCrise").value = "";
        document.getElementById("intensidadeCrise").placeholder = "Intensidade da crise (1-10)";
        document.getElementById("horarioMedicao").value = "";
        document.getElementById("horarioMedicao").placeholder = "Horário da medicação";
    }
    

    // Função para exibir mensagem quando não há dados
    function exibirMensagemSemDados() {
        if (asmaChart) asmaChart.destroy();
        const ctx = document.getElementById("asmaChart").getContext("2d");
        asmaChart = new Chart(ctx, {
            type: "line",
            data: { labels: ["Sem Dados"], datasets: [{ data: [null], label: "Sem Dados" }] },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

// Preencher os campos de input com placeholders
function preencherCampos() {
    document.getElementById("dataCrise").placeholder = "Data da crise";
    document.getElementById("horaCrise").placeholder = "Hora da crise";
    document.getElementById("tempoDuracaoCrise").placeholder = "Duração da crise (em minutos)";
    document.getElementById("intensidadeCrise").placeholder = "Intensidade da crise (1-10)";
    document.getElementById("horarioMedicao").placeholder = "Horário da medicação";
}

function ajustarDataParaUTC(data) {
    if (!data || !/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
        throw new Error("Data inválida. O formato correto é DD/MM/AAAA.");
    }
    const [dia, mes, ano] = data.split("/");
    return new Date(ano, mes - 1, dia).toISOString();
}

// Configurar campos ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    preencherCampos();

    // Você pode adicionar mais comportamentos aqui, se necessário
});
    // Navegar para o mês anterior
    arrowLeft.addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        carregarDadosGrafico(email, authToken);
    });

    // Navegar para o próximo mês
    arrowRight.addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        carregarDadosGrafico(email, authToken);
    });

    // Event listener para o botão de salvar registro
    saveButton.addEventListener("click", salvarRegistro);

    // Carregar dados iniciais
    carregarDadosGrafico(email, authToken);
});
function limparTexto(element) {
    if (element.value.startsWith("Insira")) {
        element.value = ""; // Limpa o texto se for o valor padrão
    }
}

function restaurarTexto(element, placeholder) {
    if (element.value.trim() === "") {
        element.value = placeholder; // Restaura o texto padrão se o campo estiver vazio
    }
}


 
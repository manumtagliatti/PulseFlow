document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');

    const emailPaciente = localStorage.getItem("email-paciente");
    if (!emailPaciente) {
        alert("E-mail não encontrado. Por favor, insira o e-mail do seu paciente.");
        window.location.href = "principalMedico.html"; // Redireciona para selecionar o email do paciente
    }

    if (!authToken) {
        alert("Você precisa fazer login primeiro.");
        window.location.href = "loginMedico.html";
        return;
    }

    carregarNomeMedico(authToken);
    carregarDadosGraficoAsma(emailPaciente, authToken);

    //menu para navegar para home page e perfil
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
            window.location.href = "profileMedico.html"; // Novo caminho do perfil
        });

        // Navegar para a HomePage ao clicar em "Sair"
        sairItem.addEventListener('click', () => {
            // Opcional: Limpar localStorage ou outros dados de sessão aqui, se necessário
            window.location.href = "../HomePage/homepage.html"; // Caminho permanece o mesmo
        });
    } else {
        console.error('Menu dropdown ou elementos do menu não encontrados no DOM.');
    }


    document.getElementById('prev-month').addEventListener('click', () => {
        alterarMes(-1);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        alterarMes(1);
    });

    updateMonthTitle();
    initializeChartAsma();
});

let chartInstanceAsma;
let asmaData = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function carregarNomeMedico(authToken) {
    fetch('http://localhost:3000/api/medico/perfil', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao buscar o nome do médico.");
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('nome-medico').textContent = ` Dr. ${data.medico.nomeCompleto}`;
    })
    .catch(error => {
        console.error("Erro ao buscar o nome do médico:", error);
        document.getElementById('nome-medico').textContent = 'Dr.';
    });
}

function carregarDadosGraficoAsma(emailPaciente, authToken) {
    fetch(`http://localhost:3000/api/asma/${emailPaciente}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao buscar os dados de crises de asma.");
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.data || data.data.length === 0) {
            mostrarMensagemSemDadosAsma();
            return;
        }

        asmaData = data.data.map(item => ({
            date: new Date(item.dataCrise),
            intensidade: item.intensidadeCrise,
            duration: item.tempoDuracaoCrise,
            time: item.horaCrise
        }));

        updateChartAsma();
    })
    .catch(error => {
        console.error("Erro ao buscar os dados de crises de asma:", error);
        mostrarMensagemSemDadosAsma();
    });
}



function updateMonthTitle() {
    const monthTitle = document.getElementById('current-month');
    if (monthTitle) {
        monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
}

function alterarMes(offset) {
    currentMonth += offset;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    updateMonthTitle();

    // Atualizar o rótulo do gráfico com o novo mês e ano
    if (chartInstanceAsma) {
        chartInstanceAsma.data.datasets[0].label = `${monthNames[currentMonth]} ${currentYear}`;
        chartInstanceAsma.update();
    }

    updateChartAsma();
}

function initializeChartAsma() {
    const ctx = document.getElementById('asmaChart').getContext('2d');
    chartInstanceAsma = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Rótulos do eixo X
            datasets: [{
                label: `${monthNames[currentMonth]} ${currentYear}`,
                data: [], // Dados de intensidade
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            const day = chartInstanceAsma.data.labels[index];
                            return `Dia ${day}`;
                        },
                        label: function(context) {
                            const index = context.dataIndex;
                            const sortedData = chartInstanceAsma.data.datasets[0].data[index];
                            const duration = asmaData.find(item => item.intensidade === sortedData)?.duration || "Desconhecida";
                            const time = asmaData.find(item => item.intensidade === sortedData)?.time || "Hora não registrada";
                            return `Intensidade: ${context.raw}, Duração: ${duration}, Hora: ${time}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Dias do Mês'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Intensidade da Crise'
                    },
                    min: 1, // Começa no valor 1
                    max: 11, // Termina no valor 15
                    ticks: {
                        stepSize: 1, // Adiciona divisores de 1 em 1
                        callback: function(value) {
                            // Adiciona rótulos específicos
                            if (value === 3) return 'Leve';
                            if (value === 5) return 'Moderada';
                            if (value === 7) return 'Severa';
                            return ''; // Outros valores sem rótulos
                        }
                    },
                    grid: {
                        drawTicks: true,
                        color: 'rgba(200, 200, 200, 0.3)', // Linhas de grade neutras
                        drawBorder: true // Mantém a borda visível
                    }
                }
            }
        }
    });
}

function updateChartAsma() {
    const filteredData = asmaData.filter(item => 
        item.date.getMonth() === currentMonth && item.date.getFullYear() === currentYear
    );

    const sortedData = filteredData.sort((a, b) => a.date.getDate() - b.date.getDate());

    if (sortedData.length === 0) {
        mostrarMensagemSemDadosAsma();
        return;
    }

    const labels = sortedData.map(item => item.date.getDate());
    const data = sortedData.map(item => item.intensidade);

    chartInstanceAsma.data.labels = labels;
    chartInstanceAsma.data.datasets[0].data = data;

    chartInstanceAsma.update();
    document.getElementById('mensagem-sem-dados').style.display = 'none';
}


function mostrarMensagemSemDadosAsma() {
    if (chartInstanceAsma) {
        chartInstanceAsma.data.labels = ['Sem dados'];
        chartInstanceAsma.data.datasets[0].data = [null];
        chartInstanceAsma.update();
    }
    const mensagemSemDados = document.getElementById('mensagem-sem-dados');
    if (mensagemSemDados) {
        mensagemSemDados.style.display = 'block';
    }
}

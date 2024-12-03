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
    carregarDadosGraficoEnxaqueca(emailPaciente, authToken);

    document.getElementById('prev-month').addEventListener('click', () => {
        alterarMes(-1);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        alterarMes(1);
    });

    initializeChartEnxaqueca();
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
            window.location.href = "profileMedico.html"; // Caminho ajustado para o perfil do médico
        });

        // Navegar para a HomePage ao clicar em "Sair"
        sairItem.addEventListener('click', () => {
            // Opcional: Limpar localStorage ou outros dados de sessão aqui, se necessário
            window.location.href = "../HomePage/homepage.html"; // Caminho da homepage permanece o mesmo
        });
    } else {
        console.error('Menu dropdown ou elementos do menu não encontrados no DOM.');
    }

});

// Função para voltar à página menuMedico.html
function goBack() {
    window.location.href = 'menuMedico.html'; // Redireciona para a página menuMedico.html
}

let chartInstanceEnxaqueca;
let enxaquecaData = [];
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
        document.getElementById('nome-medico').textContent = ` ${data.medico.nomeCompleto}`;
    })
    .catch(error => {
        console.error("Erro ao buscar o nome do médico:", error);
        document.getElementById('nome-medico').textContent = '';
    });
}

function carregarDadosGraficoEnxaqueca(emailPaciente, authToken) {
    fetch(`http://localhost:3000/api/enxaqueca/${emailPaciente}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao buscar os dados de enxaquecas.");
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.data || data.data.length === 0) {
            mostrarMensagemSemDados();
            return;
        }

        // Ajustando a data para evitar problemas de fuso horário
        enxaquecaData = data.data.map(item => ({
            date: new Date(item.data),
            intensidade: item.intensidadeDor,
            duration: item.tempoDuracao,
            time: item.hora
        }));

        enxaquecaData = enxaquecaData.map(item => ({
            ...item,
            date: new Date(item.date.getTime() + item.date.getTimezoneOffset() * 60000)
        }));

        updateChartEnxaqueca();
    })
    .catch(error => {
        console.error("Erro ao buscar os dados de enxaquecas:", error);
        mostrarMensagemSemDados();
    });
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

    // Atualiza a legenda do gráfico se o gráfico existir
    if (chartInstanceEnxaqueca) {
        chartInstanceEnxaqueca.data.datasets[0].label = `${monthNames[currentMonth]} ${currentYear}`;
        chartInstanceEnxaqueca.update();
    }

    updateChartEnxaqueca();
}

function initializeChartEnxaqueca() {
    const ctx = document.getElementById('enxaquecaChart').getContext('2d');
    chartInstanceEnxaqueca = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: `${monthNames[currentMonth]} ${currentYear}`,
                data: [],
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
                            const day = chartInstanceEnxaqueca.data.labels[index];
                            return `Dia ${day}`;
                        },
                        label: function(context) {
                            const index = context.dataIndex;
                            const dataPoint = enxaquecaData.find(item => item.date.getDate() === chartInstanceEnxaqueca.data.labels[index]);
                            const duration = dataPoint?.duration || "Desconhecida";
                            const time = dataPoint?.time || "Hora não registrada";
                            return `Intensidade: ${context.raw}, Duração: ${duration} min, Hora: ${time}`;
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
                        text: 'Intensidade da Dor'
                    },
                    min: 1,
                    max: 10,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            if (value === 1) return '1';
                            if (value === 2) return '2';
                            if (value === 3) return '3';
                            if (value === 4) return '4';
                            if (value === 5) return '5';
                            if (value === 6) return '6';
                            if (value === 7) return '7';
                            if (value === 8) return '8';
                            if (value === 9) return '9';
                            if (value === 10) return '10';
                            return '';
                        }
                    }
                }
            }
        }
    });
}

function updateChartEnxaqueca() {
    const filteredData = enxaquecaData.filter(item => 
        item.date.getMonth() === currentMonth && item.date.getFullYear() === currentYear
    );

    const sortedData = filteredData.sort((a, b) => a.date - b.date);

    if (sortedData.length === 0) {
        mostrarMensagemSemDados();
        return;
    }

    const labels = sortedData.map(item => item.date.getDate());
    const data = sortedData.map(item => item.intensidade);

    chartInstanceEnxaqueca.data.labels = labels;
    chartInstanceEnxaqueca.data.datasets[0].data = data;

    chartInstanceEnxaqueca.update();
    document.getElementById('mensagem-sem-dados').style.display = 'none';
}

function mostrarMensagemSemDados() {
    if (chartInstanceEnxaqueca) {
        chartInstanceEnxaqueca.data.labels = [];
        chartInstanceEnxaqueca.data.datasets[0].data = [];
        chartInstanceEnxaqueca.update();
    }
    const mensagemSemDados = document.getElementById('mensagem-sem-dados');
    if (mensagemSemDados) {
        mensagemSemDados.style.display = 'block';
    }
}

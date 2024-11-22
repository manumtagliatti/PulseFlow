document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');
    const email = 'maria@exemple.com'; // Email do paciente

    if (!authToken) {
        alert("Você precisa fazer login primeiro.");
        window.location.href = "loginMedico.html";
        return;
    }

    carregarNomeMedico(authToken);
    carregarDadosGraficoInsonia(email, authToken);

    const menuIcon = document.getElementById('icon-toggle');
    const dropdownMenu = document.getElementById('menu-dropdown');

    menuIcon.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (event) => {
        if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    document.querySelector('.meu-perfil').addEventListener('click', () => {
        window.location.href = "profileMedico.html";
    });

    document.querySelector('.sair').addEventListener('click', () => {
        window.location.href = "../HomePage/homepage.html";
    });

    document.getElementById('prev-month').addEventListener('click', () => {
        alterarMes(-1);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        alterarMes(1);
    });

    updateMonthTitle();
    initializeChartInsonia();
});

let chartInstanceInsonia;
let insoniaData = [];
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

function carregarDadosGraficoInsonia(email, authToken) {
    const encodedEmail = encodeURIComponent(email);

    fetch(`http://localhost:3000/api/insonia/${encodedEmail}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar os dados de insônia.');
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.data || data.data.length === 0) {
                mostrarMensagemSemDadosInsonia();
                return;
            }

            // Mapeia e ordena os dados por data
            insoniaData = data.data
                .map(item => ({
                    date: new Date(item.data),
                    horaDormir: item.horaDormir,
                    horaAcordar: item.horaAcordar,
                    quantQueAcordou: item.quantQueAcordou,
                }))
                .sort((a, b) => a.date - b.date); // Ordena pela data

            updateChartInsonia();
        })
        .catch(error => {
            console.error('Erro ao buscar os dados de insônia:', error);
            mostrarMensagemSemDadosInsonia();
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
    if (chartInstanceInsonia) {
        chartInstanceInsonia.data.datasets[0].label = `${monthNames[currentMonth]} ${currentYear}`;
        chartInstanceInsonia.update();
    }

    updateChartInsonia();
}

function initializeChartInsonia() {
    const ctx = document.getElementById('insoniaChart').getContext('2d');

    chartInstanceInsonia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Dias do mês
            datasets: [{
                label: `${monthNames[currentMonth]} ${currentYear}`, // Nome do mês e ano
                data: [], // Dados numéricos
                borderColor: '#2CABAA', // Cor da linha
                backgroundColor: 'rgba(44, 171, 170, 0.2)', // Fundo preenchido
                fill: true,
                tension: 0.3,
                pointRadius: 5, // Tamanho dos pontos
                pointBackgroundColor: '#2CABAA', // Bolinhas azuis
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        title: (tooltipItems) => {
                            const index = tooltipItems[0].dataIndex;
                            const day = chartInstanceInsonia.data.labels[index];
                            return `Dia ${day}`;
                        },
                        label: (tooltipItem) => {
                            const index = tooltipItem.dataIndex;
                            const dataPoint = insoniaData[index];
                            return [
                                `Número de vezes que acordou: ${tooltipItem.raw}`,
                                `Dormiu: ${dataPoint.horaDormir}`,
                                `Acordou: ${dataPoint.horaAcordar}`,
                            ];
                        },
                    },
                },
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Número de vezes que acordou',
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        callback: (value) => {
                            if (value === 2) return 'Excelente';
                            if (value === 4) return 'Boa';
                            if (value === 5) return 'Ruim';
                            return value;
                        },
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: 'Dias do Mês',
                    },
                },
            },
        },
    });
}


function updateChartInsonia() {
    const filteredData = insoniaData.filter(item =>
        item.date.getMonth() === currentMonth && item.date.getFullYear() === currentYear
    );

    const sortedData = filteredData.sort((a, b) => a.date.getDate() - b.date.getDate());

    if (sortedData.length === 0) {
        mostrarMensagemSemDadosInsonia();
        return;
    }

    const labels = sortedData.map(item => item.date.getDate());
    const data = sortedData.map(item => item.quantQueAcordou);

    chartInstanceInsonia.data.labels = labels;
    chartInstanceInsonia.data.datasets[0].data = data;
    chartInstanceInsonia.update();

    document.getElementById('mensagem-sem-dados').style.display = 'none';
}

function mostrarMensagemSemDadosInsonia() {
    if (chartInstanceInsonia) {
        chartInstanceInsonia.data.labels = ['Sem dados'];
        chartInstanceInsonia.data.datasets[0].data = [null];
        chartInstanceInsonia.update();
    }
    const mensagemSemDados = document.getElementById('mensagem-sem-dados');
    if (mensagemSemDados) {
        mensagemSemDados.style.display = 'block';
    }
}

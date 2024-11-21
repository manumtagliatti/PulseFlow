document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');
    const email = 'julio@gmail.com'; // Email do paciente

    if (!authToken) {
        alert("Você precisa fazer login primeiro.");
        window.location.href = "loginMedico.html";
        return;
    }

    carregarNomeMedico(authToken);
    carregarDadosGraficoEnxaqueca(email, authToken);

    document.getElementById('prev-month').addEventListener('click', () => {
        alterarMes(-1);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        alterarMes(1);
    });

    initializeChartEnxaqueca();
});

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
        document.getElementById('nome-medico').textContent = ` Dr. ${data.medico.nomeCompleto}`;
    })
    .catch(error => {
        console.error("Erro ao buscar o nome do médico:", error);
        document.getElementById('nome-medico').textContent = 'Dr.';
    });
}

function carregarDadosGraficoEnxaqueca(email, authToken) {
    fetch(`http://localhost:3000/api/enxaqueca/${email}`, {
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
                            if (value === 1) return 'Baixa';
                            if (value === 5) return 'Média';
                            if (value === 8) return 'Alta';
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

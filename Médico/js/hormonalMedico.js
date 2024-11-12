document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/cliente')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar o nome do médico');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('nome-medico').textContent = data.nome;
        })
        .catch(error => {
            console.error('Erro:', error);
            document.getElementById('nome-medico').textContent = 'Medico';
        });

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

    const perfilLink = document.querySelector('.meu-perfil');
    perfilLink.addEventListener('click', () => {
        window.location.href = "profileMedico.html";
    });

    const sairLink = document.querySelector('.sair');
    sairLink.addEventListener('click', () => {
        window.location.href = "../HomePage/homepage.html";
    });
});

// Variável para armazenar os dados do gráfico (vazia inicialmente)
let dadosHormonaisPorMes = {};
let currentMonth = 'Outubro 2024'; // Mês inicial para exibir estrutura
let chartInstance; // Instância do gráfico

// Função para buscar dados do backend
function carregarDadosGrafico(email) {
    fetch(`/api/hormonal/dados-grafico/${email}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar dados do gráfico');
            }
            return response.json();
        })
        .then(data => {
            dadosHormonaisPorMes = data; // Atualiza os dados com os dados do backend
            currentMonth = Object.keys(dadosHormonaisPorMes)[0] || 'Sem dados';
            document.getElementById('current-month').textContent = currentMonth;
            updateChart(currentMonth);
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}

function updateChart(month) {
    const ctx = document.getElementById('grafico-hormonal').getContext('2d');
    const dadosMes = dadosHormonaisPorMes[month] || { labels: [], data: [] }; // Dados vazios para estrutura

    if (chartInstance) {
        chartInstance.destroy(); // Destrói o gráfico anterior antes de criar um novo
    }

    const chartData = {
        labels: dadosMes.labels.length > 0 ? dadosMes.labels : ['Sem dados'],
        datasets: [{
            label: 'Níveis Hormonais',
            data: dadosMes.data.length > 0 ? dadosMes.data : [null], // Exibe estrutura sem valores
            borderColor: 'rgba(200, 200, 200, 1)', // Ajuste as cores conforme necessário
            backgroundColor: 'rgba(200, 200, 200, 0.2)',
            fill: true,
            pointRadius: 0, // Sem pontos, apenas estrutura
            tension: 0.3 // Suaviza as linhas
        }]
    };

    const configGrafico = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false, // Ajusta o gráfico dinamicamente
            plugins: {
                legend: {
                    display: false // Não exibir a legenda
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Níveis Hormonais'
                    },
                    ticks: {
                        display: false // Oculta valores no eixo Y
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: `Dias de ${month}`
                    },
                    ticks: {
                        display: false // Oculta valores no eixo X
                    }
                }
            }
        }
    };

    // Cria o novo gráfico apenas com a estrutura
    chartInstance = new Chart(ctx, configGrafico);
}

// Navegação entre meses
document.getElementById('prev-month').addEventListener('click', () => {
    const months = Object.keys(dadosHormonaisPorMes);
    const currentIndex = months.indexOf(currentMonth);
    if (currentIndex > 0) {
        currentMonth = months[currentIndex - 1];
        document.getElementById('current-month').textContent = currentMonth;
        updateChart(currentMonth);
    }
});

document.getElementById('next-month').addEventListener('click', () => {
    const months = Object.keys(dadosHormonaisPorMes);
    const currentIndex = months.indexOf(currentMonth);
    if (currentIndex < months.length - 1) {
        currentMonth = months[currentIndex + 1];
        document.getElementById('current-month').textContent = currentMonth;
        updateChart(currentMonth);
    }
});

// Inicializa o gráfico com a estrutura vazia
window.onload = function() {
    carregarDadosGrafico('email-do-paciente'); // Substitua pelo email correto
    updateChart(currentMonth); // Exibe apenas a estrutura do gráfico
};

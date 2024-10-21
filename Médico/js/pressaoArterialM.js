// Simulando o nome do médico logado
const medicoLogado = "Dimas Augusto";  // Aqui você pode pegar o nome real de uma fonte como API ou localStorage

// Função que só executa quando o DOM está totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
    const nomeMedicoElement = document.getElementById('nome-medico');
    if (nomeMedicoElement) {
        nomeMedicoElement.textContent = medicoLogado;
    }

    const menuIcon = document.getElementById('icon-toggle');
    const dropdownMenu = document.getElementById('menu-dropdown');
    
    if (menuIcon && dropdownMenu) {
        menuIcon.addEventListener('click', () => {
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
    
        // Fecha o menu se clicar fora dele
        document.addEventListener('click', (event) => {
            if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });
    }

    // Inicializa o gráfico com o mês atual
    updateChart(currentMonth);
});

// Simulando dados de medições da pressão arterial por mês
const dadosPressaoPorMes = {
    'Junho 2024': {
        labels: ['1 Jun', '5 Jun', '10 Jun', '15 Jun', '20 Jun', '25 Jun', '30 Jun'],
        data: [120, 115, 118, 121, 119, 122, 120]
    },
    'Outubro 2024': {
        labels: ['1 Out', '5 Out', '10 Out', '15 Out', '20 Out', '25 Out', '30 Out'],
        data: [125, 122, 124, 121, 126, 123, 125]
    },
    'Novembro 2024': {
        labels: ['1 Nov', '5 Nov', '10 Nov', '15 Nov', '20 Nov', '25 Nov', '30 Nov'],
        data: []
    }
};

let currentMonth = 'Outubro 2024'; // Começa no mês atual
let chartInstance; // Variável para armazenar a instância do gráfico

function updateChart(month) {
    const ctx = document.getElementById('grafico-pressao').getContext('2d');
    const dadosMes = dadosPressaoPorMes[month] || { labels: [], data: [] }; // Se não houver dados, exibe vazio

    if (chartInstance) {
        chartInstance.destroy(); // Destrói o gráfico anterior antes de criar um novo
    }

    const chartData = {
        labels: dadosMes.labels.length > 0 ? dadosMes.labels : ['Sem dados'],
        datasets: [{
            label: 'Pressão Arterial (mmHg)',
            data: dadosMes.data.length > 0 ? dadosMes.data : [0], // Exibe 0 caso não tenha dados
            borderColor: dadosMes.data.length > 0 ? 'rgba(44, 171, 170, 1)' : 'rgba(200, 200, 200, 1)',
            backgroundColor: dadosMes.data.length > 0 ? 'rgba(44, 171, 170, 0.2)' : 'rgba(200, 200, 200, 0.2)',
            fill: true,
            pointRadius: dadosMes.data.length > 0 ? 5 : 0, // Remove pontos se não houver dados
            pointHoverRadius: 7,
            tension: 0.3,  // Suaviza as linhas
        }]
    };

    const configGrafico = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,  // Ajusta o gráfico dinamicamente
            plugins: {
                legend: {
                    display: false // Não exibir a legenda
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Pressão Arterial (mmHg)'
                    },
                    ticks: {
                        display: dadosMes.data.length > 0 // Exibe eixo Y apenas se houver dados
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: `Dias de ${month}`
                    },
                    ticks: {
                        display: dadosMes.data.length > 0 // Exibe eixo X apenas se houver dados
                    }
                }
            }
        }
    };

    chartInstance = new Chart(ctx, configGrafico);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nome-medico').textContent = "Dimas Augusto";

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

    updateChart();
});

const meses = ['Junho 2024', 'Julho 2024', 'Agosto 2024', 'Setembro 2024', 'Outubro 2024'];
let mesAtualIndex = 0; // Iniciar no índice 0 que representa 'Junho 2024'

const dadosHormonalPorMes = {
    'Junho 2024': {
        labels: ['1', '5', '10', '15', '20', '25', '30'],
        data: [3, 5, 6, 8, 6, 4, 7]
    },
    'Julho 2024': {
        labels: ['1', '5', '10', '15', '20', '25', '30'],
        data: [4, 6, 7, 5, 6, 7, 6]
    },
    'Agosto 2024': {
        labels: ['1', '5', '10', '15', '20', '25', '30'],
        data: [5, 4, 6, 7, 5, 4, 6]
    },
    'Setembro 2024': {
        labels: ['1', '5', '10', '15', '20', '25', '30'],
        data: [6, 5, 4, 6, 5, 7, 6]
    },
    'Outubro 2024': {
        labels: ['1', '5', '10', '15', '20', '25', '30'],
        data: [7, 6, 5, 7, 6, 8, 7]
    }
};

let chartInstance;

function updateChart() {
    const month = meses[mesAtualIndex];
    document.getElementById('current-month').textContent = month;

    const ctx = document.getElementById('grafico-glicemia').getContext('2d');
    const dadosMes = dadosHormonalPorMes[month];

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dadosMes.labels,
            datasets: [{
                label: 'Nível de Hormônios',
                data: dadosMes.data,
                borderColor: 'rgba(44, 171, 170, 1)',
                backgroundColor: 'rgba(44, 171, 170, 0.2)',
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false }},
            scales: {
                y: { title: { display: true, text: 'Média de Hormônios' }},
                x: { title: { display: true, text: 'Dias de ' + month }}
            }
        }
    });
}

document.getElementById('prev-month').addEventListener('click', () => {
    if (mesAtualIndex > 0) {
        mesAtualIndex--;
        updateChart();
    }
});

document.getElementById('next-month').addEventListener('click', () => {
    if (mesAtualIndex < meses.length - 1) {
        mesAtualIndex++;
        updateChart();
    }
});

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

    updateChart('Outubro 2024');
});

const dadosGlicemiaPorMes = {
    'Outubro 2024': {
        labels: ['1 Out', '5 Out', '10 Out', '15 Out', '20 Out', '25 Out', '30 Out'],
        data: [85, 92, 88, 96, 90, 94, 89]
    }
};

let chartInstance;

function updateChart(month) {
    const ctx = document.getElementById('grafico-glicemia').getContext('2d');
    const dadosMes = dadosGlicemiaPorMes[month];

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dadosMes.labels,
            datasets: [{
                label: 'Nível de Glicemia (mg/dL)',
                data: dadosMes.data,
                borderColor: 'rgba(44, 171, 170, 1)',
                backgroundColor: 'rgba(44, 171, 170, 0.2)',
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false }},
            scales: {
                y: { title: { display: true, text: 'Nível de Glicemia (mg/dL)' }},
                x: { title: { display: true, text: `Dias de ${month}` }}
            }
        }
    });
}

document.getElementById('prev-month').addEventListener('click', () => {
    updateChart('Outubro 2024');
});

document.getElementById('next-month').addEventListener('click', () => {
    updateChart('Outubro 2024');
});

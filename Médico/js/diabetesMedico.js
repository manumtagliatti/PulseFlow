document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/cliente')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao buscar o nome do médico');
            return response.json();
        })
        .then(data => document.getElementById('nome-medico').textContent = data.nome)
        .catch(() => document.getElementById('nome-medico').textContent = 'Medico');

    const menuIcon = document.getElementById('icon-toggle');
    const dropdownMenu = document.getElementById('menu-dropdown');
    menuIcon.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', event => {
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

    document.getElementById('current-month').textContent = "Outubro 2024";
    updateChart("Outubro 2024");
});

let chartInstance;
let currentMonthIndex = 9; // Outubro é o índice 9
let currentYear = 2024;

const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Função para atualizar o gráfico e exibir o mês e ano atualizados
function updateChart(monthYear) {
    const ctx = document.getElementById('grafico-diabetes').getContext('2d');

    // Destrói o gráfico anterior antes de criar um novo
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 7 }, (_, i) => `Dia ${i + 1}`),
            datasets: [{
                label: 'Nível de Glicemia (mg/dL)',
                data: [], // Insira os dados relevantes para o mês atual aqui
                borderColor: 'rgba(200, 200, 200, 1)',
                backgroundColor: 'rgba(200, 200, 200, 0.2)',
                fill: true,
                pointRadius: 0,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    min: 60,
                    max: 180,
                    ticks: { stepSize: 20 },
                    title: { display: true, text: 'Glicemia (mg/dL)' }
                },
                x: {
                    title: { display: true, text: `Dias de ${monthYear}` }
                }
            }
        }
    });
}

// Navegação entre meses e ajuste do ano
function updateMonthDisplay() {
    const monthLabel = `${monthNames[currentMonthIndex]} ${currentYear}`;
    document.getElementById('current-month').textContent = monthLabel;
    updateChart(monthLabel);
}

document.getElementById('prev-month').addEventListener('click', () => {
    if (currentMonthIndex === 0) {
        currentMonthIndex = 11;
        currentYear -= 1;
    } else {
        currentMonthIndex -= 1;
    }
    updateMonthDisplay();
});

document.getElementById('next-month').addEventListener('click', () => {
    if (currentMonthIndex === 11) {
        currentMonthIndex = 0;
        currentYear += 1;
    } else {
        currentMonthIndex += 1;
    }
    updateMonthDisplay();
});

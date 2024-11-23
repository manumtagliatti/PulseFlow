document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');
    const email = 'julio@gmail.com'; // Email do paciente

    if (!authToken) {
        alert("Você precisa fazer login primeiro.");
        window.location.href = "loginMedico.html";
        return;
    }

    carregarNomeMedico(authToken);
    carregarDadosGrafico(email, authToken);

    const menuIcon = document.getElementById('icon-toggle');
    const dropdownMenu = document.getElementById('menu-dropdown');

    if (menuIcon && dropdownMenu) {
        menuIcon.addEventListener('click', () => {
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (event) => {
            if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });
    }

    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');

    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', () => {
            alterarMes(-1, email, authToken);
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', () => {
            alterarMes(1, email, authToken);
        });
    }

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
            const medicoElement = document.getElementById('nome-medico');
            if (medicoElement) {
                medicoElement.textContent = `Dr. ${data.medico.nomeCompleto}`;
            }
        })
        .catch(error => {
            console.error("Erro ao buscar o nome do médico:", error);
            const medicoElement = document.getElementById('nome-medico');
            if (medicoElement) {
                medicoElement.textContent = 'Dr.';
            }
        });
}

async function carregarDadosGrafico(email, authToken) {
    try {
        const response = await fetch(`http://localhost:3000/api/insonia/${encodeURIComponent(email)}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) throw new Error("Erro ao carregar dados");

        const data = await response.json();

        const filteredData = data.data.filter(item => {
            const itemDate = new Date(item.data);
            return (
                itemDate.getMonth() === currentMonth &&
                itemDate.getFullYear() === currentYear
            );
        });

        filteredData.sort((a, b) => new Date(a.data) - new Date(b.data));

        if (filteredData.length === 0) {
            mostrarMensagemSemDados();
        } else {
            esconderMensagemSemDados();
        }

        atualizarGrafico(filteredData);

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        atualizarGrafico([]);
        mostrarMensagemSemDados();
    }
}

function updateMonthTitle() {
    const monthTitle = document.getElementById('current-month');
    if (monthTitle) {
        monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    if (chartInstanceInsonia) {
        chartInstanceInsonia.data.datasets[0].label = `${monthNames[currentMonth]} ${currentYear}`;
        chartInstanceInsonia.update();
    }
}

function alterarMes(offset, email, authToken) {
    currentMonth += offset;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    updateMonthTitle();
    carregarDadosGrafico(email, authToken);
}

function initializeChartInsonia() {
    const ctx = document.getElementById('insoniaChart').getContext('2d');

    chartInstanceInsonia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: `${monthNames[currentMonth]} ${currentYear}`,
                data: [],
                borderColor: '#2CABAA',
                backgroundColor: 'rgba(44, 171, 170, 0.2)',
                fill: true,
                tension: 0.3,
                pointRadius: 0, // Sem pontos por padrão
                pointBackgroundColor: '#2CABAA',
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
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
                                `Número de vezes que acordou: ${tooltipItem.raw || "N/A"}`,
                                `Dormiu: ${dataPoint?.horaDormir || "N/A"}`,
                                `Acordou: ${dataPoint?.horaAcordar || "N/A"}`,
                                `Qualidade do Sono: ${dataPoint?.qualidadeSono || "N/A"}`,
                            ];
                        },
                    },
                },
            },
            scales: {
                y: {
                    title: { display: true, text: 'Número de vezes que acordou' },
                    beginAtZero: true,
                    max: 10,
                    ticks: { stepSize: 1 },
                },
                x: { title: { display: true, text: 'Dias do Mês' } },
            },
        },
    });
}

function atualizarGrafico(data) {
    const labels = data.length > 0 ? data.map(item => new Date(item.data).getDate()) : [];
    const datasetData = data.length > 0 ? data.map(item => item.quantQueAcordou) : [];

    chartInstanceInsonia.data.labels = labels;
    chartInstanceInsonia.data.datasets[0].data = datasetData;
    chartInstanceInsonia.data.datasets[0].pointRadius = data.length > 0 ? 5 : 0; // Mostra pontos somente com dados
    chartInstanceInsonia.update();
}

function mostrarMensagemSemDados() {
    const mensagem = document.getElementById("mensagem-sem-dados");
    if (mensagem) {
        mensagem.style.display = "block";
        mensagem.textContent = "Nenhum registro de insônia encontrado para este mês.";
    }
}

function esconderMensagemSemDados() {
    const mensagem = document.getElementById("mensagem-sem-dados");
    if (mensagem) mensagem.style.display = "none";
}

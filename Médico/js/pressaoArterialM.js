document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');
    const email = 'maria@example.com'; // Email do paciente

    if (!authToken) {
        alert("Você precisa fazer login primeiro.");
        window.location.href = "loginMedico.html";
        return;
    }

    carregarNomeMedico(authToken);
    carregarDadosGraficoPressao(email, authToken);

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
    initializeChartPressao();
});

let chartInstancePressao;
let pressaoData = [];
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
        document.getElementById('nome-medico').textContent = 'Dr.';
    });
}

function carregarDadosGraficoPressao(email, authToken) {
    fetch(`http://localhost:3000/api/pressaoArterial/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao buscar os dados de pressão arterial.");
        }
        return response.json();
    })
    .then(data => {
        pressaoData = data.data.map(item => ({
            date: new Date(item.data),
            pressao: item.pressao
        }));
        updateChartPressao();
    })
    .catch(error => {
        console.error("Erro ao buscar os dados de pressão arterial:", error);
        mostrarMensagemSemDados();
    });
}

function updateMonthTitle() {
    document.getElementById('current-month').textContent = `${monthNames[currentMonth]} ${currentYear}`;
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
    updateChartPressao();
}

function initializeChartPressao() {
    const ctx = document.getElementById('grafico-pressao').getContext('2d');
    chartInstancePressao = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Pressão Arterial (mmHg)',
                data: [],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
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
                        text: 'Pressão Arterial (mmHg)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function updateChartPressao() {
    const filteredData = pressaoData.filter(item => 
        item.date.getMonth() === currentMonth && item.date.getFullYear() === currentYear
    );

    if (filteredData.length === 0) {
        mostrarMensagemSemDados();
        return;
    }

    const labels = filteredData.map(item => item.date.getDate());
    const data = filteredData.map(item => item.pressao);

    chartInstancePressao.data.labels = labels;
    chartInstancePressao.data.datasets[0].data = data;
    chartInstancePressao.update();
    document.getElementById('mensagem-sem-dados').style.display = 'none';
}

function mostrarMensagemSemDados() {
    chartInstancePressao.data.labels = ['Sem dados'];
    chartInstancePressao.data.datasets[0].data = [null];
    chartInstancePressao.update();
    document.getElementById('mensagem-sem-dados').style.display = 'block';
}

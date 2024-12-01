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
    carregarDadosGraficoPressao(emailPaciente, authToken);

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
        alterarMesPressao(-1);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        alterarMesPressao(1);
    });

    updateMonthTitlePressao();
    initializeChartPressao();
});

// Função para voltar à página menuMedico.html
function goBack() {
    window.location.href = 'menuMedico.html'; // Redireciona para a página menuMedico.html
}

let chartInstancePressao;
let pressaoData = [];
let currentMonthPressao = new Date().getMonth();
let currentYearPressao = new Date().getFullYear();

const monthNamesPressao = [
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
        document.getElementById('nome-medico').textContent = 'Dr.';
    });
}

function carregarDadosGraficoPressao(emailPaciente, authToken) {
    fetch(`http://localhost:3000/api/pressaoArterial/${emailPaciente}`, {
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
        mostrarMensagemSemDadosPressao();
    });
}

function updateMonthTitlePressao() {
    document.getElementById('current-month').textContent = `${monthNamesPressao[currentMonthPressao]} ${currentYearPressao}`;
}

function alterarMesPressao(offset) {
    currentMonthPressao += offset;

    if (currentMonthPressao < 0) {
        currentMonthPressao = 11;
        currentYearPressao--;
    } else if (currentMonthPressao > 11) {
        currentMonthPressao = 0;
        currentYearPressao++;
    }

    updateMonthTitlePressao();
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
                borderColor: 'rgba(44, 171, 170, 1)', // A mesma cor do gráfico de glicemia
                backgroundColor: 'rgba(44, 171, 170, 0.2)', // A mesma cor do gráfico de glicemia
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
        item.date.getMonth() === currentMonthPressao && item.date.getFullYear() === currentYearPressao
    );

    if (filteredData.length === 0) {
        mostrarMensagemSemDadosPressao();
        return;
    }

    const labels = filteredData.map(item => item.date.getDate());
    const data = filteredData.map(item => item.pressao);

    chartInstancePressao.data.labels = labels;
    chartInstancePressao.data.datasets[0].data = data;
    chartInstancePressao.update();
    document.getElementById('mensagem-sem-dados').style.display = 'none';
}

function mostrarMensagemSemDadosPressao() {
    const ctx = document.getElementById('grafico-pressao').getContext('2d');
    chartInstancePressao.data.labels = ['Sem dados'];
    chartInstancePressao.data.datasets[0].data = [null];
    chartInstancePressao.update();
    document.getElementById('mensagem-sem-dados').style.display = 'block';
}

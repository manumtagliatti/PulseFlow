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
    carregarDadosGrafico(emailPaciente, authToken);

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
    initializeChart();
});

// Função para voltar à página menuMedico.html
function goBack() {
    window.location.href = 'menuMedico.html'; // Redireciona para a página menuMedico.html
}

let chartInstance;
let hormonalData = [];
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

function carregarDadosGrafico(emailPaciente, authToken) {
    fetch(`http://localhost:3000/api/hormonal/${emailPaciente}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao buscar os dados hormonais.");
        }
        return response.json();
    })
    .then(data => {
        hormonalData = data.data.map(item => ({
            date: new Date(item.data),
            dosagem: item.dosagem
        }));
        updateChart();
    })
    .catch(error => {
        console.error("Erro ao buscar os dados hormonais:", error);
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
    updateChart();
}

function initializeChart() {
    const ctx = document.getElementById('grafico-hormonal').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Nível Hormonal',
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
                        text: 'Dias'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Dosagem Hormonal'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function updateChart() {
    const filteredData = hormonalData.filter(item => 
        item.date.getMonth() === currentMonth && item.date.getFullYear() === currentYear
    );

    if (filteredData.length === 0) {
        mostrarMensagemSemDados();
        return;
    }

    const labels = filteredData.map(item => item.date.getDate()).sort((a, b) => a - b);
    const data = filteredData.map(item => item.dosagem);

    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
    document.getElementById('mensagem-sem-dados').style.display = 'none'; // Esconde a mensagem de "Sem dados"
}

function mostrarMensagemSemDados() {
    const ctx = document.getElementById('grafico-hormonal').getContext('2d');
    chartInstance.data.labels = ['Sem dados'];
    chartInstance.data.datasets[0].data = [null];
    chartInstance.update();
    document.getElementById('mensagem-sem-dados').style.display = 'block'; // Exibe a mensagem de "Sem dados"
}

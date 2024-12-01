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
    carregarDadosGraficoDiabetes(emailPaciente, authToken);

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
        alterarMesDiabetes(-1);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        alterarMesDiabetes(1);
    });

    updateMonthTitleDiabetes();
    initializeChartDiabetes();
});

// Função para voltar à página menuMedico.html
function goBack() {
    window.location.href = 'menuMedico.html'; // Redireciona para a página menuMedico.html
}

let chartInstanceDiabetes;
let diabetesData = [];
let currentMonthDiabetes = new Date().getMonth();
let currentYearDiabetes = new Date().getFullYear();

const monthNamesDiabetes = [
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

function carregarDadosGraficoDiabetes(emailPaciente, authToken) {
    fetch(`http://localhost:3000/api/diabetes/${emailPaciente}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao buscar os dados de glicemia.");
        }
        return response.json();
    })
    .then(data => {
        diabetesData = data.data.map(item => ({
            date: new Date(item.data), // Certifique-se de que isso corresponde ao banco
            nivel: item.nivelGlicemia,
            hora: item.hora
        }));
        updateChartDiabetes();
    })
    .catch(error => {
        mostrarMensagemSemDadosDiabetes();
    });
}

function updateMonthTitleDiabetes() {
    document.getElementById('current-month').textContent = `${monthNamesDiabetes[currentMonthDiabetes]} ${currentYearDiabetes}`;
}

function alterarMesDiabetes(offset) {
    currentMonthDiabetes += offset;

    if (currentMonthDiabetes < 0) {
        currentMonthDiabetes = 11;
        currentYearDiabetes--;
    } else if (currentMonthDiabetes > 11) {
        currentMonthDiabetes = 0;
        currentYearDiabetes++;
    }

    updateMonthTitleDiabetes();
    updateChartDiabetes();
}

function initializeChartDiabetes() {
    const ctx = document.getElementById('grafico-diabetes').getContext('2d');
    chartInstanceDiabetes = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Nível de Glicemia (mg/dL)',
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
                            const day = chartInstanceDiabetes.data.labels[index];
                            return `Dia ${day}`;
                        },
                        label: function(context) {
                            const index = context.dataIndex;
                            const dataPoint = diabetesData[index];
                            return `Glicemia: ${context.raw} mg/dL, Hora: ${dataPoint.hora}`;
                        }
                    }
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
                        text: 'Glicemia (mg/dL)'
                    },
                    min: 40,
                    max: 300,
                    ticks: {
                        stepSize: 10,
                        callback: function(value) {
                            if (value === 80) return 'Baixa';
                            if (value === 110) return 'Normal';
                            if (value === 130) return 'Alta';
                            return `${value}`;
                        }
                    }
                }
            }
        }
    });
}

function updateChartDiabetes() {
    const filteredData = diabetesData.filter(item => 
        item.date.getMonth() === currentMonthDiabetes && 
        item.date.getFullYear() === currentYearDiabetes
    );

    // Ordenar os dados pelo dia
    const sortedData = filteredData.sort((a, b) => a.date.getDate() - b.date.getDate());


    if (sortedData.length === 0) {
        mostrarMensagemSemDadosDiabetes();
        return;
    }

    const labels = sortedData.map(item => item.date.getDate()); // Dias ordenados
    const data = sortedData.map(item => item.nivel); // Níveis de glicemia correspondentes

    chartInstanceDiabetes.data.labels = labels;
    chartInstanceDiabetes.data.datasets[0].data = data;
    chartInstanceDiabetes.update();

    document.getElementById('mensagem-sem-dados').style.display = 'none'; // Oculta a mensagem de "Sem Dados"
}


function mostrarMensagemSemDadosDiabetes() {
    const ctx = document.getElementById('grafico-diabetes').getContext('2d');
    chartInstanceDiabetes.data.labels = ['Sem dados'];
    chartInstanceDiabetes.data.datasets[0].data = [null];
    chartInstanceDiabetes.update();
    document.getElementById('mensagem-sem-dados').style.display = 'block';
}

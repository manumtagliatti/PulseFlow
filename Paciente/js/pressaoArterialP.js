document.getElementById('nome-paciente').textContent = "Cliente";

async function fetchInfoPaciente() {
    try {
        const response = await fetch('http://localhost:3000/paciente/info');
        if (response.ok) {
            const paciente = await response.json();
            document.getElementById('nome-paciente').textContent = paciente.nome || "Cliente";
            window.pacienteEmail = paciente.email;
        } else {
            console.error('Erro ao buscar as informações do paciente');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchInfoPaciente();
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
});

let chartInstance;
let currentMonthIndex = 0;
const months = ['Janeiro 2024', 'Fevereiro 2024', 'Março 2024', 'Abril 2024', 'Maio 2024', 'Junho 2024', 'Julho 2024', 'Agosto 2024', 'Setembro 2024', 'Outubro 2024', 'Novembro 2024', 'Dezembro 2024'];
let currentMonth = months[currentMonthIndex];

document.getElementById('meu-botao').addEventListener('click', async () => {
    const dataMedição = document.getElementById('input-data').value;
    const pressaoArterial = document.getElementById('input-pressao').value;
    if (!dataMedição || !pressaoArterial) {
        alert('Por favor, insira a data da medição e a pressão arterial.');
        return;
    }
    const data = {
        data: dataMedição,
        pressao: pressaoArterial,
        email: window.pacienteEmail
    };
    try {
        const response = await fetch('http://localhost:3000/pressao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            alert('Pressão registrada com sucesso!');
            fetchDadosDePressao(currentMonth);
        } else {
            alert('Erro ao registrar a pressão. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro na conexão com o servidor.');
    }
});

async function fetchDadosDePressao(mes) {
    try {
        const response = await fetch(`http://localhost:3000/pressao/${window.pacienteEmail}?mes=${mes}`);
        if (response.ok) {
            const dados = await response.json();
            const labels = dados.map((item) => new Date(item.data).toLocaleDateString());
            const dataValues = dados.map((item) => item.pressao);
            updateChartData(labels, dataValues);
        } else {
            alert('Nenhum registro de pressão arterial encontrado.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

function updateChartData(labels, data) {
    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = data;
        chartInstance.update();
    } else {
        const ctx = document.getElementById('grafico-pressao').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pressão Arterial (mmHg)',
                    data: data,
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
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Pressão Arterial (mmHg)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: `Dias de ${currentMonth}`
                        }
                    }
                }
            }
        });
    }
}

document.getElementById('prev-month').addEventListener('click', () => {
    if (currentMonthIndex > 0) {
        currentMonthIndex--;
        currentMonth = months[currentMonthIndex];
        document.getElementById('current-month').textContent = currentMonth;
        fetchDadosDePressao(currentMonth);
    }
});

document.getElementById('next-month').addEventListener('click', () => {
    if (currentMonthIndex < months.length - 1) {
        currentMonthIndex++;
        currentMonth = months[currentMonthIndex];
        document.getElementById('current-month').textContent = currentMonth;
        fetchDadosDePressao(currentMonth);
    }
});

const perfilLink = document.querySelector('.meu-perfil');
perfilLink.addEventListener('click', () => {
    window.location.href = "profilePaciente.html";
});

const sairLink = document.querySelector('.sair');
sairLink.addEventListener('click', () => {
    window.location.href = "../HomePage/homepage.html";
});

window.onload = function() {
    fetchInfoPaciente();
    fetchDadosDePressao(currentMonth);

    // Inicializa o gráfico com eixos visíveis, mas sem dados
    const ctx = document.getElementById('grafico-pressao').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(12).fill(""), // Cria um array com placeholders
            datasets: [{
                label: 'Pressão Arterial (mmHg)',
                data: [], // Sem dados iniciais
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
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Pressão Arterial (mmHg)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    }
                }
            }
        }
    });
};

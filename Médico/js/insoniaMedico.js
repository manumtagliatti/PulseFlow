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

    //menu para navegar para home-page e perfil
    const menuIcon = document.getElementById('icon-toggle'); // Ícone do menu
    const dropdownMenu = document.getElementById('menu-dropdown'); // Dropdown do menu
    const perfilItem = dropdownMenu.querySelector('.meu-perfil'); // Link "Meu Perfil"
    const sairItem = dropdownMenu.querySelector('.sair'); // Link "Sair"

    if (menuIcon && dropdownMenu) {
        // Alternar a exibição do menu ao clicar no ícone
        menuIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique feche o menu imediatamente
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
        });

        // Fechar o menu ao clicar fora dele
        document.addEventListener('click', (event) => {
            if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });

        // Navegar para a página "Meu Perfil"
        perfilItem.addEventListener('click', () => {
            window.location.href = "profileMedico.html"; // Caminho ajustado para o perfil do médico
        });

        // Navegar para a HomePage ao clicar em "Sair"
        sairItem.addEventListener('click', () => {
            // Opcional: Limpar localStorage ou outros dados de sessão aqui, se necessário
            window.location.href = "../HomePage/homepage.html"; // Caminho da homepage permanece o mesmo
        });
    } else {
        console.error('Menu dropdown ou elementos do menu não encontrados no DOM.');
    }

    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');

    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', () => {
            alterarMes(-1, emailPaciente, authToken);
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', () => {
            alterarMes(1, emailPaciente, authToken);
        });
    }

    updateMonthTitle();
    initializeChartInsonia();
});

// Função para voltar à página menuMedico.html
function goBack() {
    window.location.href = 'menuMedico.html'; // Redireciona para a página menuMedico.html
}

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

async function carregarDadosGrafico(emailPaciente, authToken) {
    try {
        const response = await fetch(`http://localhost:3000/api/insonia/${encodeURIComponent(emailPaciente)}`, {
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

function alterarMes(offset, emailPaciente, authToken) {
    currentMonth += offset;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    updateMonthTitle();
    carregarDadosGrafico(emailPaciente, authToken);
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

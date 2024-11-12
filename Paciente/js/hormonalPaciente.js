document.addEventListener('DOMContentLoaded', async () => {
    await fetchInfoPaciente();

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

    initializeChart(); // Inicializa o gráfico com eixos e labels, mas sem dados

    // Event listener para o botão de salvar
    document.getElementById('salvar-medicao').addEventListener('click', validarCampos);
    
    // Restrição para o campo dosagem
    const inputDosagem = document.getElementById('input-dosagem');
    inputDosagem.addEventListener('input', () => {
        inputDosagem.value = inputDosagem.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    });
});

function validarCampos() {
    const data = document.getElementById('input-data').value;
    const hormonio = document.getElementById('input-hormonio').value;
    const dosagem = document.getElementById('input-dosagem').value;

    if (!data || !hormonio || !dosagem) {
        alert('Por favor, preencha todos os campos antes de salvar.');
        return;
    }
    // Código para salvar os dados aqui, caso os campos estejam preenchidos
}

// Funções e código adicional
const perfilLink = document.querySelector('.meu-perfil');
perfilLink.addEventListener('click', () => {
    window.location.href = "profilePaciente.html";
});
const sairLink = document.querySelector('.sair');
sairLink.addEventListener('click', () => {
    window.location.href = "../HomePage/homepage.html";
});

async function fetchInfoPaciente() {
    try {
        const response = await fetch(`${baseURL}/api/paciente/info`);
        if (response.ok) {
            const paciente = await response.json();
            document.getElementById('nome-paciente').textContent = paciente.nome || "Cliente";
            window.pacienteEmail = paciente.email;
            await fetchDadosDiabetes(window.pacienteEmail); 
        } else {
            console.error('Erro ao buscar as informações do paciente');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

async function fetchDadosDiabetes(email) {
    try {
        const response = await fetch(`${baseURL}/api/hormonal/${email}`);
        if (!response.ok) throw new Error('Erro ao buscar dados');
        const registros = await response.json();

        const labels = registros.map(registro => registro.data);
        const data = registros.map(registro => registro.nivelGlicemia);

        dadosGlicemiaPorMes['Outubro 2024'] = { labels, data };
        updateChart('Outubro 2024');
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

function initializeChart() {
    const ctx = document.getElementById('grafico-glicemia').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(10).fill(''), // Cria um array com labels vazios
            datasets: [{
                label: 'Nível de Hormônios',
                data: [],
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
                x: { title: { display: true, text: 'Dias do Mês' }}
            }
        }
    });
}

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

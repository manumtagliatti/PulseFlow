const baseURL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
    initChart();
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

    document.getElementById('inputHora').addEventListener('input', formatarHora);
    document.getElementById('inputGlicemia').addEventListener('input', impedirCaracteresNaoNumericos);

    document.getElementById('enviar-dados').addEventListener('click', enviarDadosDiabetes);
});

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
        const response = await fetch(`${baseURL}/paciente/info`);
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
        const response = await fetch(`${baseURL}/api/diabetes/${email}`);
        if (!response.ok) throw new Error('Erro ao buscar dados');
        const registros = await response.json();
        const labels = registros.map(registro => registro.data);
        const data = registros.map(registro => registro.nivelGlicemia);
        updateChart(labels, data);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

function initChart() {
    const ctx = document.getElementById('grafico-glicemia').getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateChart(labels, data) {
    window.myChart.data.labels = labels;
    window.myChart.data.datasets[0].data = data;
    window.myChart.update();
}

async function enviarDadosDiabetes() {
    const data = document.getElementById('inputData').value;
    const hora = document.getElementById('inputHora').value;
    const nivelGlicemia = document.getElementById('inputGlicemia').value;

    if (!data || !hora || !nivelGlicemia) {
        alert("Por favor, preencha todos os campos antes de enviar.");
        return;
    }

    if (!validarHora(hora)) {
        alert("Por favor, insira um horário válido no formato HH:MM.");
        return;
    }

    if (!validarGlicemia(nivelGlicemia)) {
        alert("Por favor, insira um valor de glicemia válido (entre 30 e 500 mg/dL).");
        return;
    }

    try {
        const response = await fetch(`${baseURL}/api/diabetes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, hora, nivelGlicemia, email: window.pacienteEmail })
        });

        if (!response.ok) throw new Error('Erro ao enviar dados');
        const novoRegistro = await response.json();
        console.log('Dados enviados com sucesso:', novoRegistro);
        await fetchDadosDiabetes(window.pacienteEmail);
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
    }
}

// Função para impedir que caracteres não numéricos sejam inseridos no campo de glicemia
function impedirCaracteresNaoNumericos(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
}

function formatarHora(e) {
    let hora = e.target.value.replace(/\D/g, '');
    if (hora.length >= 3) {
        hora = hora.slice(0, 2) + ':' + hora.slice(2, 4);
    }
    e.target.value = hora.slice(0, 5);
}

function validarHora(hora) {
    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regexHora.test(hora);
}

function validarGlicemia(glicemia) {
    const valorGlicemia = parseInt(glicemia, 10);
    return valorGlicemia >= 30 && valorGlicemia <= 500;
}


const baseURL = 'http://localhost:3000'; // Endereço do backend

document.addEventListener('DOMContentLoaded', async () => {
    initChart(); // Inicializa o gráfico sem dados na carga da página
    await fetchInfoPaciente(); // Carrega o nome e email do paciente do backend

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
            labels: [], // Rótulos dos pontos no eixo X
            datasets: [{ // Dados para a linha do gráfico
                data: [], // Os dados numéricos que você plotará
                backgroundColor: 'rgba(255, 99, 132, 0.2)', // Cor de fundo dos pontos
                borderColor: 'rgba(255, 99, 132, 1)', // Cor da linha
                borderWidth: 1 // Espessura da linha
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Inicia o eixo Y do zero
                }
            },
            legend: {
                display: false // Configuração crucial para garantir que não haja legenda
            },
            plugins: {
                legend: false // Outra configuração para garantir que não haja legenda no Chart.js recente
            }
        }
    });
}



function updateChart(labels, data) {
    window.myChart.data.labels = labels;
    window.myChart.data.datasets.forEach((dataset) => {
        dataset.data = data;
    });
    window.myChart.update();
}

// Correção: defina como async para usar await dentro dela
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

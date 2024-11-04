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

document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.querySelector(".save-button");

    // Dados de exemplo para o gráfico
    const data = {
        labels: Array.from({ length: 30 }, (_, i) => i + 1), // Dias do mês (1 a 30)
        datasets: [{
            label: 'Intensidade Diária de Dor de Enxaqueca em Junho',
            data: [3, 2, 4, 1, 3, 4, 2, 3, 1, 4, 3, 2, 4, 1, 3, 4, 2, 1, 4, 3, 1, 2, 3, 4, 1, 3, 4, 2, 1, 3], // Exemplo de dados de intensidade
            borderColor: '#2CABAA',
            backgroundColor: 'rgba(44, 171, 170, 0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#2CABAA'
        }]
    };

    // Configurações do gráfico
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#333'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        callback: (value) => {
                            const labels = ["Baixa", "Média", "Alta"];
                            return labels[value - 1] || "";
                        }
                    },
                    title: {
                        display: true,
                        text: "Intensidade da Dor",
                        color: '#333'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Dias de Junho",
                        color: '#333'
                    }
                }
            }
        }
    };

    // Inicialização do gráfico
    const ctx = document.getElementById("enxaquecaChart").getContext("2d");
    const enxaquecaChart = new Chart(ctx, config);

    // Animação e feedback ao clicar no botão Salvar Registro
    saveButton.addEventListener("click", () => {
        saveButton.classList.add("clicked");

        setTimeout(() => {
            saveButton.classList.remove("clicked");
            alert("Registro salvo com sucesso!");
        }, 300);
    });
});
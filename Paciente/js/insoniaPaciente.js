// Simulando o nome do médico logado
const paciente = "Dimas Augusto";  // Aqui você pode pegar o nome real de uma fonte como API ou localStorage

// Definindo o nome no campo correto
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nome-paciente').textContent = pacienteLogado;
    
    // Toggle para exibir/ocultar o menu
    const menuIcon = document.getElementById('icon-toggle');
    const dropdownMenu = document.getElementById('menu-dropdown');
    
    menuIcon.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
    
    // Fecha o menu se clicar fora dele
    document.addEventListener('click', (event) => {
        if (!menuIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.querySelector(".save-button");
    const arrowLeft = document.querySelector(".arrow-left");
    const arrowRight = document.querySelector(".arrow-right");

    // Índice do mês atual (inicia no primeiro mês)
    let currentMonth = 0;

    // Dados de exemplo para os meses
    const monthlyData = [
        { label: "Janeiro", data: [1, 2, 1, 3, 2, 4, 3, 2, 1, 3, 4, 2, 1, 4, 3, 2, 1, 3, 4, 1, 2, 3, 1, 3, 2, 4, 1, 3, 2, 4] },
        { label: "Fevereiro", data: [2, 3, 2, 4, 1, 2, 4, 2, 3, 1, 3, 4, 2, 1, 3, 4, 2, 3, 1, 3, 2, 1, 4, 3, 1, 2, 4, 3] },
        // Adicione mais meses conforme necessário
    ];

    // Função para criar o gráfico com os dados do mês atual
    const createChart = (data) => {
        const ctx = document.getElementById("asmaChart").getContext("2d");
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: data.data.length }, (_, i) => i + 1),
                datasets: [{
                    label: data.label,
                    data: data.data,
                    borderColor: '#2CABAA',
                    backgroundColor: 'rgba(44, 171, 170, 0.2)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#2CABAA'
                }]
            },
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
                                const labels = ["Péssimo", "Regular", "Bom", "Excelente"];
                                return labels[value - 1] || "";
                            }
                        },
                        title: {
                            display: true,
                            text: "Qualidade do Sono",
                            color: '#333'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Dias do Mês",
                            color: '#333'
                        }
                    }
                }
            }
        });
    };

    // Inicializa o gráfico com os dados do primeiro mês
    let asmaChart = createChart(monthlyData[currentMonth]);

    // Função para atualizar o gráfico com os dados do mês selecionado
    const updateChart = () => {
        asmaChart.destroy(); // Destroi o gráfico atual para evitar sobreposição
        asmaChart = createChart(monthlyData[currentMonth]); // Cria um novo gráfico com os dados do mês atualizado
    };

    // Event Listener para a seta esquerda (mês anterior)
    arrowLeft.addEventListener("click", () => {
        currentMonth = (currentMonth - 1 + monthlyData.length) % monthlyData.length; // Atualiza para o mês anterior
        updateChart();
    });

    // Event Listener para a seta direita (próximo mês)
    arrowRight.addEventListener("click", () => {
        currentMonth = (currentMonth + 1) % monthlyData.length; // Atualiza para o próximo mês
        updateChart();
    });

    // Animação e feedback ao clicar no botão Salvar Registro
    saveButton.addEventListener("click", () => {
        saveButton.classList.add("clicked");

        setTimeout(() => {
            saveButton.classList.remove("clicked");
            alert("Registro salvo com sucesso!");
        }, 300);
    });
});
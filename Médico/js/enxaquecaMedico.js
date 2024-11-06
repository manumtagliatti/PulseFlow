const medicoLogado = "Dimas Augusto";

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nome-medico').textContent = medicoLogado;
    
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
  
    const perfilLink = document.querySelector('.meu-perfil');
    perfilLink.addEventListener('click', () => {
        window.location.href = "profileMedico.html";
    });

    const sairLink = document.querySelector('.sair');
    sairLink.addEventListener('click', () => {
        window.location.href = "../HomePage/homepage.html";
    });
    
    fetchData();
});

function showMessage(message, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = "block";

    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 3000);
}

async function fetchData() {
    try {
        const response = await fetch('https://seuservidor.com/api/dados');
        if (!response.ok) throw new Error('Erro ao buscar dados do servidor');
        
        const data = await response.json();
        atualizarDados(data);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        showMessage("Não foi possível carregar os dados.", "error");
    }
}

function atualizarDados(data) {
    if (asmaChart) asmaChart.destroy();
    asmaChart = createChart(data);
}

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
                        text: "Dias do Mês",
                        color: '#333'
                    }
                }
            }
        }
    });
};

let asmaChart = createChart({ label: "Janeiro", data: [1, 2, 1, 3, 2, 4, 3, 2, 1, 3, 4, 2, 1, 4, 3, 2, 1, 3, 4, 1, 2, 3, 1, 3, 2, 4, 1, 3, 2, 4] });
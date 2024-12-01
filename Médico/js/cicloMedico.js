let currentMonth = new Date().getMonth(); // Outubro = 9
let currentYear = new Date().getFullYear(); // Ano atual

document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem("authToken");
    const emailPaciente = localStorage.getItem("email-paciente");
    carregarNomeMedico(authToken);
    if (!emailPaciente) {
        alert("E-mail não encontrado. Por favor, insira o e-mail do seu paciente.");
        window.location.href = "principalMedico.html"; // Redireciona para selecionar o email do paciente
    }
    if (!authToken) {
        alert("Você precisa fazer login primeiro.");
        window.location.href = "loginMedico.html";
        return;
    }
    fetchCicloMenstrualData(emailPaciente, authToken);

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
            window.location.href = "profileMedico.html"; // Caminho atualizado para o perfil do médico
        });

        // Navegar para a HomePage ao clicar em "Sair"
        sairItem.addEventListener('click', () => {
            // Opcional: Limpar localStorage ou outros dados de sessão aqui, se necessário
            window.location.href = "../HomePage/homepage.html"; // Caminho da homepage permanece o mesmo
        });
    } else {
        console.error('Menu dropdown ou elementos do menu não encontrados no DOM.');
    }
});

let ciclosMenstruais = []; // Armazena todos os ciclos recebidos do backend
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
        document.getElementById('nome-medico').textContent = `${data.medico.nomeCompleto}`;
    })
    .catch(error => {
        console.error("Erro ao buscar o nome do médico:", error);
        document.getElementById('nome-medico').textContent = '';
    });
}

function fetchCicloMenstrualData(email, authToken) {
    fetch(`http://localhost:3000/api/ciclo-menstrual/${email}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    alert("Sessão expirada. Por favor, faça login novamente.");
                    localStorage.removeItem("authToken");
                    window.location.href = "loginMedico.html";
                } else if (response.status === 404) {
                    alert("Nenhum ciclo menstrual encontrado para este paciente.");
                }
                throw new Error("Erro ao buscar os dados do ciclo menstrual.");
            }
            return response.json();
        })
        .then(data => {
            ciclosMenstruais = data.data.map(ciclo => ({
                dataInicial: new Date(ciclo.dataInicial),
                dataFinal: new Date(ciclo.dataFinal)
            }));

            updateCalendarTitle();
            generateCalendar();
        })
        .catch(error => {
            console.error("Erro ao buscar os dados do ciclo menstrual:", error);
        });
}

// Função para voltar à página menuMedico.html
function goBack() {
    window.location.href = 'menuMedico.html'; // Redireciona para a página menuMedico.html
}

function generateCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const calendarBody = document.getElementById('calendar-body');
    calendarBody.innerHTML = ''; // Limpa o calendário

    let date = 1;

    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');

        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');

            if (i === 0 && j < firstDay) {
                const cellText = document.createTextNode("");
                cell.appendChild(cellText);
            } else if (date > daysInMonth) {
                break;
            } else {
                const cellText = document.createTextNode(date);
                cell.appendChild(cellText);

                // Verifica se o dia está no intervalo de menstruação
                const currentDate = new Date(currentYear, currentMonth, date);
                if (isMenstruationDay(currentDate)) {
                    const dot = document.createElement('div');
                    dot.classList.add('day-menstruacao');
                    cell.appendChild(dot);
                }

                // Destaca o dia atual
                const today = new Date();
                if (
                    date === today.getDate() &&
                    currentMonth === today.getMonth() &&
                    currentYear === today.getFullYear()
                ) {
                    cell.classList.add('today');
                }

                date++;
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }
}

function isMenstruationDay(date) {
    return ciclosMenstruais.some(ciclo => date >= ciclo.dataInicial && date <= ciclo.dataFinal);
}

function updateCalendarTitle() {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    document.getElementById('current-month').textContent = `${monthNames[currentMonth]} ${currentYear}`;
}

// Navegação entre meses
document.getElementById('prev-month').addEventListener('click', () => {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    updateCalendarTitle();
    generateCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    updateCalendarTitle();
    generateCalendar();
});

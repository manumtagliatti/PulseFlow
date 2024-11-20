let currentMonth = new Date().getMonth(); // Outubro = 9
let currentYear = new Date().getFullYear(); // Ano atual

document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
        alert("Você precisa fazer login primeiro.");
        window.location.href = "loginMedico.html";
        return;
    }

    const emailPaciente = "maria@exemplo.com";
    fetchCicloMenstrualData(emailPaciente, authToken);
});

let ciclosMenstruais = []; // Armazena todos os ciclos recebidos do backend

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

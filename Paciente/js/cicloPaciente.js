const baseURL = 'http://localhost:3000';
const menstruationDays = new Set();
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const email = 'email@example.com'; // Substitua pelo email do paciente

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('nome-paciente').textContent = "Cliente";
    await initializeCalendar();

    document.getElementById('prev-month').addEventListener('click', navigateMonth.bind(null, -1));
    document.getElementById('next-month').addEventListener('click', navigateMonth.bind(null, 1));

    setupDropdownMenu();
    setupSaveButton();

    // Carregar os dias de menstruação do backend
    await fetchMenstruationDays(email);
});

function setupDropdownMenu() {
    const iconToggle = document.getElementById('icon-toggle');
    const menuDropdown = document.getElementById('menu-dropdown');

    iconToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        menuDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (event) => {
        if (!menuDropdown.contains(event.target) && !iconToggle.contains(event.target)) {
            menuDropdown.classList.remove('show');
        }
    });
}

function setupSaveButton() {
    const saveButton = document.querySelector('.save-button');

    saveButton.addEventListener('click', async () => {
        const dataInicio = document.getElementById('data-inicio').value;
        const dataFinal = document.getElementById('data-final').value;

        if (!dataInicio || !dataFinal) {
            alert("Por favor, preencha todas as datas antes de salvar o ciclo.");
        } else {
            try {
                const response = await fetch(`${baseURL}/ciclo-menstrual`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        dataInicial: dataInicio,
                        dataFinal: dataFinal,
                        email: email, // Enviar o email do paciente
                    }),
                });

                if (response.ok) {
                    alert("Ciclo salvo com sucesso!");
                    await fetchMenstruationDays(email); // Atualizar calendário com novos dados
                } else {
                    alert("Erro ao salvar o ciclo.");
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
            }
        }
    });
}

async function fetchMenstruationDays(email) {
    try {
        const response = await fetch(`${baseURL}/ciclo-menstrual/${email}`);
        if (response.ok) {
            const ciclos = await response.json();
            menstruationDays.clear(); // Limpar dias anteriores
            ciclos.forEach(ciclo => {
                const startDate = new Date(ciclo.dataInicial);
                const endDate = new Date(ciclo.dataFinal);
                while (startDate <= endDate) {
                    menstruationDays.add(startDate.getDate());
                    startDate.setDate(startDate.getDate() + 1);
                }
            });
            generateCalendar();
        } else {
            console.log("Nenhum ciclo encontrado para o email especificado.");
        }
    } catch (error) {
        console.error("Erro ao buscar ciclos menstruais:", error);
    }
}

async function initializeCalendar() {
    updateCalendarTitle();
    generateCalendar();
}

function updateCalendarTitle() {
    document.getElementById('current-month').textContent = `${monthNames[currentMonth]} ${currentYear}`;
}

function generateCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const calendarBody = document.getElementById('calendar-body');
    calendarBody.innerHTML = '';

    let date = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');

            if (i === 0 && j < firstDay) {
                cell.appendChild(document.createTextNode(""));
            } else if (date > daysInMonth) {
                break;
            } else {
                cell.appendChild(document.createTextNode(date));
                if (menstruationDays.has(date)) {
                    const dot = document.createElement('div');
                    dot.classList.add('day-menstruacao');
                    cell.appendChild(dot);
                }

                const today = new Date();
                if (date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                    cell.classList.add('today');
                }

                date++;
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }
}

function navigateMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateCalendarTitle();
    generateCalendar();
}

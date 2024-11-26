document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.querySelector(".save-button");
    const prevMonthButton = document.getElementById("prev-month");
    const nextMonthButton = document.getElementById("next-month");
    const mensagemSemDados = document.getElementById("mensagem-sem-dados");
    const calendarBody = document.getElementById("calendar-body");
    const currentMonthElement = document.getElementById("current-month");
    const authToken = localStorage.getItem("authToken");
    const baseURL = 'http://localhost:3000';
    let menstruationDays = new Set();
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    const nomePaciente = localStorage.getItem("nome-paciente"); // Recupera o nome do paciente
    const nomePacienteSpan = document.getElementById("nome-paciente");

    if (nomePaciente) {
        nomePacienteSpan.textContent = nomePaciente; // Preenche o campo com o nome
    } else {
        nomePacienteSpan.textContent = "Paciente não identificado"; // Mensagem padrão caso não encontre o nome
    }
    
    const email = localStorage.getItem("email");
    if (!email) {
        alert("E-mail não encontrado. Por favor, faça login novamente.");
        window.location.href = "loginPaciente.html"; // Redireciona para o login
    }
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    function updateMonthTitle() {
        currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

     //botao superior para redirecionar para a homePage e perfil
    // Configurar o botão do dropdown
    // Configuração do menu dropdown
    const menuIcon = document.getElementById('icon-toggle');
    const dropdownMenu = document.getElementById('menu-dropdown');
    const perfilItem = dropdownMenu.querySelector('.meu-perfil');
    const sairItem = dropdownMenu.querySelector('.sair');

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
            window.location.href = "../Paciente/profilePaciente.html";
        });

        // Navegar para a HomePage ao clicar em "Sair"
        sairItem.addEventListener('click', () => {
            window.location.href = "../HomePage/homepage.html";
        });
    } else {
        console.error('Menu dropdown ou elementos do menu não encontrados no DOM.');
    }


    async function fetchMenstruationDays() {
        try {
            const response = await fetch(`${baseURL}/api/ciclo-menstrual/${email}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Erro ao carregar ciclos menstruais");

            const ciclos = await response.json();

            menstruationDays.clear(); // Limpar dias anteriores

            // Preenche os dias do ciclo menstrual no calendário
            ciclos.data.forEach(ciclo => {
                const startDate = new Date(ciclo.dataInicial);
                const endDate = new Date(ciclo.dataFinal);

                while (startDate <= endDate) {
                    if (
                        startDate.getMonth() === currentMonth &&
                        startDate.getFullYear() === currentYear
                    ) {
                        menstruationDays.add(startDate.getDate());
                    }
                    startDate.setDate(startDate.getDate() + 1);
                }
            });

            if (menstruationDays.size === 0) {
                mostrarMensagemSemDados();
            } else {
                esconderMensagemSemDados();
            }

            generateCalendar();
        } catch (error) {
            console.error("Erro ao carregar ciclos menstruais:", error);
            mostrarMensagemSemDados();
        }
    }

    async function salvarCiclo() {
        const dataInicio = document.getElementById("data-inicio").value.trim();
        const dataFinal = document.getElementById("data-final").value.trim();

        if (!dataInicio || !dataFinal) {
            alert("Por favor, preencha as datas de início e final.");
            return;
        }

        const dataInicialISO = ajustarDataParaUTC(dataInicio);
        const dataFinalISO = ajustarDataParaUTC(dataFinal);

        try {
            const response = await fetch(`${baseURL}/api/ciclo-menstrual`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dataInicial: dataInicialISO,
                    dataFinal: dataFinalISO,
                    email,
                }),
            });

            if (!response.ok) throw new Error("Erro ao salvar o ciclo menstrual");

            alert("Ciclo salvo com sucesso!");
            limparCampos();
            await fetchMenstruationDays();
        } catch (error) {
            console.error("Erro ao salvar ciclo menstrual:", error);
            alert("Erro ao salvar ciclo menstrual.");
        }
    }

    function ajustarDataParaUTC(data) {
        if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            throw new Error("Data inválida. O formato correto é YYYY-MM-DD.");
        }
        const [ano, mes, dia] = data.split("-");
        return new Date(`${ano}-${mes}-${dia}T12:00:00Z`).toISOString();
    }

    function limparCampos() {
        document.getElementById("data-inicio").value = "";
        document.getElementById("data-final").value = "";
    }

    function generateCalendar() {
        calendarBody.innerHTML = ""; // Limpa o calendário

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        let date = 1;

        for (let i = 0; i < 6; i++) {
            const row = document.createElement("tr");

            for (let j = 0; j < 7; j++) {
                const cell = document.createElement("td");

                if (i === 0 && j < firstDay) {
                    cell.appendChild(document.createTextNode(""));
                } else if (date > daysInMonth) {
                    break;
                } else {
                    cell.appendChild(document.createTextNode(date));
                    if (menstruationDays.has(date)) {
                        const dot = document.createElement("div");
                        dot.classList.add("day-menstruacao");
                        cell.appendChild(dot);
                    }

                    const today = new Date();
                    if (
                        date === today.getDate() &&
                        currentMonth === today.getMonth() &&
                        currentYear === today.getFullYear()
                    ) {
                        cell.classList.add("today");
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

        updateMonthTitle();
        fetchMenstruationDays();
    }

    function mostrarMensagemSemDados() {
        mensagemSemDados.style.display = "block";
        calendarBody.innerHTML = ""; // Limpa o calendário para reforçar que está vazio
    }

    function esconderMensagemSemDados() {
        mensagemSemDados.style.display = "none";
    }

    saveButton.addEventListener("click", salvarCiclo);
    prevMonthButton.addEventListener("click", () => navigateMonth(-1));
    nextMonthButton.addEventListener("click", () => navigateMonth(1));

    updateMonthTitle();
    fetchMenstruationDays();
});

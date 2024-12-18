document.addEventListener("DOMContentLoaded", () => {
    const mensagemSemDados = document.getElementById("mensagem-sem-dados");
    const authToken = localStorage.getItem("token");
    const baseURL = 'http://localhost:3000';
    let diabetesChart = null;

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    const nomePaciente = localStorage.getItem("nome-paciente"); // Recupera o nome do paciente
    const nomePacienteSpan = document.getElementById("nome-paciente");

    if (nomePaciente) {
        nomePacienteSpan.textContent = nomePaciente; // Preenche o campo com o nome
    } else {
        nomePacienteSpan.textContent = "Paciente não identificado"; // Mensagem padrão caso não encontre o nome
    }


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
        window.location.href = "profilePaciente.html";
    });


    const sairLink = document.querySelector('.sair');
    sairLink.addEventListener('click', () => {
        window.location.href = "../HomePage/homepage.html";
    });
});


document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
        const imgAlt = card.querySelector('img').alt;

        let targetPage;
        switch (imgAlt) {
            case "Pressão Alta":
                targetPage = "pressaoArterialP.html";
                break;
            case "Diabetes":
                targetPage = "diabetesPaciente.html";
                break;
            case "Hormonal":
                targetPage = "hormonalPaciente.html";
                break;
            case "Ciclo Menstrual":
                targetPage = "cicloPaciente.html";
                break;
            case "Enxaqueca":
                targetPage = "enxaquecaPaciente.html";
                break;
            case "Insônia":
                targetPage = "insoniaPaciente.html";
                break;
            case "Asma":
                targetPage = "asmaPaciente.html";
                break;
            case "Exames":
                targetPage = "examesPaciente.html";
                break;
            default:
                console.log("Página não encontrada.");
                return;
        }


        window.location.href = targetPage;
    });
});

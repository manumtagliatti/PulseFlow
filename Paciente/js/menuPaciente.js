document.addEventListener('DOMContentLoaded', () => {
    // Fazer a requisição para o backend para obter o nome do cliente
    fetch('/api/cliente')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar o nome do cliente');
            }
            return response.json();
        })
        .then(data => {
            // Definir o nome do cliente no elemento
            document.getElementById('nome-medico').textContent = data.nome;
        })
        .catch(error => {
            console.error('Erro:', error);
            document.getElementById('nome-medico').textContent = 'Cliente';
        });

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

    // Redireciona para a página do perfil ao clicar em "Meu Perfil"
    const perfilLink = document.querySelector('.meu-perfil');
    perfilLink.addEventListener('click', () => {
        window.location.href = "profilePaciente.html";
    });

    // Redireciona para a homepage ao clicar em "Sair"
    const sairLink = document.querySelector('.sair');
    sairLink.addEventListener('click', () => {
        window.location.href = "../HomePage/homepage.html";
    });
});

// Seleciona todos os cards
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

        // Redireciona para a página definida
        window.location.href = targetPage;
    });
});

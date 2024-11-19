document.addEventListener('DOMContentLoaded', () => {
    // Obter o nome do médico ao carregar a página
    fetch('http://127.0.0.1:3000/api/medico/perfil', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Token salvo no localStorage
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao buscar o nome do médico');
        }
        return response.json();
    })
    .then(data => {
        // Atribui o nome do médico ao elemento da página
        document.getElementById('nome-medico').textContent = data.medico.nomeCompleto || 'Nome não disponível';
    })
    .catch(error => {
        console.error('Erro:', error);
        document.getElementById('nome-medico').textContent = 'Médico não encontrado';
    });

    // Controle do menu dropdown
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

    // Redirecionar para as páginas de perfil e logout
    document.querySelector('.meu-perfil').addEventListener('click', () => {
        window.location.href = "profileMedico.html";
    });

    document.querySelector('.sair').addEventListener('click', () => {
        localStorage.removeItem('token'); // Remover o token ao sair
        window.location.href = "../HomePage/homepage.html";
    });

    // Redirecionar para as páginas específicas das doenças
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const imgAlt = card.querySelector('img').alt;

            let targetPage;
            switch (imgAlt) {
                case "Pressão Alta":
                    targetPage = "pressaoArterialM.html";
                    break;
                case "Diabetes":
                    targetPage = "diabetesMedico.html";
                    break;
                case "Hormonal":
                    targetPage = "hormonalMedico.html";
                    break;
                case "Ciclo Menstrual":
                    targetPage = "cicloMedico.html";
                    break;
                case "Enxaqueca":
                    targetPage = "enxaquecaMedico.html";
                    break;
                case "Insônia":
                    targetPage = "insoniaMedico.html";
                    break;
                case "Asma":
                    targetPage = "asmaMedico.html";
                    break;
                case "Exames":
                    targetPage = "examesMedico.html";
                    break;
                default:
                    console.log("Página não encontrada.");
                    return;
            }

            window.location.href = targetPage;
        });
    });
});

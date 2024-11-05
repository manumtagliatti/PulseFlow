document.addEventListener('DOMContentLoaded', () => {

    fetch('/api/cliente')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar o nome do cliente');
            }
            return response.json();
        })
        .then(data => {

            document.getElementById('nome-medico').textContent = data.nome;
        })
        .catch(error => {
            console.error('Erro:', error);
            document.getElementById('nome-medico').textContent = 'Cliente';
        });

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
});


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
s
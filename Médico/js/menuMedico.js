document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken'); // Certifique-se de que o token seja consistente
    if (!authToken) {
        alert("Você precisa fazer login primeiro.");
        window.location.href = "loginMedico.html";
        return;
    }

    carregarNomeMedico(authToken);

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
    document.querySelector('.meu-perfil')?.addEventListener('click', () => {
        window.location.href = "profileMedico.html";
    });

    document.querySelector('.sair')?.addEventListener('click', () => {
        localStorage.removeItem('authToken'); // Remover o token ao sair
        window.location.href = "../HomePage/homepage.html";
    });

    // Redirecionar para as páginas específicas das doenças
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const imgAlt = card.querySelector('img').alt;

            const pages = {
                "Pressão Alta": "pressaoArterialM.html",
                "Diabetes": "diabetesMedico.html",
                "Hormonal": "hormonalMedico.html",
                "Ciclo Menstrual": "cicloMedico.html",
                "Enxaqueca": "enxaquecaMedico.html",
                "Insônia": "insoniaMedico.html",
                "Asma": "asmaMedico.html",
                "Exames": "examesMedico.html"
            };

            const targetPage = pages[imgAlt];
            if (targetPage) {
                window.location.href = targetPage;
            } else {
                console.log("Página não encontrada.");
            }
        });
    });
});

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
        document.getElementById('nome-medico').textContent = ` ${data.medico.nomeCompleto}`;
    })
    .catch(error => {
        console.error("Erro ao buscar o nome do médico:", error);
        document.getElementById('nome-medico').textContent = 'Dr.';
    });
}

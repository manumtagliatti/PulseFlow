document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('icon-toggle'); // Ícone do menu
    const dropdownMenu = document.getElementById('menu-dropdown'); // Dropdown do menu
    const perfilItem = dropdownMenu.querySelector('.meu-perfil'); // Link "Meu Perfil"
    const sairItem = dropdownMenu.querySelector('.sair'); // Link "Sair"

    carregarNomeMedico();
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
            window.location.href = "profileMedico.html"; // Caminho ajustado para o perfil do médico
        });

        // Navegar para a HomePage ao clicar em "Sair"
        sairItem.addEventListener('click', () => {
            // Opcional: Limpar localStorage ou outros dados de sessão aqui, se necessário
            window.location.href = "../HomePage/homepage.html"; // Caminho da homepage permanece o mesmo
        });
    } else {
        console.error('Menu dropdown ou elementos do menu não encontrados no DOM.');
    }

    // Manipulando o botão de buscar paciente
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('email-paciente');
    const buscarPacienteButton = document.getElementById('buscar-paciente');

    if (searchForm && searchInput && buscarPacienteButton) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Previne o comportamento padrão do formulário
            const emailPaciente = searchInput.value.trim();

            if (emailPaciente) {
                // Simula a navegação para uma página de detalhes do paciente
                window.location.href = "menuMedico.html";
            } else {
                alert('Por favor, insira um e-mail válido!');
            }
        });
    } else {
        console.error('Elemento do formulário de busca ou botão não encontrado.');
    }

    document.getElementById("buscar-paciente").addEventListener("click", (event) => {
        event.preventDefault(); // Impede o comportamento padrão do formulário
    
        const emailInput = document.getElementById("email-paciente").value.trim(); // Captura o valor do input
        const authToken = localStorage.getItem("authToken"); // Obtém o token de autenticação
    
        if (!authToken) {
            alert("Você precisa fazer login primeiro.");
            window.location.href = "loginMedico.html"; // Redireciona para login se o token não existir
            return;
        }
    
        if (!emailInput) {
            alert("Por favor, insira um e-mail válido!");
            return;
        }
    
        // Salva o e-mail no localStorage
        try {
            localStorage.setItem("email-paciente", emailInput); // Salva o e-mail do paciente
            alert(`E-mail identificado com sucesso!`);
            
            // Redireciona para outra página
            window.location.href = "menuMedico.html";
        } catch (error) {
            console.error("Erro ao salvar o e-mail no localStorage:", error);
            alert("Erro ao identificar o e-mail.");
        }
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
        document.getElementById('nome-medico').textContent = '';
    });
}



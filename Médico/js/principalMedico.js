const medicoLogado = "Dimas Augusto";

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nome-medico').textContent = medicoLogado;

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

    // Adicionar evento ao campo de CPF para formatar automaticamente
    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', () => {
        // Remover caracteres não numéricos
        let cpf = cpfInput.value.replace(/\D/g, '');
        // Limitar ao máximo de 11 caracteres
        if (cpf.length > 11) {
            cpf = cpf.slice(0, 11);
        }
        // Adicionar formatação ao CPF
        cpfInput.value = cpf
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    });

    fetchData();
});

function showMessage(message, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = "block";

    // Certificar-se de que o elemento existe antes de esconder
    setTimeout(() => {
        if (messageDiv) {
            messageDiv.style.display = "none";
        }
    }, 3000);
}

async function fetchData() {
    try {
        const response = await fetch('https://seuservidor.com/api/dados');
        if (!response.ok) throw new Error('Erro ao buscar dados do servidor');

        const data = await response.json();
        atualizarDados(data);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        showMessage("Não foi possível carregar os dados.", "error");
    }
}
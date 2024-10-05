// Simulando o nome do médico logado
const medicoLogado = "Dimas Augusto";  // Aqui você pode pegar o nome real de uma fonte como API ou localStorage

// Definindo o nome no campo correto
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nome-medico').textContent = medicoLogado;
    
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
});

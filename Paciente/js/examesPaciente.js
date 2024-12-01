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

document.addEventListener('DOMContentLoaded', () => {
    const examsGrid = document.querySelector('.exams-grid');
    const totalCards = 8; // Número total de espaços para anexar exames

    // Função para criar os quadrados para anexar exames
    for (let i = 0; i < totalCards; i++) {
        const examCard = document.createElement('div');
        examCard.classList.add('exam-card');
        examCard.innerHTML = `
            <i class="icon"><img src="imagens/Download.png" alt="exam-icon"></i> <!-- Ícone de download -->
            <p>Exame ${i + 1}</p>
        `;
        examCard.addEventListener('click', () => {
            alert(`Clique para anexar arquivo no Exame ${i + 1}`);
        });
        examsGrid.appendChild(examCard);
    }
});
// Função para voltar à página menuMedico.html
function goBack() {
    window.location.href = 'menuPaciente.html'; // Redireciona para a página menuMedico.html
}
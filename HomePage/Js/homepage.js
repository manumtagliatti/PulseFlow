document.getElementById('entrarBtn').addEventListener('click', function(event) {
    event.preventDefault(); // Impede o comportamento padrão do link
    window.location.href = '../selecao.html'; // Redireciona para a nova página
});
// Seleciona todos os links do menu de navegação
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault(); // Previne o comportamento padrão do link

        // Seleciona a seção para a qual deseja rolar
        const targetId = this.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);

        // Faz a rolagem suave até a seção alvo
        targetSection.scrollIntoView({
            behavior: "smooth" // Rolagem suave
        });
    });
});
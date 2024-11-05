// Botão "Entrar na Plataforma" com redirecionamento
document.getElementById('entrarBtn').addEventListener('click', function(event) {
    event.preventDefault();
    window.location.href = '../selecao.html';
});

// Navegação suave para seções
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);

        targetSection.scrollIntoView({
            behavior: "smooth"
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const cpfInput = document.querySelector('input[type="text"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = form.querySelector("button[type='submit']");
    const alertMessage = document.querySelector(".alert-message");

    submitButton.addEventListener("click", function(event) {
        // Verifica se os campos estão vazios
        if (!cpfInput.value || !passwordInput.value) {
            event.preventDefault(); // Impede o envio do formulário
            alertMessage.textContent = "Por favor, preencha todos os campos.";
            alertMessage.style.display = "block"; // Mostra a mensagem
        } else {
            alertMessage.style.display = "none"; // Esconde a mensagem se todos os campos estiverem preenchidos
        }
    });

    // Permite apenas números no campo de CPF
    cpfInput.addEventListener("input", function(event) {
        const value = this.value.replace(/[^0-9]/g, ''); // Remove qualquer caractere que não seja número
        if (this.value !== value) {
            this.value = value; // Atualiza o campo com o valor filtrado
            alertMessage.textContent = "Por favor, insira apenas números no CPF.";
            alertMessage.style.display = "block"; // Mostra a mensagem
        } else {
            alertMessage.style.display = "none"; // Esconde a mensagem se o input for válido
        }
    });
});


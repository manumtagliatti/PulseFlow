document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const cpfInput = document.querySelector('input[type="text"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = form.querySelector("button[type='submit']");
    const alertMessage = document.querySelector(".alert-message");

    submitButton.addEventListener("click", async function(event) {
        event.preventDefault();


        if (!cpfInput.value || !passwordInput.value) {
            alertMessage.textContent = "Por favor, preencha todos os campos.";
            alertMessage.style.display = "block";
            return;
        }

        try {

            const response = await fetch('/paciente/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: cpfInput.value,
                    senha: passwordInput.value
                })
            });

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem('token', data.token);

                window.location.href = "menuPaciente.html";
            } else {

                alertMessage.textContent = data.message || "Erro ao fazer login. Tente novamente.";
                alertMessage.style.display = "block";
            }
        } catch (error) {
            alertMessage.textContent = "Erro ao conectar ao servidor. Tente novamente mais tarde.";
            alertMessage.style.display = "block";
        }
    });


    cpfInput.addEventListener("input", function() {
        const value = this.value.replace(/[^0-9]/g, '');
        if (this.value !== value) {
            this.value = value;
            alertMessage.textContent = "Por favor, insira apenas números no CPF.";
            alertMessage.style.display = "block";
        } else {
            alertMessage.style.display = "none";
        }
    });
});

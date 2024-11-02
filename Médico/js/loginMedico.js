document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const cpfInput = document.querySelector('input[type="text"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const alertMessage = document.querySelector(".alert-message");

    // Envio do formulário de login
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Impede o envio do formulário padrão

        // Verifica se os campos estão vazios
        if (!cpfInput.value || !passwordInput.value) {
            alertMessage.textContent = "Por favor, preencha todos os campos.";
            alertMessage.style.display = "block";
            return;
        } else {
            alertMessage.style.display = "none";
        }

        // Dados de login
        const loginData = {
            cpf: cpfInput.value,
            senha: passwordInput.value,
        };

        // Enviar dados para o servidor
        fetch("http://localhost:3000/paciente/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(text);
                    });
                }
                return response.json();
            })
            .then((data) => {
                // Armazena o token e redireciona para a página protegida
                localStorage.setItem("token", data.token);
                window.location.href = "/pagina-protegida.html"; // Redireciona após login
            })
            .catch((error) => {
                alertMessage.textContent = error.message || "Erro ao fazer login.";
                alertMessage.style.display = "block";
            });
    });

    // Permite apenas números no campo de CPF
    cpfInput.addEventListener("input", function (event) {
        const value = this.value.replace(/[^0-9]/g, '');
        if (this.value !== value) {
            this.value = value;
            alertMessage.textContent = "Por favor, insira apenas números no CPF.";
            alertMessage.style.display = "block";
        } else {
            alertMessage.style.display = "none";
        }
    });

    // Redirecionamento para redefinir senha
    document.getElementById('forgot-password')?.addEventListener('click', function(event) {
        event.preventDefault(); // Previne comportamento padrão
        console.log("Redirecionando para a página de redefinição de senha...");
        window.location.href = '../Redefinir/redefinirSenha.html';
    });

    // Redirecionamento para página de registro
    document.getElementById('register-btn')?.addEventListener('click', function(event) {
        event.preventDefault();
        console.log("Redirecionando para a página de registro de médico...");
        window.location.href = '../Médico/registroMedico.html';
    });
});

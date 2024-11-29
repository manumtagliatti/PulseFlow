document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#loginForm");
    const cpfInput = document.querySelector("#cpf");
    const senhaInput = document.querySelector("#senha");
    const alertMessage = document.querySelector("#alertMessage");
    const registerBtn = document.querySelector("#register-btn"); // Botão "Cadastre-se Aqui"
    const forgotPasswordLink = document.querySelector("#forgot-password"); // Botão "Esqueceu a senha?"

    // Máscara para CPF
    cpfInput.addEventListener("input", function () {
        let cpf = cpfInput.value.replace(/\D/g, ""); // Remove caracteres não numéricos
        if (cpf.length > 11) cpf = cpf.slice(0, 11); // Limita ao máximo de 11 dígitos

        // Aplica a máscara
        cpfInput.value = cpf
            .replace(/(\d{3})(\d)/, "$1.$2") // Primeiro ponto
            .replace(/(\d{3})(\d)/, "$1.$2") // Segundo ponto
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Traço
    });

    // Evento de click no botão "Cadastre-se Aqui"
    registerBtn.addEventListener("click", function () {
        window.location.href = "registromedico.html"; // Redireciona para a página de registro
    });

    // Evento de click no link "Esqueceu a senha?"
    forgotPasswordLink.addEventListener("click", function (event) {
        event.preventDefault(); // Evita comportamento padrão
        window.location.href = "enviarlinkmedico.html"; // Redireciona para a página de recuperação de senha
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!cpfInput.value || !senhaInput.value) {
            alertMessage.textContent = "Por favor, preencha todos os campos.";
            alertMessage.style.display = "block";
            return;
        } else {
            alertMessage.style.display = "none";
        }

        const loginData = {
            cpf: cpfInput.value.replace(/\D/g, ""), // Remove formatação antes de enviar
            senha: senhaInput.value.trim(),
        };

        fetch("http://localhost:3000/api/medico/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Login bem-sucedido!");
                localStorage.setItem("authToken", data.token);  // Armazenar o token
                window.location.href = "principalMedico.html";  // Redirecionar para o perfil
            } else {
                showAlert(data.message || "CPF ou senha incorretos.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            showAlert("Erro de conexão com o servidor.");
        });
    });

    function showAlert(message) {
        alertMessage.textContent = message;
        alertMessage.style.display = "block";
    }
});

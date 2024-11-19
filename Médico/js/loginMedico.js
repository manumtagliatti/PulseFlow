document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#loginForm");
    const cpfInput = document.querySelector("#cpf");
    const senhaInput = document.querySelector("#senha");
    const alertMessage = document.querySelector("#alertMessage");
    const registerBtn = document.querySelector("#register-btn"); // Referência para o botão "Cadastre-se Aqui"

    // Evento de click no botão "Cadastre-se Aqui"
    registerBtn.addEventListener("click", function () {
        window.location.href = "registromedico.html"; // Redireciona para a página de registro
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
            cpf: cpfInput.value.trim(),
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
                window.location.href = "profileMedico.html";  // Redirecionar para o perfil
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

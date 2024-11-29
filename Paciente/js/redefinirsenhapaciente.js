document.addEventListener("DOMContentLoaded", initializeRedefinirPage);

function initializeRedefinirPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
        alert("Token ausente ou inválido!");
        window.location.href = "enviarlinkpaciente.html"; // Redireciona se o token estiver ausente
        return;
    }

    console.log("Token recebido na URL:", token); // Log para verificar o token

    const form = document.getElementById("redefinir-form");
    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            alterarSenha(token); // Passando o token como argumento
        });
    }
}

function alterarSenha(event) {
    event.preventDefault(); // Previne o comportamento padrão de envio do formulário

    const novaSenha = document.getElementById("nova-senha").value.trim();
    const confirmaSenha = document.getElementById("confirma-senha").value.trim();
    const alertElement = document.getElementById("alert-password");

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token"); // Token capturado da URL

    if (!token) {
        showAlert("Token ausente ou inválido. Tente novamente.", "red", alertElement);
        return;
    }

    // Validação de senha
    if (!novaSenha || novaSenha.length < 6) {
        showAlert("A senha deve ter pelo menos 6 caracteres.", "red", alertElement);
        return;
    }

    if (novaSenha !== confirmaSenha) {
        showAlert("As senhas não coincidem.", "red", alertElement);
        return;
    }

    console.log("Enviando nova senha com o token:", token);

    // Envio da solicitação ao backend
    fetch("http://127.0.0.1:3000/api/pacientes/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((result) => {
                    throw new Error(result.message || "Erro ao redefinir a senha.");
                });
            }
            return response.json();
        })
        .then(() => {
            showAlert("Senha redefinida com sucesso! Redirecionando...", "green", alertElement);
            setTimeout(() => (window.location.href = "loginpaciente.html"), 3000);
        })
        .catch((error) => {
            console.error("Erro na requisição:", error);
            showAlert(error.message || "Erro ao processar a solicitação.", "red", alertElement);
        });
}

function showAlert(message, color, alertElement) {
    if (alertElement) {
        alertElement.textContent = message;
        alertElement.style.color = color;
        alertElement.style.display = "block";

        // Oculta o alerta após 5 segundos
        setTimeout(() => {
            alertElement.style.display = "none";
        }, 5000);
    }
}

function confirmarCancelamento() {
    if (confirm("Tem certeza que deseja cancelar a solicitação de redefinir a senha?")) {
        window.location.href = "loginpaciente.html"; // Redireciona para a página de login
    }
}

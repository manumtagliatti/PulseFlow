document.addEventListener("DOMContentLoaded", initializeRedefinirPage);

function initializeRedefinirPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
        alert("Token ausente ou inválido!");
        window.location.href = "enviarlinkmedico.html"; // Redireciona se o token estiver ausente
    }

    // Exibe a página apenas se o token for válido
    const formContainer = document.getElementById("form-redefinir");
    formContainer.style.display = "block";
}

function alterarSenha() {
    const novaSenha = document.getElementById("nova-senha").value.trim();
    const confirmaSenha = document.getElementById("confirma-senha").value.trim();
    const alertElement = document.getElementById("alert-password");
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    // Validação de senha
    if (!novaSenha || novaSenha.length < 6) {
        showAlert("A senha deve ter pelo menos 6 caracteres.", "red", alertElement);
        return;
    }

    if (novaSenha !== confirmaSenha) {
        showAlert("As senhas não coincidem.", "red", alertElement);
        return;
    }

    // Enviar solicitação para redefinir senha
    fetch(`http://127.0.0.1:3000/api/medico/redefinir-senha`, { // Corrigido para a porta correta
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha: novaSenha }) // Inclui o token e a nova senha
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao redefinir a senha. Verifique o token ou tente novamente.");
            }
            return response.json();
        })
        .then((result) => {
            if (result.success) {
                showAlert("Senha redefinida com sucesso!", "green", alertElement);
                setTimeout(() => window.location.href = "loginMedico.html", 3000); // Redireciona após sucesso
            } else {
                showAlert(result.message || "Erro ao redefinir a senha.", "red", alertElement);
            }
        })
        .catch((error) => {
            console.error("Erro na requisição:", error);
            showAlert("Erro ao processar a solicitação. Tente novamente.", "red", alertElement);
        });
}

function showAlert(message, color, alertElement) {
    alertElement.textContent = message;
    alertElement.style.color = color;
    alertElement.style.display = "block";

    // Oculta o alerta após 5 segundos
    setTimeout(() => {
        alertElement.style.display = "none";
    }, 5000);
}

// Função de confirmação de cancelamento
function confirmarCancelamento() {
    var confirmacao = confirm("Tem certeza que deseja cancelar a solicitação de redefinir a senha?");
    if (confirmacao) {
        window.location.href = "loginMedico.html"; // Redireciona para a página de login
    }
}

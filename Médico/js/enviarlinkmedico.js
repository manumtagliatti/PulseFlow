function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function enviarEmailMedico() {
    const email = document.getElementById("email-medico").value.trim();
    const alertElement = document.getElementById("alert-medico");

    if (!validateEmail(email)) {
        showAlert("Por favor, insira um e-mail válido.", "red", alertElement);
        return;
    }

    fetch("http://127.0.0.1:3000/api/medico/enviar-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((result) => {
                    throw new Error(result.message || "Erro desconhecido.");
                });
            }
            return response.json();
        })
        .then((result) => {
            showAlert("Link enviado! Verifique seu e-mail.", "green", alertElement);
        })
        .catch((error) => {
            console.error("Erro na requisição:", error);
            showAlert(error.message || "Erro ao processar a solicitação.", "red", alertElement);
        });
}

function showAlert(message, color, alertElement) {
    alertElement.textContent = message;
    alertElement.style.color = color;
    alertElement.classList.add("show");

    setTimeout(() => alertElement.classList.remove("show"), 5000);
}

const form = document.getElementById("registrationForm");
const alertMessage = document.getElementById("alertMessage");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cpf = document.getElementById("cpf").value.trim();
    const nome = document.getElementById("nomeCompleto").value.trim(); // Ajuste para 'nome'
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    // Verificando se os campos essenciais estão preenchidos
    if (!cpf || !nome || !telefone || !email || !senha) {
        alertMessage.textContent = "Por favor, preencha todos os campos corretamente.";
        alertMessage.style.display = "block";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/pacientes/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf, nome, telefone, email, senha }),
        });

        if (response.ok) {
            alert("Cadastro realizado com sucesso!");
            window.location.href = "loginPaciente.html";
        } else {
            const data = await response.json();
            alertMessage.textContent = data.message || "Erro no cadastro.";
            alertMessage.style.display = "block";
            console.error("Erro na resposta do servidor:", data);
        }
    } catch (error) {
        alert("Erro ao conectar ao servidor.");
        console.error("Erro ao enviar solicitação:", error);
    }
});

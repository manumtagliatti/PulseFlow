document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registroMedicoForm");
    const alertMessage = document.getElementById("alertMessage");

    const nomeCompleto = document.getElementById("nomeCompleto");
    const cpf = document.getElementById("cpf");
    const telefonePessoal = document.getElementById("telefonePessoal");
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");
    const crm = document.getElementById("crm");
    const areaAtuacao = document.getElementById("areaAtuacao");
    const enderecoConsultorio1 = document.getElementById("enderecoConsultorio1");
    const enderecoConsultorio2 = document.getElementById("enderecoConsultorio2");
    const telefoneConsultorio = document.getElementById("telefoneConsultorio");

    function showAlert(message) {
        alertMessage.textContent = message;
        alertMessage.style.display = "block";
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        alertMessage.style.display = "none";

        if (!nomeCompleto.value || !cpf.value || !telefonePessoal.value || !email.value || !senha.value || !crm.value || !areaAtuacao.value || !enderecoConsultorio1.value) {
            showAlert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const cadastroData = {
            nomeCompleto: nomeCompleto.value,
            cpf: cpf.value,
            telefonePessoal: telefonePessoal.value,
            email: email.value,
            senha: senha.value,
            crm: crm.value,
            areaAtuacao: areaAtuacao.value,
            enderecoConsultorio1: enderecoConsultorio1.value,
            enderecoConsultorio2: enderecoConsultorio2.value,
            telefoneConsultorio: telefoneConsultorio.value,
        };

        // Enviando os dados para o servidor
        fetch("http://localhost:3000/api/medico/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cadastroData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Conta criada com sucesso!");
                window.location.href = "loginMedico.html"; // Redirecionar para login
            } else {
                showAlert(data.message || "Erro ao criar conta.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            showAlert("Erro de conexão com o servidor.");
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registroMedicoForm");
    const alertMessage = document.getElementById("alertMessage");

    // Campos do formulário
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

    // Máscara para CPF
    cpf.addEventListener("input", function () {
        let cpfValue = cpf.value.replace(/\D/g, ""); // Remove caracteres não numéricos
        if (cpfValue.length > 11) cpfValue = cpfValue.slice(0, 11); // Limita a 11 dígitos

        // Aplica a máscara
        cpf.value = cpfValue
            .replace(/(\d{3})(\d)/, "$1.$2") // Primeiro ponto
            .replace(/(\d{3})(\d)/, "$1.$2") // Segundo ponto
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Traço
    });

    // Máscara para Telefone
    telefonePessoal.addEventListener("input", function () {
        let telefoneValue = telefonePessoal.value.replace(/\D/g, ""); // Remove caracteres não numéricos
        if (telefoneValue.length > 11) telefoneValue = telefoneValue.slice(0, 11); // Limita a 11 dígitos

        // Aplica a máscara
        telefonePessoal.value = telefoneValue
            .replace(/^(\d{2})(\d)/, "($1) $2") // Parênteses no DDD
            .replace(/(\d{5})(\d)/, "$1-$2") // Hífen após os 5 dígitos (celular)
            .replace(/(\d{4})(\d{1,2})$/, "$1-$2"); // Alterna para telefone fixo
    });

    telefoneConsultorio.addEventListener("input", function () {
        let telefoneValue = telefoneConsultorio.value.replace(/\D/g, ""); // Remove caracteres não numéricos
        if (telefoneValue.length > 11) telefoneValue = telefoneValue.slice(0, 11); // Limita a 11 dígitos

        // Aplica a máscara
        telefoneConsultorio.value = telefoneValue
            .replace(/^(\d{2})(\d)/, "($1) $2") // Parênteses no DDD
            .replace(/(\d{5})(\d)/, "$1-$2") // Hífen após os 5 dígitos (celular)
            .replace(/(\d{4})(\d{1,2})$/, "$1-$2"); // Alterna para telefone fixo
    });

    // Máscara para CRM
    crm.addEventListener("input", function () {
        let crmValue = crm.value.replace(/[^a-zA-Z0-9]/g, ""); // Remove caracteres não alfanuméricos
        if (crmValue.length > 7) crmValue = crmValue.slice(0, 7); // Limita a 7 caracteres (5 números + 2 letras)

        // Aplica a máscara
        crm.value = crmValue
            .replace(/(\d{5})([a-zA-Z]{0,2})$/, "$1-$2") // Hífen entre números e letras
            .toUpperCase(); // Converte letras para maiúsculas
    });

    // Função para exibir mensagens de alerta
    function showAlert(message) {
        alertMessage.textContent = message;
        alertMessage.style.display = "block";
    }

    // Evento de envio do formulário
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        alertMessage.style.display = "none";

        // Verificação de campos obrigatórios
        if (!nomeCompleto.value || !cpf.value || !telefonePessoal.value || !email.value || !senha.value || !crm.value || !areaAtuacao.value || !enderecoConsultorio1.value) {
            showAlert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // Dados do cadastro
        const cadastroData = {
            nomeCompleto: nomeCompleto.value.trim(),
            cpf: cpf.value.replace(/\D/g, ""), // Remove a formatação do CPF
            telefonePessoal: telefonePessoal.value.replace(/\D/g, ""), // Remove a formatação do Telefone
            email: email.value.trim(),
            senha: senha.value.trim(),
            crm: crm.value.trim(), // O CRM pode ser enviado com a formatação
            areaAtuacao: areaAtuacao.value.trim(),
            enderecoConsultorio1: enderecoConsultorio1.value.trim(),
            enderecoConsultorio2: enderecoConsultorio2.value.trim(),
            telefoneConsultorio: telefoneConsultorio.value.replace(/\D/g, ""), // Remove a formatação do Telefone
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

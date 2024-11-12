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
    const telefoneConsultorio = document.getElementById("telefoneConsultorio");

    // Validação em tempo real para nome completo (somente letras e espaços)
    nomeCompleto.addEventListener("input", function () {
        nomeCompleto.value = nomeCompleto.value.replace(/[^a-zA-Z\s]/g, "");
    });

    // Validação e formatação do CPF ao digitar
    cpf.addEventListener("input", function () {
        let input = cpf.value.replace(/\D/g, "");
        if (input.length > 3 && input.length <= 6) {
            input = input.slice(0, 3) + '.' + input.slice(3);
        } else if (input.length > 6 && input.length <= 9) {
            input = input.slice(0, 3) + '.' + input.slice(3, 6) + '.' + input.slice(6);
        } else if (input.length > 9) {
            input = input.slice(0, 3) + '.' + input.slice(3, 6) + '.' + input.slice(6, 9) + '-' + input.slice(9, 11);
        }
        cpf.value = input;
    });

    // Validação e formatação do telefone ao digitar
    telefonePessoal.addEventListener("input", function () {
        let input = telefonePessoal.value.replace(/\D/g, "");
        if (input.length > 2 && input.length <= 7) {
            input = '(' + input.slice(0, 2) + ') ' + input.slice(2);
        } else if (input.length > 7) {
            input = '(' + input.slice(0, 2) + ') ' + input.slice(2, 7) + '-' + input.slice(7, 11);
        }
        telefonePessoal.value = input;
    });

    telefoneConsultorio.addEventListener("input", function () {
        let input = telefoneConsultorio.value.replace(/\D/g, "");
        if (input.length > 2 && input.length <= 7) {
            input = '(' + input.slice(0, 2) + ') ' + input.slice(2);
        } else if (input.length > 7) {
            input = '(' + input.slice(0, 2) + ') ' + input.slice(2, 7) + '-' + input.slice(7, 11);
        }
        telefoneConsultorio.value = input;
    });

    // Função para exibir mensagem de alerta
    function showAlert(message) {
        alertMessage.textContent = message;
        alertMessage.style.display = "block";
    }

    // Evento de envio do formulário
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Ocultar a mensagem de erro inicialmente
        alertMessage.style.display = "none";

        // Validações de campo vazio e formatos
        if (!nomeCompleto.value) {
            showAlert("Por favor, insira seu nome completo.");
        } else if (!cpf.value.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
            showAlert("CPF inválido. Use o formato XXX.XXX.XXX-XX.");
        } else if (!telefonePessoal.value.match(/^\(\d{2}\) \d{4,5}-\d{4}$/)) {
            showAlert("Telefone pessoal inválido. Use o formato (XX) XXXXX-XXXX.");
        } else if (!email.value.includes("@")) {
            showAlert("Por favor, insira um e-mail válido.");
        } else if (senha.value.length < 6) {
            showAlert("A senha deve ter pelo menos 6 caracteres.");
        } else if (!crm.value) {
            showAlert("Por favor, insira seu CRM.");
        } else if (!areaAtuacao.value) {
            showAlert("Por favor, insira sua área de atuação.");
        } else if (!enderecoConsultorio1.value) {
            showAlert("Por favor, insira o endereço do consultório.");
        } else if (!telefoneConsultorio.value.match(/^\(\d{2}\) \d{4,5}-\d{4}$/)) {
            showAlert("Telefone do consultório inválido. Use o formato (XX) XXXXX-XXXX.");
        } else {
            alertMessage.style.display = "none"; // Oculta a mensagem se tudo estiver correto
            alert("Conta criada com sucesso!");
            // Redirecione ou faça outra ação após a criação da conta
        }
    });
});

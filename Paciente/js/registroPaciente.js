document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registrationForm");
    const alertMessage = document.getElementById("alertMessage");
    const nomeCompleto = document.getElementById("nomeCompleto");
    const dataNascimento = document.getElementById("dataNascimento");
    const cpf = document.getElementById("cpf");
    const telefone = document.getElementById("telefone");
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");

    // Validação e formatação de campos
    nomeCompleto.addEventListener("input", () => {
        nomeCompleto.value = nomeCompleto.value.replace(/[^a-zA-Z\s]/g, "");
    });

    dataNascimento.addEventListener("input", () => {
        let input = dataNascimento.value.replace(/\D/g, "");
        if (input.length > 2 && input.length <= 4) {
            input = input.slice(0, 2) + '/' + input.slice(2);
        } else if (input.length > 4) {
            input = input.slice(0, 2) + '/' + input.slice(2, 4) + '/' + input.slice(4, 8);
        }
        dataNascimento.value = input;
    });

    cpf.addEventListener("input", () => {
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

    telefone.addEventListener("input", () => {
        let input = telefone.value.replace(/\D/g, "");
        if (input.length > 2 && input.length <= 7) {
            input = '(' + input.slice(0, 2) + ') ' + input.slice(2);
        } else if (input.length > 7 && input.length <= 11) {
            input = '(' + input.slice(0, 2) + ') ' + input.slice(2, 7) + '-' + input.slice(7);
        }
        telefone.value = input;
    });

    // Função de envio do formulário
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Validação dos campos
        if (!nomeCompleto.value) return showAlert("Por favor, insira seu nome completo.");
        if (!dataNascimento.value.match(/^\d{2}\/\d{2}\/\d{4}$/)) return showAlert("Data de nascimento inválida. Use o formato DD/MM/AAAA.");
        if (!cpf.value.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) return showAlert("CPF inválido. Use o formato XXX.XXX.XXX-XX.");
        if (!telefone.value.match(/^\(\d{2}\) \d{4,5}-\d{4}$/)) return showAlert("Telefone inválido. Use o formato (XX) XXXXX-XXXX.");
        if (!email.value.includes("@")) return showAlert("Por favor, insira um e-mail válido.");
        if (senha.value.length < 6) return showAlert("A senha deve ter pelo menos 6 caracteres.");

        // Dados do paciente para envio
        const pacienteData = {
            nome: nomeCompleto.value,
            dataNascimento: dataNascimento.value,
            cpf: cpf.value.replace(/[^\d]/g, ""),
            telefonePessoal: telefone.value.replace(/[^\d]/g, ""),
            email: email.value,
            senha: senha.value
        };

        try {
            const response = await fetch("http://localhost:3000/paciente/registro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pacienteData)
            });

            if (response.ok) {
                showAlert("Conta criada com sucesso!", "success");
                setTimeout(() => {
                    window.location.href = "menuPaciente.html";
                }, 2000);
            } else {
                const errorText = await response.text();
                showAlert(errorText, "error");
            }
        } catch (error) {
            showAlert("Erro ao conectar com o servidor. Tente novamente.", "error");
            console.error("Erro:", error);
        }
    });

    // Função para exibir alertas de mensagem
    function showAlert(message, type = "error") {
        alertMessage.textContent = message;
        alertMessage.classList.remove("success", "error");
        alertMessage.classList.add(type);
        alertMessage.style.display = "block";
        alertMessage.classList.add("show");

        setTimeout(() => {
            alertMessage.style.display = "none";
            alertMessage.classList.remove("show");
        }, 3000);
    }
});
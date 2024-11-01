document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registrationForm");
    const alertMessage = document.getElementById("alertMessage");
    const nomeCompleto = document.getElementById("nomeCompleto");
    const dataNascimento = document.getElementById("dataNascimento");
    const cpf = document.getElementById("cpf");
    const telefone = document.getElementById("telefone");
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");

    nomeCompleto.addEventListener("input", function () {
        nomeCompleto.value = nomeCompleto.value.replace(/[^a-zA-Z\s]/g, "");
    });

    dataNascimento.addEventListener("input", function () {
        let input = dataNascimento.value;
        input = input.replace(/\D/g, ""); 

        if (input.length > 2 && input.length <= 4) {
            input = input.slice(0, 2) + '/' + input.slice(2);
        } else if (input.length > 4) {
            input = input.slice(0, 2) + '/' + input.slice(2, 4) + '/' + input.slice(4, 8);
        }

        dataNascimento.value = input;
    });

    
    cpf.addEventListener("input", function () {
        let input = cpf.value;
        input = input.replace(/\D/g, "");

        if (input.length > 3 && input.length <= 6) {
            input = input.slice(0, 3) + '.' + input.slice(3);
        } else if (input.length > 6 && input.length <= 9) {
            input = input.slice(0, 3) + '.' + input.slice(3, 6) + '.' + input.slice(6);
        } else if (input.length > 9) {
            input = input.slice(0, 3) + '.' + input.slice(3, 6) + '.' + input.slice(6, 9) + '-' + input.slice(9, 11);
        }

        cpf.value = input;
    });


    telefone.addEventListener("input", function () {
        let input = telefone.value;
        input = input.replace(/\D/g, "");

        if (input.length > 2 && input.length <= 7) {
            input = '(' + input.slice(0, 2) + ') ' + input.slice(2);
        } else if (input.length > 7 && input.length <= 11) {
            input = '(' + input.slice(0, 2) + ') ' + input.slice(2, 7) + '-' + input.slice(7);
        } else if (input.length > 11) {
            input = '(' + input.slice(0, 2) + ') ' + input.slice(2, 7) + '-' + input.slice(7, 11);
        }

        telefone.value = input;
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

 
        if (!nomeCompleto.value) {
            showAlert("Por favor, insira seu nome completo.");
            return;
        } else if (!dataNascimento.value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            showAlert("Data de nascimento inválida. Use o formato DD/MM/AAAA.");
            return;
        } else if (!cpf.value.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
            showAlert("CPF inválido. Use o formato XXX.XXX.XXX-XX.");
            return;
        } else if (!telefone.value.match(/^\(\d{2}\) \d{4,5}-\d{4}$/)) {
            showAlert("Telefone inválido. Use o formato (XX) XXXXX-XXXX.");
            return;
        } else if (!email.value.includes("@")) {
            showAlert("Por favor, insira um e-mail válido.");
            return;
        } else if (senha.value.length < 6) {
            showAlert("A senha deve ter pelo menos 6 caracteres.");
            return;
        }


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
                alertMessage.style.display = "none";
                alert("Conta criada com sucesso!");
                window.location.href = "menuPaciente.html"; 
            } else {
                const errorText = await response.text();
                showAlert(errorText);
            }
        } catch (error) {
            showAlert("Erro ao conectar com o servidor. Tente novamente.");
            console.error("Erro:", error);
        }
    });

    function showAlert(message) {
        alertMessage.textContent = message;
        alertMessage.style.display = "block";
    }
});

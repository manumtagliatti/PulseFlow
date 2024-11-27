const form = document.getElementById("registrationForm");
const alertMessage = document.getElementById("alertMessage");

// Função para formatar CPF
const formatarCPF = (cpf) => {
    // Remove todos os caracteres não numéricos
    cpf = cpf.replace(/[^\d]+/g, '');
    // Formata o CPF no padrão xxx.xxx.xxx-xx
    if (cpf.length <= 11) {
        cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
        cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return cpf;
};

// Função para validar CPF
const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
    if (cpf.length !== 11) return false;

    let soma = 0;
    let resto;

    // Validação do primeiro dígito
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf[i - 1]) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    // Validação do segundo dígito
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf[i - 1]) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) return false;

    return true;
};

// Função para formatar telefone
const formatarTelefone = (telefone) => {
    // Remove todos os caracteres não numéricos
    telefone = telefone.replace(/[^\d]+/g, '');
    // Formata o telefone no padrão (XX) XXXXX-XXXX
    if (telefone.length > 10) {
        telefone = telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (telefone.length > 5) {
        telefone = telefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else if (telefone.length > 2) {
        telefone = telefone.replace(/(\d{2})(\d{0,4})/, "($1) $2");
    }
    return telefone;
};

// Função para formatar data de nascimento
const formatarDataNascimento = (data) => {
    // Remove todos os caracteres não numéricos
    data = data.replace(/[^\d]+/g, '');
    // Formata a data no padrão DD/MM/AAAA
    if (data.length > 2 && data.length <= 4) {
        data = data.replace(/(\d{2})(\d{0,2})/, "$1/$2");
    } else if (data.length > 4) {
        data = data.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
    }
    return data;
};

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cpf = document.getElementById("cpf").value.trim();
    const nome = document.getElementById("nomeCompleto").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const dataNascimento = document.getElementById("dataNascimento").value.trim();

    // Validações
    if (!cpf || !nome || !telefone || !email || !senha || !dataNascimento) {
        alertMessage.textContent = "Por favor, preencha todos os campos corretamente.";
        alertMessage.style.display = "block";
        return;
    }

    if (!validarCPF(cpf)) {
        alertMessage.textContent = "CPF inválido. Por favor, verifique.";
        alertMessage.style.display = "block";
        return;
    }

    if (senha.length < 6) {
        alertMessage.textContent = "A senha deve ter pelo menos 6 caracteres.";
        alertMessage.style.display = "block";
        return;
    }

    // Formata o CPF, telefone e data de nascimento antes de enviar
    const cpfFormatado = formatarCPF(cpf);
    const telefoneFormatado = formatarTelefone(telefone);
    const dataNascimentoFormatada = formatarDataNascimento(dataNascimento);

    try {
        const response = await fetch("http://localhost:3000/api/pacientes/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf: cpfFormatado, nome, telefone: telefoneFormatado, email, senha, dataNascimento: dataNascimentoFormatada }),
        });

        if (response.ok) {
            alert("Cadastro realizado com sucesso!");
            window.location.href = "loginPaciente.html"; // Redireciona para a página de login
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

// Evento para formatar CPF enquanto o usuário digita
document.getElementById('cpf').addEventListener('input', (event) => {
    let cpf = event.target.value;
    cpf = formatarCPF(cpf);
    event.target.value = cpf;
});

// Evento para formatar telefone enquanto o usuário digita
document.getElementById('telefone').addEventListener('input', (event) => {
    let telefone = event.target.value;
    telefone = formatarTelefone(telefone);
    event.target.value = telefone;
});

// Evento para formatar data de nascimento enquanto o usuário digita
document.getElementById('dataNascimento').addEventListener('input', (event) => {
    let data = event.target.value;
    data = formatarDataNascimento(data);
    event.target.value = data;
});

const loginPaciente = async (event) => {
    event.preventDefault();

    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;

    // Função para validar CPF
    const validarCPF = (cpf) => {
        cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

        if (cpf.length !== 11) return false; // CPF deve ter 11 dígitos

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

    // Validações de CPF e Senha
    if (!cpf || !senha) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    if (!validarCPF(cpf)) {
        alert('CPF inválido. Por favor, verifique.');
        return;
    }

    if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/pacientes/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cpf, senha })
        });

        const data = await response.json();
        
        if (response.status === 200) {
            // Armazenar o token no localStorage ou sessionStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem("email", data.email); // Salva o e-mail do paciente
            localStorage.setItem("nome-paciente", data.nome); // Salva o nome do paciente

            alert('Login realizado com sucesso!');
            window.location.href = 'profilePaciente.html'; // Redireciona após login bem-sucedido
        } else {
            alert(data.message || 'Erro ao realizar login');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar ao servidor');
    }
};

// Redirecionamento para a página de registro
document.getElementById('register-btn').addEventListener('click', () => {
    window.location.href = 'registroPaciente.html';  // Redireciona para a página de registro
});

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

// Evento para formatar CPF enquanto o usuário digita
document.getElementById('cpf').addEventListener('input', (event) => {
    let cpf = event.target.value;
    cpf = formatarCPF(cpf);
    event.target.value = cpf;
});

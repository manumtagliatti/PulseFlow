const loginPaciente = async (event) => {
    event.preventDefault();

    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;

    if (!cpf || !senha) {
        alert('Por favor, preencha todos os campos.');
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
            localStorage.setItem("nome-paciente", data.nome); // Salva o e-mail do paciente

            alert('Login realizado com sucesso!');
            window.location.href = 'profilePaciente.html';
        } else {
            alert(data.message || 'Erro ao realizar login');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar ao servidor');
    }
};

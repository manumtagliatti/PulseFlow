const nomePaciente = document.getElementById("nome-paciente");
const cpfPaciente = document.getElementById("cpf-paciente");
const nomeField = document.getElementById("nome");
const telefoneField = document.getElementById("telefone");
const emailField = document.getElementById("email");
const token = localStorage.getItem("token");

if (!token) {
    alert("Você precisa estar logado.");
    window.location.href = "loginPaciente.html";
}

function goBack() {
    window.location.href = 'menuPaciente.html'; // Redireciona para a página menuPaciente.html
}

async function fetchProfile() {
    try {
        const response = await fetch("http://localhost:3000/api/pacientes/perfil", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                nomePaciente.textContent = data.paciente.nome;
                cpfPaciente.textContent = data.paciente.cpf;

                // Exibir as informações no perfil
                nomeField.textContent = data.paciente.nome;
                telefoneField.textContent = data.paciente.telefone;
                emailField.textContent = data.paciente.email;
            } else {
                alert("Erro ao carregar perfil.");
                window.location.href = "loginPaciente.html";
            }
        } else {
            alert("Erro ao carregar perfil.");
            window.location.href = "loginPaciente.html";
        }
    } catch (error) {
        alert("Erro ao conectar ao servidor.");
        console.error(error);
    }
}

fetchProfile();

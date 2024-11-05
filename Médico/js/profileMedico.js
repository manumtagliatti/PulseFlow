// Define as variáveis de API e token JWT
const apiUrl = "https://seu-backend.com/api"; // substitua pelo URL do backend
const token = localStorage.getItem("jwt");

// Função para exibir mensagens
function showMessage(message, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = "block";

    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 3000);
}

// Função para carregar informações do perfil
async function loadProfile() {
    try {
        const response = await fetch(`${apiUrl}/medico/perfil`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Erro ao carregar dados do perfil");

        const data = await response.json();
        document.getElementById("nome-medico").textContent = data.nome;
        document.getElementById("cpf-medico").textContent = data.cpf;
        document.querySelector("input[placeholder='NOME COMPLETO']").value = data.nome;
        document.querySelector("input[placeholder='TELEFONE CONSULTÓRIO']").value = data.telefone;
        document.querySelector("input[placeholder='ENDEREÇO CONSULTÓRIO']").value = data.endereco;
        document.querySelector("input[placeholder='EMAIL']").value = data.email;

        // Atualiza a foto de perfil se houver uma URL para a foto no backend
        if (data.fotoUrl) {
            document.querySelector(".photo").src = data.fotoUrl;
        }

    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        showMessage("Não foi possível carregar as informações do perfil.", "error");
    }
}

// Função para atualizar o perfil
async function updateProfile(event) {
    event.preventDefault();

    const nome = document.querySelector("input[placeholder='NOME COMPLETO']").value;
    const telefone = document.querySelector("input[placeholder='TELEFONE CONSULTÓRIO']").value;
    const endereco = document.querySelector("input[placeholder='ENDEREÇO CONSULTÓRIO']").value;
    const email = document.querySelector("input[placeholder='EMAIL']").value;
    const senha = document.querySelector("input[placeholder='SENHA']").value;
    const confirmarSenha = document.querySelector("input[placeholder='CONFIRMAR SENHA']").value;

    if (senha !== confirmarSenha) {
        showMessage("As senhas não coincidem.", "error");
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/medico/perfil`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nome, telefone, endereco, email, senha })
        });

        if (!response.ok) throw new Error("Erro ao atualizar perfil");

        showMessage("Perfil atualizado com sucesso!", "success");

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        showMessage("Não foi possível atualizar o perfil.", "error");
    }
}

// Função para carregar e enviar a foto de perfil
async function uploadPhoto(file) {
    const formData = new FormData();
    formData.append("foto", file);

    try {
        const response = await fetch(`${apiUrl}/medico/foto`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) throw new Error("Erro ao enviar a foto");

        const data = await response.json();
        document.querySelector(".photo").src = data.fotoUrl; // Atualiza a imagem no frontend

        showMessage("Foto atualizada com sucesso!", "success");

    } catch (error) {
        console.error("Erro ao enviar a foto:", error);
        showMessage("Não foi possível enviar a foto.", "error");
    }
}

// Função para redirecionar para uma URL específica
function goBack() {
    window.location.href = 'menuMedico.html';
}

// Event listeners
document.addEventListener("DOMContentLoaded", loadProfile);
document.querySelector("form").addEventListener("submit", updateProfile);
document.getElementById("camera-icon").addEventListener("click", () => {
    document.getElementById("photo-input").click(); // Abre o seletor de arquivos
});
document.getElementById("photo-input").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) uploadPhoto(file);
});
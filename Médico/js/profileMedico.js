document.addEventListener("DOMContentLoaded", () => {
    loadProfile();

    // Função para carregar o perfil do médico
    async function loadProfile() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert("Token não encontrado. Faça login.");
            window.location.href = 'loginMedico.html'; // Atualizado para redirecionar corretamente
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/medico/perfil', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert("Sessão expirada. Faça login novamente.");
                    window.location.href = '/loginMedico.html';
                } else {
                    throw new Error(`Erro ao carregar perfil: ${response.status}`);
                }
                return;
            }

            const data = await response.json();
            if (data.success) {
                const medico = data.medico;
                document.getElementById('nome-medico').textContent = medico.nomeCompleto || 'N/A';
                document.getElementById('crm').textContent = medico.crm || 'N/A';
                document.getElementById('input-nome').value = medico.nomeCompleto || 'N/A';
                document.getElementById('input-telefone').value = medico.telefoneConsultorio || 'N/A';
                document.getElementById('input-endereco').value = `${medico.enderecoConsultorio1 || ''} ${medico.enderecoConsultorio2 || ''}`.trim() || 'N/A';
                document.getElementById('input-email').value = medico.email || 'N/A';

                // Atualizar a imagem de perfil, se disponível
                if (medico.fotoUrl) {
                    document.getElementById('photo').src = medico.fotoUrl;
                }                   
            } else {
                alert(data.message || "Erro ao carregar perfil.");
            }
        } catch (error) {
            console.error("Erro na API:", error);
            alert("Erro ao carregar o perfil. Tente novamente.");
        }
    }

    // Função para voltar à página menuMedico.html
    function goBack() {
        window.location.href = 'menuMedico.html'; // Redireciona para a página menuMedico.html
    }

    // Event listener para o botão de voltar
    document.querySelector('.back-button').addEventListener('click', goBack);
});

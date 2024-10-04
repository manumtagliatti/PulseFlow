function submitRole() {
    const selectedRole = document.querySelector('input[name="role"]:checked');

    if (selectedRole) {
        if (selectedRole.value === 'medico') {
            // Caminho relativo correto para loginMedico.html
            window.location.href = '../Médico/registroMedico.html';
        } else if (selectedRole.value === 'paciente') {
            // Caminho relativo correto para loginPaciente.html
            window.location.href = '../Paciente/registroPaciente.html';
        }
    } else {
        alert('Por favor, selecione uma opção antes de continuar.');
    }
}
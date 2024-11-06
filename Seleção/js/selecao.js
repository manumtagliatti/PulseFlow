function submitRole() {
    const roleForm = document.getElementById('roleForm');
    const selectedRole = roleForm.role.value;

    if (selectedRole === 'medico') {
        // Redireciona para a página loginMedico dentro da pasta Médico
        window.location.href = '../Médico/loginMedico.html';
    } else if (selectedRole === 'paciente') {
        // Redireciona para a página loginPaciente dentro da pasta Paciente
        window.location.href = '../Paciente/loginPaciente.html';
    } else {
        alert('Por favor, selecione uma opção antes de continuar.'); // Alerta caso nenhuma opção seja selecionada
    }
}

document.getElementById("buscar-paciente").addEventListener("click", () => {
    const emailInput = document.getElementById("email-paciente").value.trim();
    if (!authToken) {
        alert("Você precisa fazer login primeiro.");
        window.location.href = "loginMedico.html";
        return;
    }
    
    if (!emailInput) {
        alert("Por favor, insira um e-mail válido!");
        return;
    }

    // Salvar o e-mail no localStorage
    localStorage.setItem("email-paciente", emailInput);

    alert(`E-mail salvo com sucesso!`);
    
    // Redirecionar para outra página, se necessário
    window.location.href = "menuMedico.html";
});

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    
    // Captura os dados dos inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Feedback visual no botão
    const btn = loginForm.querySelector('button');
    btn.textContent = 'Entrando...'; btn.disabled = true;

    try {
        // Envia dados para o Backend
        const result = await fetchAPI('/auth/login', 'POST', { email, password });

        if (result.ok) {
            // Salva sessão no navegador e redireciona
            localStorage.setItem('userId', result.data.userId);
            localStorage.setItem('userName', result.data.name);
            await Swal.fire({ icon: 'success', title: 'Bem-vindo!', timer: 1500, showConfirmButton: false, background: '#1E1E1E', color: '#FFF' });
            window.location.href = 'dashboard.html';
        } else {
            // Exibe erro caso falhe
            Swal.fire({ icon: 'error', title: 'Erro', text: result.data.error, background: '#1E1E1E', color: '#FFF', confirmButtonColor: '#FFC107' });
        }
    } catch (err) { console.error(err); } 
    finally { btn.textContent = 'Entrar'; btn.disabled = false; }
});
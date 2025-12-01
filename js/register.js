const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita refresh
    
    // Captura dados do formulário
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Feedback de carregamento
    const btn = registerForm.querySelector('button');
    btn.textContent = 'Cadastrando...'; btn.disabled = true;

    try {
        // Envia requisição de criação para a API
        const result = await fetchAPI('/auth/register', 'POST', { name, email, password });
        
        if (result.ok) {
            await Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'Conta criada.', confirmButtonColor: '#FFC107', background: '#1E1E1E', color: '#FFF' });
            window.location.href = 'index.html'; // Manda para o login
        } else {
            Swal.fire({ icon: 'error', title: 'Erro', text: result.data.error, background: '#1E1E1E', color: '#FFF', confirmButtonColor: '#FFC107' });
        }
    } catch (err) { console.error(err); }
    finally { btn.textContent = 'Cadastrar'; btn.disabled = false; }
});
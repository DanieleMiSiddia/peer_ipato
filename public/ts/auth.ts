const loginForm = document.getElementById('loginForm') as HTMLFormElement;

loginForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const submitBtn = loginForm.querySelector('.btn-primary') as HTMLButtonElement;

    // Disabilitiamo il bottone durante la richiesta
    submitBtn.disabled = true;
    submitBtn.textContent = 'Accesso in corso...';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message, 'error');
            return;
        }

        // Salviamo il token e i dati utente nel browser
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showMessage('Login effettuato! Reindirizzamento...', 'success');

        // Redirect alla dashboard dopo un breve delay
        setTimeout(() => {
            window.location.href = '/pages/HomePageUtente.html';
        }, 1000);

    } catch (error) {
        showMessage('Errore di connessione al server', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Accedi';
    }
});

function showMessage(text: string, type: 'error' | 'success'): void {
    let msgDiv = document.getElementById('form-message');

    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'form-message';
        loginForm.insertBefore(msgDiv, loginForm.firstChild);
    }

    msgDiv.textContent = text;
    msgDiv.className = `form-message ${type}`;
}

export {};

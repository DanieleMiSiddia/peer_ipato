var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = loginForm.querySelector('.btn-primary');
    // Disabilitiamo il bottone durante la richiesta
    submitBtn.disabled = true;
    submitBtn.textContent = 'Accesso in corso...';
    try {
        const response = yield fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = yield response.json();
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
    }
    catch (error) {
        showMessage('Errore di connessione al server', 'error');
    }
    finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Accedi';
    }
}));
function showMessage(text, type) {
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
//# sourceMappingURL=auth.js.map
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    const form = document.getElementById('form-modifica-email');
    const inputEmail = document.getElementById('nuova-email');
    const btnModifica = document.getElementById('btn-modifica');
    const showMessage = (text, type) => {
        let msgDiv = document.getElementById('form-message');
        if (!msgDiv) {
            msgDiv = document.createElement('div');
            msgDiv.id = 'form-message';
            form.insertBefore(msgDiv, form.firstChild);
        }
        msgDiv.textContent = text;
        msgDiv.className = `form-message ${type}`;
    };
    const clearMessage = () => {
        const msgDiv = document.getElementById('form-message');
        if (msgDiv)
            msgDiv.remove();
    };
    document.getElementById('btn-annulla').addEventListener('click', () => {
        window.location.href = '/pages/datiProfilo.html';
    });
    form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        clearMessage();
        const nuovaEmail = inputEmail.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(nuovaEmail)) {
            showMessage('Inserisci un indirizzo email valido.', 'error');
            return;
        }
        btnModifica.disabled = true;
        try {
            const response = yield fetch('/api/utente/email', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ nuova_email: nuovaEmail })
            });
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
            const data = yield response.json();
            if (response.ok) {
                showMessage('Email cambiata correttamente! Reindirizzamento...', 'success');
                setTimeout(() => {
                    window.location.href = '/pages/datiProfilo.html';
                }, 1500);
            }
            else {
                showMessage(data.message || 'Errore durante l\'operazione.', 'error');
            }
        }
        catch (_a) {
            showMessage('Errore di connessione. Riprova.', 'error');
        }
        finally {
            btnModifica.disabled = false;
        }
    }));
});
export {};
//# sourceMappingURL=modificaEmail.js.map
"use strict";
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
    const params = new URLSearchParams(window.location.search);
    const id_conferenza = params.get('id');
    if (!id_conferenza) {
        window.location.href = '/pages/dashboard/DashboardChair.html';
        return;
    }
    const form = document.getElementById('add-form');
    const emailInput = document.getElementById('email');
    const btnAnnulla = document.getElementById('btn-annulla');
    const btnSubmit = form.querySelector('button[type="submit"]');
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
    form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        clearMessage();
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Inserisci un indirizzo email valido.', 'error');
            return;
        }
        btnSubmit.disabled = true;
        try {
            const response = yield fetch(`/api/dashboard-chair/conferenze/${id_conferenza}/co-chair`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ email })
            });
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
            const data = yield response.json();
            if (response.ok) {
                showMessage('Co-Chair aggiunto con successo!', 'success');
                setTimeout(() => {
                    window.location.href = `/pages/GestioneConferenza.html?id=${id_conferenza}`;
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
            btnSubmit.disabled = false;
        }
    }));
    btnAnnulla.addEventListener('click', () => {
        window.location.href = `/pages/GestioneConferenza.html?id=${id_conferenza}`;
    });
});
//# sourceMappingURL=aggiungiCoChair.js.map
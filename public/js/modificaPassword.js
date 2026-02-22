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
    const form = document.getElementById('form-modifica-password');
    const inputVecchia = document.getElementById('vecchia-password');
    const inputNuova = document.getElementById('nuova-password');
    const inputConferma = document.getElementById('conferma-password');
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
        const vecchia = inputVecchia.value;
        const nuova = inputNuova.value;
        const conferma = inputConferma.value;
        if (nuova.length < 6) {
            showMessage('La password deve avere almeno 6 caratteri.', 'error');
            return;
        }
        if (nuova !== conferma) {
            showMessage('Le due password non coincidono.', 'error');
            return;
        }
        btnModifica.disabled = true;
        try {
            const response = yield fetch('/api/utente/modificaPassword', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ vecchia_password: vecchia, nuova_password: nuova })
            });
            if (response.status === 401) {
                showMessage('Password attuale non corretta.', 'error');
                return;
            }
            const data = yield response.json();
            if (response.ok) {
                showMessage('Password aggiornata con successo! Reindirizzamento...', 'success');
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
//# sourceMappingURL=modificaPassword.js.map
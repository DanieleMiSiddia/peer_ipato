"use strict";
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
    const form       = document.getElementById('add-form');
    const emailInput = document.getElementById('email');
    const btnAnnulla = document.getElementById('btn-annulla');
    const btnSubmit  = form.querySelector('button[type="submit"]');
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
        if (msgDiv) msgDiv.remove();
    };
    form.addEventListener('submit', async (e) => {
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
            const response = await fetch(`/api/dashboard-chair/conferenze/${id_conferenza}/membro-pc`, {
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
            const data = await response.json();
            if (response.ok) {
                showMessage('Membro PC aggiunto con successo!', 'success');
                setTimeout(() => {
                    window.location.href = `/pages/GestioneConferenza.html?id=${id_conferenza}`;
                }, 1500);
            } else {
                showMessage(data.message || 'Errore durante l\'operazione.', 'error');
            }
        } catch {
            showMessage('Errore di connessione. Riprova.', 'error');
        } finally {
            btnSubmit.disabled = false;
        }
    });
    btnAnnulla.addEventListener('click', () => {
        window.location.href = `/pages/GestioneConferenza.html?id=${id_conferenza}`;
    });
});

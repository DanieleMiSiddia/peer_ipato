"use strict";
document.addEventListener('DOMContentLoaded', function () {
    var token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    var form        = document.getElementById('form-modifica-email');
    var inputEmail  = document.getElementById('nuova-email');
    var btnModifica = document.getElementById('btn-modifica');
    var showMessage = function (text, type) {
        var msgDiv = document.getElementById('form-message');
        if (!msgDiv) {
            msgDiv = document.createElement('div');
            msgDiv.id = 'form-message';
            form.insertBefore(msgDiv, form.firstChild);
        }
        msgDiv.textContent = text;
        msgDiv.className = 'form-message ' + type;
    };
    var clearMessage = function () {
        var msgDiv = document.getElementById('form-message');
        if (msgDiv) msgDiv.remove();
    };
    document.getElementById('btn-annulla').addEventListener('click', function () {
        window.location.href = '/pages/datiProfilo.html';
    });
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessage();
        var nuovaEmail = inputEmail.value.trim();
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(nuovaEmail)) {
            showMessage('Inserisci un indirizzo email valido.', 'error');
            return;
        }
        btnModifica.disabled = true;
        try {
            var response = await fetch('/api/utente/email', {
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
            var data = await response.json();
            if (response.ok) {
                showMessage('Email cambiata correttamente! Reindirizzamento...', 'success');
                setTimeout(function () {
                    window.location.href = '/pages/datiProfilo.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Errore durante l\'operazione.', 'error');
            }
        } catch (err) {
            showMessage('Errore di connessione. Riprova.', 'error');
        } finally {
            btnModifica.disabled = false;
        }
    });
});

"use strict";
document.addEventListener('DOMContentLoaded', function () {
    var token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    var form          = document.getElementById('form-modifica-password');
    var inputVecchia  = document.getElementById('vecchia-password');
    var inputNuova    = document.getElementById('nuova-password');
    var inputConferma = document.getElementById('conferma-password');
    var btnModifica   = document.getElementById('btn-modifica');
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
        var vecchia  = inputVecchia.value;
        var nuova    = inputNuova.value;
        var conferma = inputConferma.value;
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
            var response = await fetch('/api/utente/modificaPassword', {
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
            var data = await response.json();
            if (response.ok) {
                showMessage('Password aggiornata con successo! Reindirizzamento...', 'success');
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

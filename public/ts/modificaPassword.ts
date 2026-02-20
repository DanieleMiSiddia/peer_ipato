document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const form          = document.getElementById('form-modifica-password') as HTMLFormElement;
    const inputVecchia  = document.getElementById('vecchia-password')        as HTMLInputElement;
    const inputNuova    = document.getElementById('nuova-password')          as HTMLInputElement;
    const inputConferma = document.getElementById('conferma-password')       as HTMLInputElement;
    const btnModifica   = document.getElementById('btn-modifica')            as HTMLButtonElement;

    const showMessage = (text: string, type: string) => {
        let msgDiv = document.getElementById('form-message') as HTMLElement | null;
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

    document.getElementById('btn-annulla')!.addEventListener('click', () => {
        window.location.href = '/pages/datiProfilo.html';
    });

    form.addEventListener('submit', async (e: Event) => {
        e.preventDefault();
        clearMessage();

        const vecchia  = inputVecchia.value;
        const nuova    = inputNuova.value;
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
            const response = await fetch('/api/utente/modificaPassword', {
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

            const data = await response.json();

            if (response.ok) {
                showMessage('Password aggiornata con successo! Reindirizzamento...', 'success');
                setTimeout(() => {
                    window.location.href = '/pages/datiProfilo.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Errore durante l\'operazione.', 'error');
            }

        } catch {
            showMessage('Errore di connessione. Riprova.', 'error');
        } finally {
            btnModifica.disabled = false;
        }
    });
});

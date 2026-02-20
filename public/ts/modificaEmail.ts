document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const form        = document.getElementById('form-modifica-email') as HTMLFormElement;
    const inputEmail  = document.getElementById('nuova-email')         as HTMLInputElement;
    const btnModifica = document.getElementById('btn-modifica')        as HTMLButtonElement;

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

        const nuovaEmail = inputEmail.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(nuovaEmail)) {
            showMessage('Inserisci un indirizzo email valido.', 'error');
            return;
        }

        btnModifica.disabled = true;

        try {
            const response = await fetch('/api/utente/email', {
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

            const data = await response.json();

            if (response.ok) {
                showMessage('Email cambiata correttamente! Reindirizzamento...', 'success');
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

export {};

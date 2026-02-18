const token = localStorage.getItem('token');

// 1. Protezione pagina: se non c'è token, redirect al login
if (!token) {
    window.location.href = '/';
}

// 2. Recupera il profilo utente dal backend
async function caricaProfilo(): Promise<void> {
    try {
        const response = await fetch('/api/homepage/profilo', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        // Token scaduto o non valido: pulizia e redirect
        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const utente = data.utente;

        // 3. Popola il nome di benvenuto
        const welcomeNome = document.getElementById('welcome-nome');
        if (welcomeNome) {
            welcomeNome.textContent = utente.nome;
        }

    } catch (error) {
        console.error('Errore caricamento profilo:', error);
        window.location.href = '/';
    }
}

// 4. Gestione logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
        } catch (error) {
            console.error('Errore logout:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    });
}

// 5. Gestione click Dashboard → chiama il backend per ottenere l'URL corretto
const dashboardLink = document.getElementById('dashboard-link');
if (dashboardLink) {
    dashboardLink.addEventListener('click', async (e: Event) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/homepage/dashboard', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }

            const data = await response.json();
            window.location.href = data.dashboardUrl;

        } catch (error) {
            console.error('Errore apertura dashboard:', error);
        }
    });
}

caricaProfilo();

export {};

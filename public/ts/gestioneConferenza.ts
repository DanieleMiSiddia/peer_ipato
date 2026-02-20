const token = localStorage.getItem('token');

// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}

// 2. Legge l'id_conferenza dal parametro URL
const params = new URLSearchParams(window.location.search);
const id_conferenza = params.get('id');

if (!id_conferenza) {
    window.location.href = '/pages/dashboard/DashboardChair.html';
}

// 3. Carica il nome della conferenza dall'API e popola il titolo
async function caricaConferenza(): Promise<void> {
    try {
        const response = await fetch(`/api/dashboard-chair/conferenze/${id_conferenza}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
        }

        if (!response.ok) {
            window.location.href = '/pages/dashboard/DashboardChair.html';
            return;
        }

        const data = await response.json();
        const conferenza = data.conferenza;

        const titleEl = document.getElementById('dynamic-conf-id') as HTMLElement;
        if (titleEl) {
            titleEl.textContent = conferenza.nome;
        }

    } catch (error) {
        console.error('Errore caricamento conferenza:', error);
        window.location.href = '/pages/dashboard/DashboardChair.html';
    }
}

caricaConferenza();

// Navigazione card "Inserisci Chair"
const cardInserisciChair = document.getElementById('card-inserisci-chair');
if (cardInserisciChair && id_conferenza) {
    cardInserisciChair.addEventListener('click', () => {
        window.location.href = `/pages/AggiungiCoChair.html?id=${id_conferenza}`;
    });
}

// Navigazione card "Inserisci Membro PC"
const cardInserisciMembro = document.getElementById('card-inserisci-membro');
if (cardInserisciMembro && id_conferenza) {
    cardInserisciMembro.addEventListener('click', () => {
        window.location.href = `/pages/AggiungiMembroPC.html?id=${id_conferenza}`;
    });
}

export {};

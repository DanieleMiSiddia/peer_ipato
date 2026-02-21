const token = localStorage.getItem('token');

// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}

interface ArticoloDaPubblicare {
    id_articolo: string;
    titolo: string;
    media_voti: number;
    nome_conferenza: string;
}

// 2. Carica profilo e popola header
async function caricaProfilo(): Promise<void> {
    try {
        const response = await fetch('/api/dashboard-editore/profilo', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const headerUser = document.getElementById('header-user');
        if (headerUser) {
            headerUser.textContent = data.utente.nome + ' ' + data.utente.cognome;
        }
    } catch (error) {
        console.error('Errore profilo:', error);
    }
}

// 3. Carica articoli
async function loadArticoli(): Promise<void> {
    const container = document.getElementById('articles-list-container') as HTMLElement;
    const mainUI = document.getElementById('list-main-ui') as HTMLElement;
    const emptyUI = document.getElementById('empty-state') as HTMLElement;

    try {
        const response = await fetch('/api/dashboard-editore/gestione-pubblicazioni', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            console.error('Errore caricamento articoli da pubblicare');
            return;
        }

        const data = await response.json();
        const articoli: ArticoloDaPubblicare[] = data.articoli;

        if (articoli.length === 0) {
            mainUI.style.display = 'none';
            emptyUI.style.display = 'block';
            return;
        }

        container.innerHTML = '';
        articoli.forEach(art => {
            const row = document.createElement('div');
            row.className = 'article-row';
            row.innerHTML = `
                <div class="article-info">
                    <h3>${art.titolo}</h3>
                    <p>${art.nome_conferenza} - ID: ${art.id_articolo}</p>
                </div>
                <div class="votes-media">${art.media_voti.toFixed(2)}</div>
                <div class="actions">
                    <button class="btn btn-secondary btn-revisioni">
                        <svg class="icon" viewBox="0 0 24 24">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                        Lista revisioni
                    </button>
                    <button class="btn btn-primary btn-pubblica">
                        <svg class="icon" viewBox="0 0 24 24">
                            <path d="M5 4v2h14V4H5zm0 10h4v6h6v-6h4l-7-7-7 7z" />
                        </svg>
                        Pubblica
                    </button>
                </div>
            `;

            // Handler per i bottoni
            const btnRevisioni = row.querySelector('.btn-revisioni') as HTMLButtonElement;
            const btnPubblica = row.querySelector('.btn-pubblica') as HTMLButtonElement;

            btnRevisioni.addEventListener('click', () => {
                window.location.href = `/pages/ListaRevisioni.html?id=${art.id_articolo}`;
            });

            btnPubblica.addEventListener('click', () => {
                window.location.href = `/pages/PubblicazioneArticolo.html?id=${art.id_articolo}`;
            });

            container.appendChild(row);
        });

    } catch (error) {
        console.error('Errore loadArticoli:', error);
    }
}

// Inizializza
document.addEventListener('DOMContentLoaded', () => {
    caricaProfilo();
    loadArticoli();
});

export { };

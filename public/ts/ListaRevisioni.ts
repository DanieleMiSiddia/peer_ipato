const token = localStorage.getItem('token');

// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}

const urlParams = new URLSearchParams(window.location.search);
const idArticolo = urlParams.get('id');

if (!idArticolo) {
    window.location.href = '/pages/dashboard/DashboardEditore.html';
}

interface Revisione {
    id_review: string;
    voto_competenza: number;
    valutazione: number;
    commento: string;
    id_revisore: string;
    nome_revisore: string;
    cognome_revisore: string;
}

// 2. Carica profilo
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

// 3. Carica revisioni
async function loadRevisioni(): Promise<void> {
    const container = document.getElementById('revisions-list-container') as HTMLElement;
    const mainUI = document.getElementById('list-main-ui') as HTMLElement;
    const emptyUI = document.getElementById('empty-state') as HTMLElement;

    try {
        const response = await fetch(`/api/dashboard-editore/articoli/${idArticolo}/revisioni`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            console.error('Errore caricamento revisioni');
            return;
        }

        const data = await response.json();
        const revisioni: Revisione[] = data.revisioni;

        if (revisioni.length === 0) {
            mainUI.style.display = 'none';
            emptyUI.style.display = 'block';
            return;
        }

        container.innerHTML = '';
        revisioni.forEach((rev, index) => {
            const row = document.createElement('div');
            row.className = 'revision-row';

            // Determina classe voto
            let voteClass = 'vote-neu';
            if (rev.valutazione >= 7) voteClass = 'vote-pos';
            else if (rev.valutazione <= 4) voteClass = 'vote-neg';

            row.innerHTML = `
                <div class="revision-info">
                    <h3>Revisione ${index + 1}</h3>
                    <p>REVISORE: ${rev.nome_revisore} ${rev.cognome_revisore}</p>
                </div>
                <div class="col-center">
                    <div class="vote-circle ${voteClass}">${rev.valutazione}</div>
                </div>
                <div class="col-center">
                    <div class="vote-circle vote-neu">${rev.voto_competenza}</div>
                </div>
                <div class="actions">
                    <button class="btn-visualizza">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Visualizza
                    </button>
                </div>
            `;

            // Handler visualizza commento
            const btnVisualizza = row.querySelector('.btn-visualizza') as HTMLButtonElement;
            btnVisualizza.addEventListener('click', () => {
                const overlay = document.getElementById('comment-overlay') as HTMLElement;
                const commentText = document.getElementById('comment-text') as HTMLElement;
                commentText.textContent = rev.commento;
                overlay.style.display = 'flex';
            });

            container.appendChild(row);
        });

    } catch (error) {
        console.error('Errore loadRevisioni:', error);
    }
}

// 4. Modal management
document.getElementById('close-overlay')?.addEventListener('click', () => {
    (document.getElementById('comment-overlay') as HTMLElement).style.display = 'none';
});

window.addEventListener('click', (e) => {
    const overlay = document.getElementById('comment-overlay');
    if (overlay && e.target === overlay) {
        overlay.style.display = 'none';
    }
});

// Inizializza
document.addEventListener('DOMContentLoaded', () => {
    caricaProfilo();
    loadRevisioni();

    // Mostra ID articolo nel sottotitolo se disponibile
    const idLabel = document.getElementById('articolo-id-label');
    if (idLabel && idArticolo) {
        idLabel.textContent = `Revisioni per l'articolo ID: ${idArticolo}`;
    }
});

export { };

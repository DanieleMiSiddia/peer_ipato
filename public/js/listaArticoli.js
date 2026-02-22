var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const token = localStorage.getItem('token');
// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}
// 3. Formatta lo stato in etichetta leggibile + classe badge
function getStatoBadge(stato) {
    switch (stato) {
        case 'SOTTOMESSO': return { label: 'Sottomesso', classe: 'badge-yellow' };
        case 'IN_REVISIONE_F': return { label: 'In Revisione', classe: 'badge-blue' };
        case 'SOTTOMESSO_F': return { label: 'In Revisione', classe: 'badge-blue' };
        case 'ACCETTATO': return { label: 'Accettato', classe: 'badge-green' };
        case 'RIFIUTATO': return { label: 'Rifiutato', classe: 'badge-red' };
        default: return { label: stato, classe: 'badge-yellow' };
    }
}
// 4. Carica profilo e popola il nome nell'header
function caricaProfilo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/api/homepage/profilo', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
            const data = yield response.json();
            const headerUser = document.getElementById('header-user');
            if (headerUser) {
                headerUser.textContent = data.utente.nome + ' ' + data.utente.cognome;
            }
        }
        catch (error) {
            console.error('Errore profilo:', error);
            window.location.href = '/';
        }
    });
}
// 5. Carica e renderizza gli articoli sottomessi dall'autore
function loadArticoli() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById('articles-rows-container');
        const mainUI = document.getElementById('list-main-ui');
        const emptyUI = document.getElementById('empty-state');
        const countLabel = document.getElementById('art-count');
        try {
            const response = yield fetch('/api/articolo/miei', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
            const data = yield response.json();
            const articoli = data.articoli;
            if (articoli.length === 0) {
                mainUI.style.display = 'none';
                emptyUI.style.display = 'block';
                return;
            }
            container.innerHTML = '';
            articoli.forEach((art) => {
                const { label, classe } = getStatoBadge(art.stato);
                const row = document.createElement('div');
                row.className = 'article-row';
                row.innerHTML = `
                <div class="article-info">
                    <h3>${art.titolo}</h3>
                    <p>${art.id_articolo} &bull; ${art.topic}</p>
                </div>
                <div class="conf-name">${art.id_conferenza}</div>
                <div><span class="badge ${classe}">${label}</span></div>
                <div class="actions">
                    <button class="icon-btn delete" title="Elimina">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                </div>
            `;
                const deleteBtn = row.querySelector('.icon-btn.delete');
                deleteBtn.addEventListener('click', () => eliminaArticolo(art.id_articolo, row, countLabel));
                container.appendChild(row);
            });
            countLabel.textContent = `${articoli.length} ARTICOLI`;
        }
        catch (error) {
            console.error('Errore loadArticoli:', error);
        }
    });
}
// 6. Elimina un articolo e rimuove la riga dalla lista
function eliminaArticolo(id_articolo, row, countLabel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm('Sei sicuro di voler eliminare questo articolo?'))
            return;
        try {
            const response = yield fetch(`/api/articolo/${id_articolo}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!response.ok) {
                alert('Impossibile eliminare l\'articolo.');
                return;
            }
            row.remove();
            const container = document.getElementById('articles-rows-container');
            const mainUI = document.getElementById('list-main-ui');
            const emptyUI = document.getElementById('empty-state');
            const righeRimaste = container.querySelectorAll('.article-row').length;
            if (righeRimaste === 0) {
                mainUI.style.display = 'none';
                emptyUI.style.display = 'block';
            }
            else {
                countLabel.textContent = `${righeRimaste} ARTICOLI`;
            }
        }
        catch (error) {
            console.error('Errore eliminazione:', error);
            alert('Errore di rete. Riprova.');
        }
    });
}
document.getElementById('btn-torna-indietro')
    .addEventListener('click', () => { window.location.href = '/pages/dashboard/DashboardAutore.html'; });
caricaProfilo();
loadArticoli();
export {};
//# sourceMappingURL=listaArticoli.js.map
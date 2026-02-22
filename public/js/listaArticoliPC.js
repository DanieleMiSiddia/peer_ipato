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
// 2. Legge l'id conferenza dai parametri URL
const params = new URLSearchParams(window.location.search);
const idConferenza = params.get('id');
if (!idConferenza) {
    window.location.href = '/pages/dashboard/DashboardMembroPC.html';
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
            console.error('Errore caricamento profilo:', error);
            window.location.href = '/';
        }
    });
}
// 5. Carica e renderizza gli articoli della conferenza
function loadArticoli() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById('articles-container');
        const body = document.getElementById('articles-body');
        const emptyState = document.getElementById('empty-state');
        try {
            const response = yield fetch(`/api/dashboard-membro-pc/conferenze/${idConferenza}/articoli`, {
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
                container.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }
            container.style.display = 'block';
            emptyState.style.display = 'none';
            body.innerHTML = '';
            articoli.forEach((art) => {
                const row = document.createElement('div');
                row.className = 'table-row article-body-row';
                row.innerHTML = `
                <div class="col-title article-title-cell">
                    <h3>${art.titolo}</h3>
                    <span class="article-id">ID: ${art.id_articolo}</span>
                </div>
                <div class="col-stato">
                    <span class="stato-text">${art.stato}</span>
                </div>
                <div class="col-actions">
                    <button class="btn btn-assign">Assegna Sottorevisore</button>
                    <button class="btn btn-review">Revisiona</button>
                </div>
            `;
                body.appendChild(row);
            });
        }
        catch (error) {
            console.error('Errore caricamento articoli:', error);
        }
    });
}
// 6. Torna alla DashboardMembroPC
const btnTorna = document.getElementById('btn-torna-indietro');
if (btnTorna) {
    btnTorna.addEventListener('click', () => {
        window.location.href = '/pages/dashboard/DashboardMembroPC.html';
    });
}
caricaProfilo();
loadArticoli();
export {};
//# sourceMappingURL=listaArticoliPC.js.map
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
// 1. Protezione pagina: se non c'è token, redirect al login
if (!token) {
    window.location.href = '/';
}
// 3. Formatta una data ISO in "GG/MM/AAAA"
function formatData(iso) {
    const d = new Date(iso);
    const gg = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const aa = d.getFullYear();
    return `${gg}/${mm}/${aa}`;
}
// 4. Carica profilo e popola il nome nell'header
function caricaProfiloDashboard() {
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
// 5. Chiama l'API e genera le righe della tabella
function loadConferenze() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById('conference-rows-container');
        const mainUI = document.getElementById('list-main-ui');
        const emptyUI = document.getElementById('empty-state');
        const countLabel = document.getElementById('conf-count');
        try {
            // Endpoint che restituisce le conferenze in stato "Fase Sottomissione"
            const response = yield fetch('/api/dashboard-autore/conferenze', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
            const data = yield response.json();
            const conferenze = data.conferenze;
            if (conferenze.length === 0) {
                mainUI.style.display = 'none';
                emptyUI.style.display = 'block';
                return;
            }
            container.innerHTML = '';
            conferenze.forEach((conf) => {
                const row = document.createElement('div');
                row.className = 'conf-row';
                row.innerHTML = `
                <div class="conf-info">
                    <h3>${conf.nome}</h3>
                    <p>${conf.id_conferenza}</p>
                </div>
                <div class="conf-info"><p>${conf.topic}</p></div>
                <div class="scadenza">${formatData(conf.data_fine_sottomissione)}</div>
                <div class="actions">
                    <button class="btn btn-primary">Sottometti Articolo</button>
                </div>
            `;
                // Collega il bottone alla pagina di sottomissione
                const btnSottometti = row.querySelector('.btn-primary');
                btnSottometti.addEventListener('click', () => {
                    window.location.href = '/pages/SottomissioneArticolo.html?id=' + conf.id_conferenza;
                });
                container.appendChild(row);
            });
            countLabel.innerText = `${conferenze.length} CONFERENZE`;
        }
        catch (error) {
            console.error('Errore caricamento conferenze:', error);
        }
    });
}
// 6. Bottone Lista Articoli Sottomessi
const btnListaArticoli = document.getElementById('btn-lista-articoli');
if (btnListaArticoli) {
    btnListaArticoli.addEventListener('click', () => {
        window.location.href = '/pages/ListaArticoliSottomessi.html';
    });
}
// 7. Gestione logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
        }
        catch (error) {
            console.error('Errore logout:', error);
        }
        finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    }));
}
caricaProfiloDashboard();
loadConferenze();
export {};
//# sourceMappingURL=dashboardAutore.js.map
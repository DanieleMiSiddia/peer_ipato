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
function loadArticoli() {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById('articoli-rows-container');
        const mainUI = document.getElementById('list-main-ui');
        const emptyUI = document.getElementById('empty-state');
        const countLabel = document.getElementById('art-count');
        try {
            const response = yield fetch('/api/dashboard-revisore/articoli-assegnati', {
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
                const badgeClass = art.sorgente === 'Offerta' ? 'badge-blue' : 'badge-purple';
                const row = document.createElement('div');
                row.className = 'art-row';
                row.innerHTML = `
                <div class="art-info">
                    <h3>${art.titolo}</h3>
                    <p>${art.id_articolo}</p>
                </div>
                <div class="scadenza">${formatData(art.data_scadenza)}</div>
                <div><span class="badge ${badgeClass}">${art.sorgente}</span></div>
                <div class="actions">
                    <button class="btn btn-primary">Scrivi Revisione</button>
                </div>
            `;
                container.appendChild(row);
            });
            countLabel.innerText = `${articoli.length} ARTICOLI`;
        }
        catch (error) {
            console.error('Errore caricamento articoli:', error);
        }
    });
}
// 6. Navigazione a "Dashboard Membro PC"
const btnMembroPC = document.getElementById('btn-dashboard-membro-pc');
if (btnMembroPC) {
    btnMembroPC.addEventListener('click', () => {
        window.location.href = '/pages/dashboard/DashboardMembroPC.html';
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
loadArticoli();
export {};
//# sourceMappingURL=dashboardRevisore.js.map
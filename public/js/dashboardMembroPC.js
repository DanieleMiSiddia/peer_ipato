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
        const container = document.getElementById('conferenze-rows-container');
        const mainUI = document.getElementById('list-main-ui');
        const emptyUI = document.getElementById('empty-state');
        const countLabel = document.getElementById('conf-count');
        try {
            const response = yield fetch('/api/dashboard-membro-pc/conferenze', {
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
                row.className = 'data-row';
                row.style.gridTemplateColumns = '2.5fr 1.5fr 1.3fr';
                row.innerHTML = `
                <div class="row-info">
                    <h3>${conf.nome}</h3>
                    <p>${conf.id_conferenza}</p>
                </div>
                <div class="scadenza">${formatData(conf.data_fine_revisione)}</div>
                <div class="actions">
                    <button class="btn btn-primary">Visualizza Articoli</button>
                </div>
            `;
                const btnVisualizza = row.querySelector('.btn-primary');
                btnVisualizza.addEventListener('click', () => {
                    window.location.href = '/pages/ListaArticoliPC.html?id=' + conf.id_conferenza;
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
// 6. Torna alla Dashboard Revisore
const btnTornaRevisore = document.getElementById('btn-torna-revisore');
if (btnTornaRevisore) {
    btnTornaRevisore.addEventListener('click', () => {
        window.location.href = '/pages/dashboard/DashboardRevisore.html';
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
//# sourceMappingURL=dashboardMembroPC.js.map
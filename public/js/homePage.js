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
// 2. Recupera il profilo utente dal backend
function caricaProfilo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/api/homepage/profilo', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            // Token scaduto o non valido: pulizia e redirect
            if (!response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
            const data = yield response.json();
            const utente = data.utente;
            // 3. Popola il nome di benvenuto
            const welcomeNome = document.getElementById('welcome-nome');
            if (welcomeNome) {
                welcomeNome.textContent = utente.nome;
            }
        }
        catch (error) {
            console.error('Errore caricamento profilo:', error);
            window.location.href = '/';
        }
    });
}
// 4. Gestione logout
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
// 5. Gestione click Dashboard → chiama il backend per ottenere l'URL corretto
const dashboardLink = document.getElementById('dashboard-link');
if (dashboardLink) {
    dashboardLink.addEventListener('click', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        try {
            const response = yield fetch('/api/homepage/dashboard', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
            const data = yield response.json();
            window.location.href = data.dashboardUrl;
        }
        catch (error) {
            console.error('Errore apertura dashboard:', error);
        }
    }));
}
caricaProfilo();
export {};
//# sourceMappingURL=homePage.js.map
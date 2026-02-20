const token = localStorage.getItem('token');
// 1. Protezione pagina
if (!token) {
    window.location.href = '/';
}
// 2. Mappa ruolo DB → etichetta leggibile
const ROLE_MAP = {
    'chair':    'Chair',
    'autore':   'Autore',
    'revisore': 'Revisore',
    'editore':  'Editore'
};
// 3. Carica e popola il profilo dall'API
async function caricaProfilo() {
    var _a;
    try {
        const response = await fetch('/api/dashboard-chair/profilo', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
        }
        const data = await response.json();
        const utente = data.utente;
        const roleLabel = (_a = ROLE_MAP[utente.role]) !== null && _a !== void 0 ? _a : utente.role;
        document.getElementById('display-name').innerText = `${utente.nome} ${utente.cognome}`;
        document.getElementById('display-role').innerText = roleLabel;
        document.getElementById('val-nome').innerText = utente.nome;
        document.getElementById('val-cognome').innerText = utente.cognome;
        document.getElementById('val-email').innerText = utente.email;
        document.getElementById('val-ruolo-full').innerText = roleLabel;
        const skillsContainer = document.getElementById('val-skills');
        skillsContainer.innerHTML = '';
        if (utente.competenza) {
            const span = document.createElement('span');
            span.className = 'skill-tag';
            span.innerText = utente.competenza;
            skillsContainer.appendChild(span);
        }
        else {
            skillsContainer.innerText = '—';
        }
    }
    catch (error) {
        console.error('Errore caricamento profilo:', error);
        window.location.href = '/';
    }
}
caricaProfilo();
// 4. Navigazione pulsanti
document.getElementById('btn-modifica-password').addEventListener('click', function () {
    window.location.href = '/pages/ModificaPassword.html';
});
document.getElementById('btn-modifica-email').addEventListener('click', function () {
    window.location.href = '/pages/ModificaEmail.html';
});
export {};
//# sourceMappingURL=datiProfilo.js.map

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
// --- STATE ---
let selectedTopics = [];
let currentInputId = null;
let calendarDate = new Date();
const months = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];
// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderTopics();
    setupCalendar();
    setupValidation();
    setupAnnulla();
    setupSuccessClose();
});
// --- ANNULLA ---
function setupAnnulla() {
    const btn = document.getElementById('btn-annulla');
    if (btn) {
        btn.addEventListener('click', () => {
            window.location.href = '/pages/dashboard/DashboardChair.html';
        });
    }
}
// --- SUCCESS CLOSE ---
function setupSuccessClose() {
    const btn = document.getElementById('btn-success-close');
    if (btn) {
        btn.addEventListener('click', () => {
            window.location.href = '/pages/dashboard/DashboardChair.html';
        });
    }
}
// --- TOPICS ---
function renderTopics() {
    const box = document.getElementById('topics-box');
    const input = document.getElementById('topic-input');
    box.querySelectorAll('.badge').forEach(b => b.remove());
    selectedTopics.forEach(t => {
        const b = document.createElement('div');
        b.className = 'badge';
        b.innerHTML = `${t} <span>×</span>`;
        const x = b.querySelector('span');
        x.addEventListener('click', () => removeTopic(t));
        box.insertBefore(b, input);
    });
}
function removeTopic(t) {
    selectedTopics = selectedTopics.filter(item => item !== t);
    renderTopics();
}
// --- VALIDATION ---
function setupValidation() {
    const emailInput = document.getElementById('editore-email');
    const numInput = document.getElementById('articoli-stima');
    const topicInput = document.getElementById('topic-input');
    const submitBtn = document.getElementById('submit-crea');
    emailInput.addEventListener('blur', () => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        emailInput.classList.toggle('error-input', !regex.test(emailInput.value));
    });
    numInput.addEventListener('input', () => {
        numInput.value = numInput.value.replace(/[^0-9]/g, '');
    });
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && topicInput.value.trim()) {
            e.preventDefault();
            selectedTopics.push(topicInput.value.trim());
            topicInput.value = '';
            renderTopics();
        }
    });
    submitBtn.addEventListener('click', validateAndSubmit);
}
// --- DATE HELPERS ---
function parseDate(str) {
    if (!str)
        return null;
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
}
// Converte dd/mm/yyyy → yyyy-mm-dd (formato atteso dall'API)
function parseDateToISO(str) {
    const [d, m, y] = str.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}
function validateDates() {
    const s_start = parseDate(document.getElementById('sott-inizio').value);
    const s_end = parseDate(document.getElementById('sott-fine').value);
    const r_start = parseDate(document.getElementById('rev-inizio').value);
    const r_end = parseDate(document.getElementById('rev-fine').value);
    const c_start = parseDate(document.getElementById('conf-inizio').value);
    const c_end = parseDate(document.getElementById('conf-fine').value);
    if (s_start && s_end && s_end < s_start)
        return showErr("La data di fine sottomissione non può essere precedente all'inizio.");
    if (s_end && r_start && r_start < s_end)
        return showErr("La revisione non può iniziare prima della fine della sottomissione.");
    if (r_start && r_end && r_end < r_start)
        return showErr("La data di fine revisione non può essere precedente all'inizio.");
    if (r_end && c_start && c_start < r_end)
        return showErr("La conferenza non può iniziare prima del termine della revisione.");
    if (c_start && c_end && c_end < c_start)
        return showErr("La data di fine conferenza non può essere precedente all'inizio.");
    document.getElementById('error-alert').style.display = 'none';
    return true;
}
function showErr(t) {
    const alertEl = document.getElementById('error-alert');
    document.getElementById('error-msg').innerText = t;
    alertEl.style.display = 'flex';
    return false;
}
// --- CALENDAR ---
function setupCalendar() {
    const popup = document.getElementById('calendar-popup');
    document.querySelectorAll('.date-trigger').forEach(input => {
        input.addEventListener('click', (e) => {
            const target = e.target;
            currentInputId = target.id;
            const rect = target.getBoundingClientRect();
            popup.style.top = (rect.bottom + window.scrollY) + 'px';
            popup.style.left = rect.left + 'px';
            popup.style.display = 'block';
            renderCalendar();
        });
    });
    document.getElementById('cal-prev').onclick = () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar();
    };
    document.getElementById('cal-next').onclick = () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar();
    };
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!target.closest('.date-trigger') && !target.closest('#calendar-popup')) {
            popup.style.display = 'none';
        }
    });
}
function renderCalendar() {
    const body = document.getElementById('cal-days-body');
    const head = document.getElementById('cal-month-year');
    body.innerHTML = '';
    head.innerText = `${months[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`;
    const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
    const startShift = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < startShift; i++) {
        body.appendChild(document.createElement('div'));
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const el = document.createElement('div');
        el.className = 'cal-day';
        el.innerText = String(d);
        el.onclick = () => {
            const formatted = `${d.toString().padStart(2, '0')}/${(calendarDate.getMonth() + 1).toString().padStart(2, '0')}/${calendarDate.getFullYear()}`;
            document.getElementById(currentInputId).value = formatted;
            document.getElementById('calendar-popup').style.display = 'none';
            validateDates();
        };
        body.appendChild(el);
    }
}
// --- SUBMIT ---
function validateAndSubmit() {
    return __awaiter(this, void 0, void 0, function* () {
        const nome = document.getElementById('conf-name').value.trim();
        const email = document.getElementById('editore-email').value.trim();
        const stima = document.getElementById('articoli-stima').value.trim();
        const sottInizio = document.getElementById('sott-inizio').value;
        const sottFine = document.getElementById('sott-fine').value;
        const revInizio = document.getElementById('rev-inizio').value;
        const revFine = document.getElementById('rev-fine').value;
        const confInizio = document.getElementById('conf-inizio').value;
        const confFine = document.getElementById('conf-fine').value;
        // Auto-aggiungi topic se l'utente ha scritto senza premere Invio
        const topicInputEl = document.getElementById('topic-input');
        if (topicInputEl.value.trim()) {
            selectedTopics.push(topicInputEl.value.trim());
            topicInputEl.value = '';
            renderTopics();
        }
        // Validazione campi obbligatori con messaggi specifici
        if (!nome)
            return void showErr('Il campo "Nome Conferenza" è obbligatorio.');
        if (!email)
            return void showErr('Il campo "Email Editore" è obbligatorio.');
        if (!stima)
            return void showErr('Il campo "Numero Articoli Stimati" è obbligatorio.');
        if (selectedTopics.length === 0)
            return void showErr('Aggiungi almeno un topic alla conferenza.');
        if (!sottInizio || !sottFine)
            return void showErr('Compila le date della Fase Sottomissione.');
        if (!revInizio || !revFine)
            return void showErr('Compila le date della Fase Revisione.');
        if (!confInizio || !confFine)
            return void showErr('Compila le date dei Giorni Conferenza.');
        if (!validateDates())
            return;
        try {
            const response = yield fetch('/api/dashboard-chair/conferenze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    nome,
                    topic: selectedTopics.join(', '),
                    numero_articoli: stima,
                    editore_email: email,
                    data_inizio_sottomissione: parseDateToISO(sottInizio),
                    data_fine_sottomissione: parseDateToISO(sottFine),
                    data_inizio_revisione: parseDateToISO(revInizio),
                    data_fine_revisione: parseDateToISO(revFine),
                    data_inizio_conferenza: parseDateToISO(confInizio),
                    data_fine_conferenza: parseDateToISO(confFine)
                })
            });
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
            const data = yield response.json();
            if (!response.ok) {
                showErr(data.message || 'Errore durante la creazione della conferenza.');
                return;
            }
            // Mostra overlay di successo
            document.getElementById('success-details').innerHTML =
                `<strong>${nome}</strong><br>ID: ${data.id_conferenza}<br><br>La conferenza è stata configurata correttamente.`;
            document.getElementById('success-overlay').style.display = 'flex';
        }
        catch (error) {
            console.error('Errore creazione conferenza:', error);
            showErr('Errore di rete. Riprova più tardi.');
        }
    });
}
export {};
//# sourceMappingURL=creaNuovaConferenza.js.map
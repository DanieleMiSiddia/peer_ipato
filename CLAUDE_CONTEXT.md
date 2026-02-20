# CLAUDE_CONTEXT — Peer-ipato

> File di contesto per sessioni future. Aggiornare ad ogni aggiunta significativa.
> Ultimo aggiornamento: 2026-02-20 (pattern form standardizzato)

---

## 1. IDENTITÀ PROGETTO

- **Nome:** Peer-ipato (peer review + partecipato)
- **Scopo:** Sistema gestione conferenze accademiche con peer review
- **Stack:** Express.js v5 + TypeScript (backend) · TypeScript→JS statico (frontend) · MySQL
- **Porta:** 3000
- **DB schema:** `sistemone`
- **Avvio dev:** `npm run dev` (nodemon + ts-node)
- **Build:** `npm run build` (tsc backend + tsc frontend)

---

## 2. STRUTTURA DIRECTORY

```
peer_ipato/
├── src/                            # Backend TypeScript
│   ├── app.ts                      # Entry point Express
│   ├── config/database.ts          # Pool MySQL (variabili da .env)
│   ├── controllers/
│   │   ├── authController.ts       # register, login, logout
│   │   ├── homePageController.ts   # getDashboard, getHomePage
│   │   ├── modController.ts        # changePassword, changeEmail
│   │   └── dashboardChairController.ts
│   ├── middlewares/authMiddleware.ts  # verificaToken (JWT + logout check)
│   ├── models/
│   │   ├── utente.model.ts
│   │   └── conferenza.model.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── homePageRoutes.ts
│   │   ├── modRoutes.ts
│   │   └── dashboardChairRoutes.ts
│   ├── utils/generateId.ts         # UUID troncato (length param)
│   └── database/schema.sql         # Schema MySQL completo
│
└── public/                         # Frontend (file statici serviti da Express)
    ├── pages/
    │   ├── auth.html               # Login (pagina root /)
    │   ├── Registrazione.html
    │   ├── HomePageUtente.html     # Hub post-login (sidebar: Dashboard, Profilo, Logout)
    │   ├── datiProfilo.html        # Profilo utente
    │   ├── GestioneConferenza.html # Pannello gestione singola conferenza
    │   ├── AggiungiCoChair.html    # Form aggiunta co-chair
    │   ├── AggiungiMembroPC.html   # Form aggiunta membro PC
    │   ├── ModificaPassword.html   # Form modifica password (usa formAggiungi.css)
    │   ├── ModificaEmail.html      # [da implementare]
    │   └── dashboard/
    │       ├── DashboardChair.html
    │       ├── DashboardAutore.html     # shell vuota
    │       ├── DashboardRevisore.html   # shell vuota
    │       ├── DashboardEditore.html    # shell vuota
    │       └── CreaNuovaConferenza.html
    ├── ts/   # Sorgenti TypeScript frontend
    ├── js/   # JS compilati (output, usati dal browser)
    ├── css/
    │   ├── formAggiungi.css        # CSS condiviso: AggiungiCoChair, AggiungiMembroPC, ModificaPassword
    │   └── ...                     # un file CSS per ogni altra pagina
    └── images/ # Logo.jpeg, Sfondo.jpeg
```

---

## 3. DATABASE — schema `sistemone`

### Ereditarietà utente (tabella-per-tipo)
```
utente (id_utente CHAR(5), nome, cognome, email, password, role, competenza, ultimo_logout)
  ├── autore       (id_utente FK)
  ├── revisore     (id_utente FK, preferenza)
  ├── chair        (id_utente FK)
  └── editore      (id_utente FK)

NOTA: membro_pc NON è un ruolo utente. È una relazione conferenza↔revisore (vedi tabelle associative).
```

### Tabelle principali
```
conferenza   (id_conferenza CHAR(6), nome, topic, numero_articoli,
              data_inizio/fine_conferenza, data_inizio/fine_revisione,
              data_inizio/fine_sottomissione, id_chair FK, id_editore FK)

articolo     (id_articolo CHAR(10), titolo, stato, topic, documento LONGBLOB,
              media_voti DECIMAL(4,2), id_autore FK, id_conferenza FK)
              stati: SOTTOMESSO | IN_REVISIONE_F | SOTTOMESSO_F | ACCETTATO | RIFIUTATO

revisione    (id_review CHAR(6), voto_competenza, valutazione 0-10,
              commento, commento_chair, stato_review, id_revisore FK, id_articolo FK)

notifiche    (id_notifica AUTO_INCREMENT, tipo_notifica, data_notifica, id_utente FK)
```

### Tabelle associative
```
co_chair       (id_conferenza, id_chair)              PK composta
membro_pc      (id_conferenza, id_revisore)            PK composta — revisore nel PC
e_assegnato    (id_revisore, id_articolo, metodo_assegnazione)
               metodi: AUTOMATICO_KEYWORDS | MANUALE | BIDDING | COMPETENZA
gestisce       (id_revisore, id_review, motivo)
pubblicazione  (codice_pubblicazione, id_articolo, id_editore)
offerta        (id_articolo, id_revisore, data_scadenza)
```

---

## 4. API ENDPOINTS

```
POST   /api/auth/register
POST   /api/auth/login                          → { token, user: {id, nome, role} }
POST   /api/auth/logout                [JWT]

GET    /api/homepage/profilo           [JWT]    → { utente }
GET    /api/homepage/dashboard         [JWT]    → { dashboardUrl }

PUT    /api/utente/modificaPassword     [JWT]   body:{vecchia_password, nuova_password}
PUT    /api/utente/email               [JWT]   body:{nuova_email}

GET    /api/dashboard-chair/profilo              [JWT] → { utente }
GET    /api/dashboard-chair/conferenze           [JWT] → { conferenze: [{id, nome, stato}] }
GET    /api/dashboard-chair/conferenze/:id       [JWT] → { conferenza }
POST   /api/dashboard-chair/conferenze           [JWT] → crea conferenza
POST   /api/dashboard-chair/conferenze/:id/co-chair  [JWT] body:{email} → aggiunge co-chair
POST   /api/dashboard-chair/conferenze/:id/membro-pc [JWT] body:{email} → aggiunge membro PC
```

---

## 5. AUTENTICAZIONE

- **JWT** in `localStorage` (key: `token`), scadenza 2h
- **Middleware `verificaToken`:** legge `Authorization: Bearer <token>`, verifica firma e `iat > ultimo_logout` nel DB
- **Logout server-side:** salva `ultimo_logout = NOW()` → invalida tutti i token precedenti
- `req.user` → `{ id_utente: string, role: string }`

---

## 6. MODELLI — funzioni disponibili

### `utente.model.ts`
| Funzione | Input | Output |
|---|---|---|
| `findByEmail` | email | Utente (con password) o null |
| `findById` | id_utente | UtenteSicuro (senza password) o null |
| `findRoleById` | id_utente | string (role) o null |
| `findRoleByEmail` | email | `{id_utente, role}` o null |
| `findPasswordById` | id_utente | string (hash) o null |
| `findEmailById` | id_utente | string (email) o null |
| `create` | Utente | void |
| `createWithSpecialization` | Utente | void (transazione atomica utente + tabella ruolo) |
| `updatePassword` | id_utente, password | void |
| `updateEmail` | id_utente, email | void |
| `logout` | id_utente | void (setta ultimo_logout = NOW()) |

### `conferenza.model.ts`
| Funzione | Input | Output |
|---|---|---|
| `create` | Conferenza | void |
| `addCoChair` | id_conferenza, id_chair | void (INSERT in co_chair, ER_DUP_ENTRY se esiste) |
| `addMembroPC` | id_conferenza, id_revisore | void (INSERT in membro_pc, ER_DUP_ENTRY se esiste) |
| `findByIdForChair` | id_conferenza, id_utente | Conferenza o null (con check chair/co-chair) |
| `findConferenzeByChair` | id_utente | Conferenza[] (chair principale + co-chair) |

---

## 7. FRONTEND — convenzioni

- Ogni pagina ha: `<nome>.html` + `/css/<nome>.css` + `/ts/<nome>.ts` + `/js/<nome>.js`
- **Eccezione CSS condiviso:** `AggiungiCoChair.html`, `AggiungiMembroPC.html` e `ModificaPassword.html` usano `/css/formAggiungi.css`
- JS compilati con `__awaiter` (TypeScript target ES5/ES2015)
- Token JWT in `localStorage`: key `token`, key `user` (JSON)
- Protezione pagina: `if (!token) window.location.href = '/'` in cima a ogni script
- Redirect 401: rimuovi token/user → redirect a `/`

### Pattern form — OBBLIGATORIO per tutti i nuovi form

> Riferimento canonico: `Registrazione.html` / `registrazione.js`

#### HTML
- **Nessun elemento di errore pre-scritto nel markup.** Non usare `<p class="error-text">` né altri placeholder per-campo.
- **Nessun `<div id="success-toast">`** né altri overlay fissi.
- Il banner di feedback viene creato dinamicamente dal JS all'interno del `<form>`.

#### JS — funzioni obbligatorie

```javascript
const showMessage = (text, type) => {
    let msgDiv = document.getElementById('form-message');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'form-message';
        form.insertBefore(msgDiv, form.firstChild);  // appare in cima al form
    }
    msgDiv.textContent = text;
    msgDiv.className = `form-message ${type}`;  // 'form-message error' | 'form-message success'
};

const clearMessage = () => {
    const msgDiv = document.getElementById('form-message');
    if (msgDiv) msgDiv.remove();
};
```

- **Errore** → `showMessage('testo errore', 'error')`
- **Successo** → `showMessage('testo successo', 'success')` + `setTimeout(() => redirect, 1500)`
- **Inizio submit** → sempre `clearMessage()` come prima operazione
- **Nessun `form.reset()`** prima del redirect (inutile dato che si lascia la pagina)

#### CSS — classi richieste in ogni foglio di stile che usa form

```css
.form-message { padding: 10px 15px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; margin-bottom: 15px; text-align: center; }
.form-message.error   { background-color: #fde8e8; color: #b91c1c; border: 1px solid #f3b5b5; }
.form-message.success { background-color: #e8f5e9; color: #1b5e20; border: 1px solid #a5d6a7; }
```

> Per i form che usano `formAggiungi.css` queste classi sono già incluse.

### Pattern autorizzazione nei controller (insertCoChair, insertMembroPC)
1. `findByIdForChair` → verifica che il chiamante sia chair/co-chair → 403 se no
2. `findRoleByEmail` → verifica esistenza utente → 404 se non trovato
3. check `role` → 400 se ruolo errato
4. INSERT → ER_DUP_ENTRY → 409 se duplicato

### Flusso navigazione
```
/ (auth.html)
  → login → localStorage.token
  → HomePageUtente.html
      → click Dashboard → GET /api/homepage/dashboard → redirect per ruolo
      → click Profilo   → /pages/datiProfilo.html

DashboardChair.html
  → click "Gestisci Conferenza" → /pages/GestioneConferenza.html?id=<id_conferenza>
  → click "Crea Conferenza"     → /pages/dashboard/CreaNuovaConferenza.html
  → click "Profilo"             → /pages/datiProfilo.html

GestioneConferenza.html
  → legge id da URLSearchParams
  → GET /api/dashboard-chair/conferenze/:id
  → card "Inserisci Chair"     → /pages/AggiungiCoChair.html?id=<id_conferenza>
  → card "Inserisci membro PC" → /pages/AggiungiMembroPC.html?id=<id_conferenza>
  → card "Visualizza Articoli" → [da implementare]

AggiungiCoChair.html / AggiungiMembroPC.html
  → legge id da URLSearchParams
  → POST /api/dashboard-chair/conferenze/:id/co-chair | membro-pc
  → errore  → banner rosso inline (showMessage error)
  → successo → banner verde inline + redirect a GestioneConferenza dopo 1500ms
  → "Annulla" → torna a GestioneConferenza.html?id=<id_conferenza>

datiProfilo.html
  → "Torna Indietro" → /pages/HomePageUtente.html
  → "Modifica Password" → /pages/ModificaPassword.html
  → "Modifica E-mail"   → /pages/ModificaEmail.html [da implementare]

ModificaPassword.html
  → PUT /api/utente/modificaPassword  body:{vecchia_password, nuova_password}
  → errore client (< 6 chars, mismatch) → banner rosso inline
  → 401 (vecchia errata) → banner rosso inline
  → 400 (uguale alla precedente) → banner rosso inline con data.message
  → 200 → banner verde inline + redirect a datiProfilo dopo 1500ms
  → "Annulla" → /pages/datiProfilo.html
```

---

## 8. STATO IMPLEMENTAZIONE

| Funzionalità | Stato |
|---|---|
| Auth register/login/logout | ✅ |
| Modifica password (pagina dedicata) | ✅ |
| Modifica email (pagina dedicata) | ⬜ da implementare |
| HomePage + routing dashboard per ruolo | ✅ |
| Pagina Profilo (datiProfilo) | ✅ |
| Dashboard Chair — lista conferenze | ✅ |
| Crea Nuova Conferenza | ✅ |
| Gestione Conferenza (pannello) | ✅ frontend, ✅ backend base |
| Inserimento Co-chair | ✅ completo (model+controller+route+frontend) |
| Inserimento membro PC | ✅ completo (model+controller+route+frontend) |
| Dashboard Autore | ⬜ shell HTML |
| Dashboard Revisore | ⬜ shell HTML |
| Dashboard Editore | ⬜ shell HTML |
| Gestione articoli | ⬜ |
| Sistema revisioni | ⬜ |
| Notifiche | ⬜ |

---

## 9. CONVENZIONI CODICE

- **ID generazione:** `generateId(n)` → UUID troncato a n caratteri
- **Ruoli validi:** `autore | revisore | chair | editore`
- **membro_pc** non è un ruolo utente: è una relazione `(id_conferenza, id_revisore)` nella tabella `membro_pc`
- **Stato conferenza** (calcolato lato server):
  - `oggi <= data_fine_sottomissione` → `Fase Sottomissione`
  - `oggi <= data_fine_revisione` → `Fase Revisione`
  - altrimenti → `Fase Pubblicazione`
- **Errori MySQL:** `ER_DUP_ENTRY` (code 1062) gestito esplicitamente nel controller
- **Params Express 5:** usare `req.params.x as string` per evitare errore `string | string[]`
- **Approccio sviluppo:** bottom-up (model → controller → route → frontend)
- **Regola sessione:** procedere per step, chiedere approvazione prima di andare oltre il frontend

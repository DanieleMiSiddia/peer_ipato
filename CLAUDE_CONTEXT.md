# CLAUDE_CONTEXT — Peer-ipato

> File di contesto per sessioni future. Aggiornare ad ogni aggiunta significativa.
> Ultimo aggiornamento: 2026-02-21 (DashboardAutore + SottomissioneArticolo completati)

---

## 1. IDENTITA' PROGETTO

- **Nome:** Peer-ipato (peer review + partecipato)
- **Scopo:** Sistema gestione conferenze accademiche con peer review
- **Stack:** Express.js v5 + TypeScript (backend) · TypeScript→JS statico (frontend) · MySQL (XAMPP)
- **Porta:** 3000
- **DB schema:** `sistemone`
- **Avvio dev:** `npm run dev` (nodemon + ts-node)
- **Build:** `npm run build` (tsc backend + tsc frontend)
- **MySQL:** XAMPP — `my.ini` in `C:\xampp\mysql\bin\my.ini`
  - `max_allowed_packet=64M` (necessario per upload PDF tramite LONGBLOB)

---

## 2. STRUTTURA DIRECTORY

```
peer_ipato/
|-- src/                            # Backend TypeScript
|   |-- app.ts                      # Entry point Express
|   |-- config/database.ts          # Pool MySQL (variabili da .env)
|   |-- controllers/
|   |   |-- authController.ts                  # register, login, logout
|   |   |-- homePageController.ts              # getDashboard, getHomePage
|   |   |-- modController.ts                   # modificaPassword, changeEmail
|   |   |-- dashboardChairController.ts
|   |   |-- dashboardRevisoreController.ts     # getProfilo, getArticoliAssegnati, getRevisioniByRevisore, createRevisione
|   |   |-- dashboardMembroPCController.ts     # getProfilo, getConferenzeInRevisione, visualizzaArticoli
|   |   |-- dashboardAutoreController.ts       # getProfilo, getConferenzeSottomissione
|   |   `-- articoloController.ts              # upload (multer), sottomettiArticolo
|   |-- middlewares/authMiddleware.ts  # verificaToken (JWT + logout check)
|   |-- models/
|   |   |-- utente.model.ts
|   |   |-- conferenza.model.ts
|   |   |-- revisione.model.ts
|   |   `-- articolo.model.ts
|   |-- routes/
|   |   |-- authRoutes.ts
|   |   |-- homePageRoutes.ts
|   |   |-- modRoutes.ts
|   |   |-- dashboardChairRoutes.ts
|   |   |-- dashboardRevisoreRoutes.ts
|   |   |-- dashboardMembroPCRoutes.ts
|   |   |-- dashboardAutoreRoutes.ts
|   |   `-- articoloRoutes.ts
|   |-- utils/generateId.ts         # UUID troncato (length param)
|   `-- database/schema.sql         # Schema MySQL completo
|
`-- public/                         # Frontend (file statici serviti da Express)
    |-- pages/
    |   |-- auth.html               # Login (pagina root /)
    |   |-- Registrazione.html
    |   |-- HomePageUtente.html     # Hub post-login (sidebar: Dashboard, Profilo, Logout)
    |   |-- datiProfilo.html        # Profilo utente
    |   |-- GestioneConferenza.html # Pannello gestione singola conferenza
    |   |-- AggiungiCoChair.html    # Form aggiunta co-chair
    |   |-- AggiungiMembroPC.html   # Form aggiunta membro PC
    |   |-- ModificaPassword.html   # Form modifica password (usa formAggiungi.css)
    |   |-- ModificaEmail.html      # Form modifica email (usa formAggiungi.css)
    |   |-- ListaArticoliPC.html    # Lista articoli conferenza per membro PC
    |   |-- SottomissioneArticolo.html  # Form sottomissione articolo (con upload PDF)
    |   `-- dashboard/
    |       |-- DashboardChair.html
    |       |-- DashboardAutore.html     # completa
    |       |-- DashboardRevisore.html   # completa
    |       |-- DashboardMembroPC.html   # completa
    |       |-- DashboardEditore.html    # shell vuota
    |       `-- CreaNuovaConferenza.html
    |-- ts/   # Sorgenti TypeScript frontend
    |-- js/   # JS compilati (output, usati dal browser)
    |-- css/
    |   |-- dashboard.css           # CSS unico condiviso da tutte le dashboard
    |   |-- formAggiungi.css        # CSS condiviso: AggiungiCoChair, AggiungiMembroPC, ModificaPassword, ModificaEmail
    |   |-- listaArticoliPC.css     # CSS per ListaArticoliPC.html
    |   |-- sottomissioneArticolo.css   # CSS per SottomissioneArticolo.html
    |   `-- ...                     # un file CSS per ogni altra pagina
    `-- images/ # Logo.jpeg, Sfondo.jpeg
```

---

## 3. DATABASE — schema `sistemone`

### Ereditarieta' utente (tabella-per-tipo)
```
utente (id_utente CHAR(5), nome, cognome, email, password, role, competenza, ultimo_logout)
  |-- autore       (id_utente FK)
  |-- revisore     (id_utente FK, preferenza)
  |-- chair        (id_utente FK)
  `-- editore      (id_utente FK)

NOTA: membro_pc NON e' un ruolo utente. E' una relazione conferenza<-->revisore (vedi tabelle associative).
```

### Tabelle principali
```
conferenza   (id_conferenza CHAR(6), nome, topic, numero_articoli,
              data_inizio/fine_conferenza, data_inizio/fine_revisione,
              data_inizio/fine_sottomissione, id_chair FK, id_editore FK)

articolo     (id_articolo CHAR(8), titolo, stato, topic, documento LONGBLOB,
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
POST   /api/auth/login                          --> { token, user: {id, nome, role} }
POST   /api/auth/logout                [JWT]

GET    /api/homepage/profilo           [JWT]    --> { utente }
GET    /api/homepage/dashboard         [JWT]    --> { dashboardUrl }

PUT    /api/utente/modificaPassword    [JWT]    body:{vecchia_password, nuova_password}
PUT    /api/utente/email               [JWT]    body:{nuova_email}

GET    /api/dashboard-chair/profilo                      [JWT] --> { utente }
GET    /api/dashboard-chair/conferenze                   [JWT] --> { conferenze: [{id, nome, stato}] }
GET    /api/dashboard-chair/conferenze/:id               [JWT] --> { conferenza }
POST   /api/dashboard-chair/conferenze                   [JWT] --> crea conferenza
POST   /api/dashboard-chair/conferenze/:id/co-chair      [JWT] body:{email} --> aggiunge co-chair
POST   /api/dashboard-chair/conferenze/:id/membro-pc     [JWT] body:{email} --> aggiunge membro PC

GET    /api/dashboard-revisore/profilo                   [JWT] --> { utente }
GET    /api/dashboard-revisore/articoli-assegnati        [JWT] --> { articoli: ArticoloAssegnato[] }
GET    /api/dashboard-revisore/revisioni                 [JWT] --> { revisioni } [TODO]

GET    /api/dashboard-membro-pc/profilo                  [JWT] --> { utente }
GET    /api/dashboard-membro-pc/conferenze               [JWT] --> { conferenze: [{id_conferenza, nome, data_fine_revisione}] }
GET    /api/dashboard-membro-pc/conferenze/:id/articoli  [JWT] --> { articoli: ArticoloSenzaDocumento[] }

GET    /api/dashboard-autore/profilo                     [JWT] --> { utente }
GET    /api/dashboard-autore/conferenze                  [JWT] --> { conferenze: [{id_conferenza, nome, data_fine_sottomissione, topic}] }
       (solo conferenze in fase sottomissione, escluse quelle dove l'autore ha gia' sottomesso)

POST   /api/articolo                             [JWT] multipart/form-data --> sottometti articolo
       body: { titolo, topic, id_conferenza, documento (PDF, max 16MB) }
       --> { message, id_articolo }
```

---

## 5. AUTENTICAZIONE

- **JWT** in `localStorage` (key: `token`), scadenza 2h
- **Middleware `verificaToken`:** legge `Authorization: Bearer <token>`, verifica firma e `iat > ultimo_logout` nel DB
- **Logout server-side:** salva `ultimo_logout = NOW()` --> invalida tutti i token precedenti
- `req.user` --> `{ id_utente: string, role: string }`

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

### `articolo.model.ts`
| Funzione | Input | Output |
|---|---|---|
| `create` | `Omit<Articolo, 'media_voti' \| 'stato'>` | void — stato fisso `SOTTOMESSO`, media_voti NULL |
| `findByConferenza` | id_conferenza | `ArticoloSenzaDocumento[]` (senza LONGBLOB) |
| `findIdConferenzaByIdAutore` | id_autore | `string[]` — id conferenze dove l'autore ha gia' sottomesso |
| `getDocumentoById` | id_articolo | `Buffer \| null` — solo il LONGBLOB |
| `updateStatoAccettato` | id_articolo | `boolean` (false = non trovato) |
| `deleteById` | id_articolo | `boolean` (false = non trovato) |

**Interfacce:**
```typescript
Articolo: { id_articolo, titolo, stato, topic, documento: Buffer, media_voti, id_autore, id_conferenza }
ArticoloSenzaDocumento: Omit<Articolo, 'documento'>
```

### `revisione.model.ts`
| Funzione | Input | Output |
|---|---|---|
| `findRevisioniByRevisore` | id_revisore | `(Revisione & { titolo_articolo })[]` |
| `findById` | id_review | Revisione o null |
| `findArticoliAssegnati` | id_revisore | `ArticoloAssegnato[]` — via `e_assegnato`, scadenza = `data_fine_revisione` conferenza |
| `findArticoliDaOfferta` | id_revisore | `ArticoloAssegnato[]` — via `offerta`, scadenza = `offerta.data_scadenza` |
| `create` | Revisione | void |

**Interfaccia `ArticoloAssegnato`:**
```typescript
{ id_articolo, titolo, stato, topic, media_voti, id_conferenza, id_autore,
  metodo_assegnazione, data_scadenza: Date, sorgente: 'Assegnazione' | 'Offerta' }
```

### `conferenza.model.ts`
| Funzione | Input | Output |
|---|---|---|
| `create` | Conferenza | void |
| `addCoChair` | id_conferenza, id_chair | void (INSERT in co_chair, ER_DUP_ENTRY se esiste) |
| `addMembroPC` | id_conferenza, id_revisore | void (INSERT in membro_pc, ER_DUP_ENTRY se esiste) |
| `findByIdForChair` | id_conferenza, id_utente | Conferenza o null (con check chair/co-chair) |
| `findConferenze` | — | Conferenza[] (tutte le conferenze nel DB, senza filtri) |
| `findConferenzeByChair` | id_utente | Conferenza[] (chair principale + co-chair) |
| `findConferenzeByMembroPC` | id_revisore | Conferenza[] (tutte le conferenze PC del revisore) |

---

## 7. FRONTEND — convenzioni

- Ogni pagina ha: `<nome>.html` + `/ts/<nome>.ts` + `/js/<nome>.js`
- **CSS dashboard:** tutte le dashboard usano `/css/dashboard.css` (unico file condiviso)
- **CSS form:** `AggiungiCoChair`, `AggiungiMembroPC`, `ModificaPassword`, `ModificaEmail` usano `/css/formAggiungi.css`
- **CSS pagine contenuto** (ListaArticoliPC, SottomissioneArticolo, GestioneConferenza, ...): file CSS dedicato per pagina
- Token JWT in `localStorage`: key `token`, key `user` (JSON)
- Protezione pagina: `if (!token) window.location.href = '/'` in cima a ogni script
- Redirect 401: rimuovi token/user --> redirect a `/`

### CRITICO — tag script nelle pagine HTML
- I file `.js` compilati da TypeScript contengono `export {}` --> **devono** essere caricati con `<script type="module">`
- **SEMPRE** usare `<script type="module" src="/js/nome.js"></script>`
- Senza `type="module"` il browser lancia un errore di sintassi e lo script non viene eseguito

### Pattern form — OBBLIGATORIO per tutti i nuovi form

> Riferimento canonico: `Registrazione.html` / `registrazione.js`

#### HTML
- **Nessun elemento di errore pre-scritto nel markup.** Non usare `<p class="error-text">` ne' altri placeholder per-campo.
- **Nessun `<div id="success-toast">`** ne' altri overlay fissi.
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

- **Errore** --> `showMessage('testo errore', 'error')`
- **Successo** --> `showMessage('testo successo', 'success')` + `setTimeout(() => redirect, 1500)`
- **Inizio submit** --> sempre `clearMessage()` come prima operazione
- **Nessun `form.reset()`** prima del redirect (inutile dato che si lascia la pagina)

#### CSS — classi richieste in ogni foglio di stile che usa form

```css
.form-message { padding: 10px 15px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; margin-bottom: 15px; text-align: center; }
.form-message.error   { background-color: #fde8e8; color: #b91c1c; border: 1px solid #f3b5b5; }
.form-message.success { background-color: #e8f5e9; color: #1b5e20; border: 1px solid #a5d6a7; }
```

> Per i form che usano `formAggiungi.css` queste classi sono gia' incluse.

### Pattern dashboard (Chair, Revisore, MembroPC, Autore, ...)

> Riferimento canonico: `DashboardChair.html` / `dashboardChair.ts`
> CSS unico: `/css/dashboard.css`

- Struttura: header fisso + sidebar sinistra (250px) + area contenuto scrollabile
- Sidebar: voci nav con icona SVG, `active` sulla voce corrente, logout in fondo come `<button id="logout-btn" class="logout-btn">`
- Tabella dati: `.list-container` > `.list-title-bar` > `.table-head` > righe generate via JS
- Stato vuoto: `#empty-state` con `display:none` di default, mostrato via JS se array vuoto
- Caricamento profilo header: `GET /api/homepage/profilo` --> `data.utente.nome + ' ' + data.utente.cognome`
- Colonne tabella: default 4 col (`2.2fr 1fr 1fr 1.3fr`); per layout diversi sovrascrivere `grid-template-columns` con `style` inline su `.table-head` e sulle righe generate
- Classi riga: `.conf-row` (Chair, Autore), `.art-row` (Revisore), `.data-row` (MembroPC e future)
- Badge: `badge-purple` = Assegnazione/Chair, `badge-blue` = Offerta, `badge-green` = disponibile
- Pulsante header (es. "Crea Conferenza", "Lista Articoli Sottomessi"): classe `btn-crea`

### Pattern pagine contenuto (ListaArticoliPC, SottomissioneArticolo, GestioneConferenza, ...)

> Riferimento canonico: `ListaArticoliPC.html` / `listaArticoliPC.css`

- Layout: header fisso (no sidebar) + `<main>` centrato con `.container` max-width 1100px
- Tabella: struttura flex (`.table-row`) con colonne `.col-title`, `.col-stato`, `.col-actions`
- Pulsante "Torna Indietro" nel `.page-header-top` con classe `.btn-back`
- CSS dedicato per pagina (no file condiviso)

### Pattern upload file (SottomissioneArticolo)

- **Multer** con `memoryStorage` --> `req.file.buffer` e' il Buffer pronto per LONGBLOB
- **FormData** lato client: NON impostare `Content-Type` manualmente (il browser aggiunge il boundary)
- **Doppio invio prevenuto:** disabilitare il pulsante Conferma durante la chiamata API
- **Feedback errore visivo:** mostrare `#submit-error-msg` con il messaggio del server in caso di errore
- **max_allowed_packet MySQL:** deve essere >= dimensione file + overhead codifica hex (~2x il file)
  - Configurato a 64M in `C:\xampp\mysql\bin\my.ini`

### Pattern autorizzazione nei controller (insertCoChair, insertMembroPC)
1. `findByIdForChair` --> verifica che il chiamante sia chair/co-chair --> 403 se no
2. `findRoleByEmail` --> verifica esistenza utente --> 404 se non trovato
3. check `role` --> 400 se ruolo errato
4. INSERT --> ER_DUP_ENTRY --> 409 se duplicato

### Flusso navigazione
```
/ (auth.html)
  --> login --> localStorage.token
  --> HomePageUtente.html
      --> click Dashboard --> GET /api/homepage/dashboard --> redirect per ruolo
      --> click Profilo   --> /pages/datiProfilo.html

DashboardChair.html
  --> click "Gestisci Conferenza" --> /pages/GestioneConferenza.html?id=<id_conferenza>
  --> click "Crea Conferenza"     --> /pages/dashboard/CreaNuovaConferenza.html
  --> click "Profilo"             --> /pages/datiProfilo.html

DashboardRevisore.html
  --> carica GET /api/dashboard-revisore/articoli-assegnati --> lista articoli
  --> click "Dashboard Membro PC" --> /pages/dashboard/DashboardMembroPC.html
  --> click "Scrivi Revisione"    --> [da implementare]
  --> click "Profilo"             --> /pages/datiProfilo.html

DashboardMembroPC.html
  --> carica GET /api/dashboard-membro-pc/conferenze --> lista conferenze in fase revisione
  --> click "Visualizza Articoli" --> /pages/ListaArticoliPC.html?id=<id_conferenza>
  --> click "Dashboard Revisore"  --> /pages/dashboard/DashboardRevisore.html
  --> click "Profilo"             --> /pages/datiProfilo.html

DashboardAutore.html
  --> carica GET /api/dashboard-autore/conferenze
      (conferenze in fase sottomissione, escluse quelle gia' frequentate dall'autore)
  --> click "Sottometti Articolo" --> /pages/SottomissioneArticolo.html?id=<id_conferenza>
  --> click "Lista Articoli Sottomessi" --> /pages/ListaArticoliSottomessi.html [da implementare]
  --> click "Profilo"             --> /pages/datiProfilo.html

SottomissioneArticolo.html
  --> legge id_conferenza da URLSearchParams
  --> compila titolo + topic + carica PDF (max 16MB)
  --> POST /api/articolo (FormData multipart)
  --> successo --> toast + redirect a DashboardAutore dopo 3s (o subito con "OK")
  --> errore   --> messaggio visibile (#submit-error-msg)
  --> "Annulla" --> /pages/dashboard/DashboardAutore.html

ListaArticoliPC.html
  --> legge id da URLSearchParams
  --> GET /api/dashboard-membro-pc/conferenze/:id/articoli --> lista articoli
  --> click "Assegna Sottorevisore" --> [da implementare]
  --> click "Revisiona"             --> [da implementare]
  --> click "Torna Indietro"        --> /pages/dashboard/DashboardMembroPC.html

GestioneConferenza.html
  --> legge id da URLSearchParams
  --> GET /api/dashboard-chair/conferenze/:id
  --> card "Inserisci Chair"     --> /pages/AggiungiCoChair.html?id=<id_conferenza>
  --> card "Inserisci membro PC" --> /pages/AggiungiMembroPC.html?id=<id_conferenza>
  --> card "Visualizza Articoli" --> [da implementare]

AggiungiCoChair.html / AggiungiMembroPC.html
  --> legge id da URLSearchParams
  --> POST /api/dashboard-chair/conferenze/:id/co-chair | membro-pc
  --> errore  --> banner rosso inline (showMessage error)
  --> successo --> banner verde inline + redirect a GestioneConferenza dopo 1500ms
  --> "Annulla" --> torna a GestioneConferenza.html?id=<id_conferenza>

datiProfilo.html
  --> "Torna Indietro" --> /pages/HomePageUtente.html
  --> "Modifica Password" --> /pages/ModificaPassword.html
  --> "Modifica E-mail"   --> /pages/ModificaEmail.html

ModificaPassword.html
  --> PUT /api/utente/modificaPassword  body:{vecchia_password, nuova_password}
  --> errore client (< 6 chars, mismatch) --> banner rosso inline
  --> 401 (vecchia errata) --> banner rosso inline
  --> 400 (uguale alla precedente) --> banner rosso inline con data.message
  --> 200 --> banner verde inline + redirect a datiProfilo dopo 1500ms
  --> "Annulla" --> /pages/datiProfilo.html

ModificaEmail.html
  --> PUT /api/utente/email  body:{nuova_email}
  --> errore client (regex email) --> banner rosso inline
  --> 400 (uguale alla precedente) --> banner rosso inline con data.message
  --> 409 (gia' in uso) --> banner rosso inline con data.message
  --> 200 --> banner verde inline + redirect a datiProfilo dopo 1500ms
  --> "Annulla" --> /pages/datiProfilo.html
```

---

## 8. STATO IMPLEMENTAZIONE

| Funzionalita' | Stato |
|---|---|
| Auth register/login/logout | OK |
| Modifica password (pagina dedicata) | OK |
| Modifica email (pagina dedicata) | OK |
| HomePage + routing dashboard per ruolo | OK |
| Pagina Profilo (datiProfilo) | OK |
| Dashboard Chair — lista conferenze | OK |
| Crea Nuova Conferenza | OK |
| Gestione Conferenza (pannello) | OK frontend, OK backend base |
| Inserimento Co-chair | OK completo (model+controller+route+frontend) |
| Inserimento membro PC | OK completo (model+controller+route+frontend) |
| Dashboard Revisore — articoli assegnati | OK completo (model+controller+route+frontend) |
| Dashboard Membro PC — conferenze in revisione | OK completo (model+controller+route+frontend) |
| Lista Articoli PC (visualizzazione per conferenza) | OK completo (model+controller+route+frontend) |
| Dashboard Autore — conferenze in sottomissione | OK completo (model+controller+route+frontend) |
| Sottomissione Articolo (upload PDF) | OK completo (model+controller+route+frontend) |
| Lista Articoli Sottomessi (autore) | da implementare |
| Dashboard Editore | shell HTML |
| Assegna Sottorevisore | bottone presente in ListaArticoliPC |
| Scrivi Revisione | bottone presente in DashboardRevisore e ListaArticoliPC |
| Revisioni del revisore (lista) | route presente, controller TODO |
| Notifiche | da implementare |

---

## 9. CONVENZIONI CODICE

- **ID generazione:** `generateId(n)` --> UUID troncato a n caratteri
  - Conferenze: 6 caratteri, Articoli: 8 caratteri
- **Ruoli validi:** `autore | revisore | chair | editore`
- **membro_pc** non e' un ruolo utente: e' una relazione `(id_conferenza, id_revisore)` nella tabella `membro_pc`
- **Stato conferenza** (calcolato lato server):
  - `oggi <= data_fine_sottomissione` --> `Fase Sottomissione`
  - `oggi <= data_fine_revisione` --> `Fase Revisione`
  - altrimenti --> `Fase Pubblicazione`
- **Filtro fase** (controller): `new Date(c.data_inizio_X) <= oggi && oggi <= new Date(c.data_fine_X)` — logica nel controller, non nel model
- **LONGBLOB (documento articolo):** mai incluso nelle query di lista; recuperato solo esplicitamente con `getDocumentoById`
- **Errori MySQL:** `ER_DUP_ENTRY` (code 1062) gestito esplicitamente nel controller
- **Params Express 5:** usare `req.params.x as string` per evitare errore `string | string[]`
- **Approccio sviluppo:** bottom-up (model --> controller --> route --> frontend)
- **Articoli assegnati al revisore:** due sorgenti — `e_assegnato` (scadenza = `data_fine_revisione` della conferenza) e `offerta` (scadenza = `offerta.data_scadenza`); unificati con `Promise.all` nel controller
- **Upload file:** multer `memoryStorage` --> `req.file.buffer` direttamente in LONGBLOB; limite 16MB lato app, 64MB lato MySQL
- **FormData invio:** NON impostare `Content-Type` manualmente, il browser gestisce il boundary multipart automaticamente

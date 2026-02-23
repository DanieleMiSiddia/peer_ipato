# CLAUDE_CONTEXT — Peer-ipato

> File di contesto per sessioni future. Aggiornare ad ogni aggiunta significativa.
> Ultimo aggiornamento: 2026-02-22 — progetto completato, script test_data.sql pronto

---

## 1. IDENTITA' PROGETTO

- **Nome:** Peer-ipato (peer review + partecipato)
- **Scopo:** Sistema gestione conferenze accademiche con peer review
- **Stack backend:** Express.js v5 + TypeScript · MySQL (XAMPP)
- **Stack frontend:** Angular + Ionic (standalone components, lazy loading)
- **Porta backend:** 3000
- **DB schema:** `sistemone`
- **Avvio backend:** `npm run dev` (nodemon + ts-node) nella root `peer_ipato/`
- **Avvio frontend:** `ionic serve` nella cartella `peer_ipato/frontend/`
- **Build backend:** `npm run build` (tsc → `dist/`)
- **MySQL:** XAMPP — `my.ini` in `C:\xampp\mysql\bin\my.ini`
  - `max_allowed_packet=64M` (necessario per upload PDF tramite LONGBLOB)

---

## 2. STRUTTURA DIRECTORY

```
peer_ipato/
├── src/                            # Backend TypeScript
│   ├── app.ts                      # Entry point Express — registra tutte le route
│   ├── config/database.ts          # Pool MySQL (variabili da .env)
│   ├── controllers/
│   │   ├── authController.ts               # register, login, logout
│   │   ├── homePageController.ts           # getDashboard, getHomePage
│   │   ├── modController.ts                # modificaPassword, changeEmail
│   │   ├── articoloController.ts           # upload (multer), sottomettiArticolo
│   │   ├── dashboardChairController.ts
│   │   ├── dashboardEditoreController.ts
│   │   ├── dashboardMembroPCController.ts
│   │   ├── dashboardRevisoreController.ts
│   │   └── dashboardAutoreController.ts
│   ├── middlewares/authMiddleware.ts        # verificaToken (JWT + logout check)
│   ├── models/
│   │   ├── utente.model.ts
│   │   ├── conferenza.model.ts
│   │   ├── articolo.model.ts
│   │   ├── revisione.model.ts
│   │   └── pubblicazione.model.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── homePageRoutes.ts
│   │   ├── modRoutes.ts
│   │   ├── articoloRoutes.ts
│   │   ├── dashboardChairRoutes.ts
│   │   ├── dashboardEditoreRoutes.ts
│   │   ├── dashboardMembroPCRoutes.ts
│   │   ├── dashboardRevisoreRoutes.ts
│   │   └── dashboardAutoreRoutes.ts
│   ├── utils/generateId.ts                 # generateId(n) → stringa alfanumerica di n caratteri
│   └── database/
│       ├── schema.sql                      # Schema MySQL completo (DROP + CREATE)
│       └── test_data.sql                   # Dati di test (16 utenti, 4 conf, 20 articoli...)
│
├── dist/                           # Backend compilato (output tsc, non modificare)
│
├── public/                         # Frontend HTML statico LEGACY (non più in uso attivo)
│   ├── pages/                      # Pagine HTML del vecchio frontend
│   ├── ts/                         # Sorgenti TypeScript del vecchio frontend
│   ├── js/                         # JS compilati del vecchio frontend
│   └── css/                        # CSS del vecchio frontend
│
├── frontend/                       # Frontend Angular + Ionic (ATTIVO)
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.routes.ts               # Lazy loading di tutte le pagine
│   │   │   ├── pages/                      # Componenti standalone (una cartella per pagina)
│   │   │   │   ├── auth/
│   │   │   │   ├── registrazione/
│   │   │   │   ├── home-utente/
│   │   │   │   ├── profilo/
│   │   │   │   ├── modifica-email/
│   │   │   │   ├── modifica-password/
│   │   │   │   ├── dashboard-chair/
│   │   │   │   ├── crea-conferenza/
│   │   │   │   ├── gestione-conferenza/
│   │   │   │   ├── aggiungi-co-chair/
│   │   │   │   ├── aggiungi-membro-pc/
│   │   │   │   ├── lista-articoli-pubblicati/
│   │   │   │   ├── dashboard-autore/
│   │   │   │   ├── sottomissione-articolo/
│   │   │   │   ├── lista-articoli-sottomessi/
│   │   │   │   ├── dashboard-revisore/
│   │   │   │   ├── scheda-revisione/
│   │   │   │   ├── dashboard-membro-pc/
│   │   │   │   ├── lista-articoli-pc/
│   │   │   │   ├── assegna-sotto-revisore/
│   │   │   │   ├── dashboard-editore/
│   │   │   │   ├── lista-articoli-editore/
│   │   │   │   └── visualizza-revisioni/
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── user.service.ts
│   │   │       ├── articolo.service.ts
│   │   │       ├── dashboard-chair.service.ts
│   │   │       ├── dashboard-editore.service.ts
│   │   │       ├── dashboard-membro-pc.service.ts
│   │   │       ├── dashboard-revisore.service.ts
│   │   │       └── dashboard-autore.service.ts
│   │   ├── assets/Logo.jpeg
│   │   └── environments/environment.ts     # baseUrl API
│   └── www/                        # Build Angular compilata (output ionic build)
│
├── .env                            # Variabili d'ambiente (NON committare)
├── .env.example                    # Template variabili d'ambiente
├── package.json                    # Dipendenze backend
└── tsconfig.json                   # Config TypeScript backend
```

---

## 3. DATABASE — schema `sistemone`

### Ereditarietà utente (tabella-per-tipo)
```
utente (id_utente CHAR(5), nome, cognome, email, password, role, competenza VARCHAR(20), ultimo_logout)
  ├── autore   (id_utente FK)
  ├── revisore (id_utente FK, preferenza VARCHAR(20))
  ├── chair    (id_utente FK)
  └── editore  (id_utente FK)

NOTA: membro_pc NON è un ruolo utente. È una relazione conferenza↔revisore.
```

### Tabelle principali
```
conferenza   (id_conferenza CHAR(6), nome VARCHAR(100), topic VARCHAR(90), numero_articoli SMALLINT,
              data_inizio/fine_conferenza, data_inizio/fine_revisione,
              data_inizio/fine_sottomissione, id_chair FK, id_editore FK)

articolo     (id_articolo CHAR(10), titolo VARCHAR(200), stato VARCHAR(20), topic VARCHAR(90),
              data_decisione DATE, documento LONGBLOB, id_autore FK,
              media_voti DECIMAL(4,2), id_conferenza FK)
              stati: SOTTOMESSO | IN_REVISIONE_F | SOTTOMESSO_F | ACCETTATO | RIFIUTATO

revisione    (id_review CHAR(6), voto_competenza SMALLINT, valutazione SMALLINT 0-10,
              commento VARCHAR(200), commento_chair VARCHAR(200),
              stato_review TINYINT, id_revisore FK, id_articolo FK)

pubblicazione (codice_pubblicazione CHAR(10), id_articolo CHAR(10) UNIQUE, id_editore FK)
```

### Tabelle associative
```
co_chair     (id_conferenza, id_chair)               PK composta
membro_pc    (id_conferenza, id_revisore)             PK composta
e_assegnato  (id_revisore, id_articolo, metodo_assegnazione)
             metodi: MANUALE | AUTOMATICO_KEYWORDS | BIDDING | COMPETENZA
             IMPORTANTE: usata SOLO per sotto-revisori, NON per membri PC
gestisce     (id_revisore, id_review, motivo)
offerta      (id_articolo, id_revisore, data_scadenza)
notifiche    (id_notifica AUTO_INCREMENT, tipo_notifica, data_notifica, id_utente FK)
```

### Fase conferenza (calcolata lato server/frontend)
```
CURDATE() <= data_fine_sottomissione  →  SOTTOMISSIONE
CURDATE() <= data_fine_revisione      →  REVISIONE
data_fine_conferenza >= CURDATE()     →  PUBBLICAZIONE
altrimenti                            →  TERMINATA
```

---

## 4. API ENDPOINTS

```
POST   /api/auth/register
POST   /api/auth/login                                          --> { token, user:{id,nome,role} }
POST   /api/auth/logout                              [JWT]

GET    /api/homepage/profilo                         [JWT]      --> { utente }
GET    /api/homepage/dashboard                       [JWT]      --> { dashboardUrl }

PUT    /api/utente/modificaPassword                  [JWT]      body:{vecchia_password, nuova_password}
PUT    /api/utente/email                             [JWT]      body:{nuova_email}

── CHAIR ──────────────────────────────────────────────────────
GET    /api/dashboard-chair/profilo                  [JWT]
GET    /api/dashboard-chair/conferenze               [JWT]      --> { conferenze }
GET    /api/dashboard-chair/conferenze/:id           [JWT]      --> { conferenza }
POST   /api/dashboard-chair/conferenze               [JWT]      body: Conferenza
POST   /api/dashboard-chair/conferenze/:id/co-chair  [JWT]      body:{email}
POST   /api/dashboard-chair/conferenze/:id/membro-pc [JWT]      body:{email}
GET    /api/dashboard-chair/conferenze/:id/articoli-pubblicati [JWT] --> { articoli }

── EDITORE ────────────────────────────────────────────────────
GET    /api/dashboard-editore/conferenze                           [JWT] --> { conferenze }
GET    /api/dashboard-editore/conferenze/:idConferenza/articoli    [JWT] --> { articoli }
GET    /api/dashboard-editore/articoli/:idArticolo/documento       [JWT] --> Buffer PDF
GET    /api/dashboard-editore/articoli/:idArticolo/revisioni       [JWT] --> { revisioni }
POST   /api/dashboard-editore/articoli/:idArticolo/pubblica        [JWT] --> 201 | 409 limite

── MEMBRO PC ──────────────────────────────────────────────────
GET    /api/dashboard-membro-pc/profilo                            [JWT]
GET    /api/dashboard-membro-pc/conferenze                         [JWT] --> { conferenze }
GET    /api/dashboard-membro-pc/conferenze/:id/articoli            [JWT] --> { articoli }
POST   /api/dashboard-membro-pc/conferenze/:idConferenza/articoli/:idArticolo/assegna-revisore
                                                                   [JWT] body:{email}

── REVISORE ───────────────────────────────────────────────────
GET    /api/dashboard-revisore/profilo                             [JWT]
GET    /api/dashboard-revisore/articoli-assegnati                  [JWT] --> { articoli }
POST   /api/dashboard-revisore/revisioni                           [JWT] body: Revisione

── AUTORE ─────────────────────────────────────────────────────
GET    /api/dashboard-autore/profilo                               [JWT]
GET    /api/dashboard-autore/conferenze                            [JWT] --> conferenze in sottomissione
GET    /api/dashboard-autore/articoli-sottomessi                   [JWT] --> { articoli }

POST   /api/articolo                                 [JWT] multipart/form-data
       body: { titolo, topic, id_conferenza, documento (PDF ≤16MB) }
```

---

## 5. AUTENTICAZIONE

- **JWT** in `localStorage` (key: `token`), scadenza 2h
- **Middleware `verificaToken`:** legge `Authorization: Bearer <token>`, verifica firma e `iat > ultimo_logout` nel DB
- **Logout server-side:** salva `ultimo_logout = NOW()` → invalida tutti i token precedenti
- `req.user` → `{ id_utente: string, role: string }`
- Frontend Angular: token letto con `localStorage.getItem('token') ?? ''` nel costruttore del componente

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
| `createWithSpecialization` | Utente | void (transazione atomica) |
| `updatePassword` | id_utente, password | void |
| `updateEmail` | id_utente, email | void |
| `logout` | id_utente | void |

### `articolo.model.ts`
| Funzione | Input | Output |
|---|---|---|
| `create` | Articolo | void |
| `findByConferenza` | id_conferenza | `ArticoloSenzaDocumento[]` |
| `findIdConferenzaByIdAutore` | id_autore | `string[]` |
| `findSottomessiByAutore` | id_autore | `ArticoloSenzaDocumento[]` |
| `getDocumentoById` | id_articolo | `Buffer \| null` |
| `findByConferenzaPerEditore` | id_conferenza | `ArticoloPerEditore[]` |

### `conferenza.model.ts`
| Funzione | Input | Output |
|---|---|---|
| `create` | Conferenza | void |
| `addCoChair` | id_conferenza, id_chair | void |
| `addMembroPC` | id_conferenza, id_revisore | void |
| `findByIdForChair` | id_conferenza, id_utente | Conferenza o null |
| `findConferenze` | — | Conferenza[] (tutte) |
| `findConferenzeByChair` | id_utente | Conferenza[] |
| `findConferenzeByMembroPC` | id_revisore | Conferenza[] |
| `findConferenzeByEditore` | id_editore | Conferenza[] |
| `getLimiteByArticolo` | id_articolo | number (numero_articoli della conferenza) |

### `revisione.model.ts`
| Funzione | Input | Output |
|---|---|---|
| `findRevisioniByRevisore` | id_revisore | `(Revisione & {titolo_articolo})[]` |
| `findArticoliAssegnati` | id_revisore | `ArticoloAssegnato[]` (via e_assegnato) |
| `findArticoliDaOfferta` | id_revisore | `ArticoloAssegnato[]` (via offerta) |
| `findByArticolo` | id_articolo | `RevisionePerEditore[]` |
| `create` | Revisione | void |
| `existsByRevisoreAndArticolo` | id_revisore, id_articolo | boolean |

### `pubblicazione.model.ts`
| Funzione | Input | Output |
|---|---|---|
| `isPubblicato` | id_articolo | boolean |
| `canEditoreAccessDocumento` | id_articolo, id_editore | boolean |
| `countByConferenza` | id_articolo | number (pubblicazioni già presenti nella conferenza) |
| `create` | codice, id_articolo, id_editore | void |
| `findPubblicatiByConferenza` | id_conferenza | `ArticoloPubblicato[]` |

---

## 7. FRONTEND ANGULAR/IONIC — convenzioni

### Struttura componente (standalone)
```typescript
@Component({
    selector: 'app-nome-pagina',
    templateUrl: './nome-pagina.page.html',
    styleUrls: ['./nome-pagina.page.scss'],
    standalone: true,
    imports: [CommonModule, IonContent, ...]
})
export class NomePaginaPage implements OnInit {
    private token = localStorage.getItem('token') ?? '';

    constructor(private router: Router, private route: ActivatedRoute, ...) {}

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }
        // leggi queryParams:
        const id = this.route.snapshot.queryParamMap.get('id') ?? '';
    }
}
```

### Navigazione con queryParams
```typescript
this.router.navigate(['/nome-pagina'], { queryParams: { id: 'CONF01' } });
```

### Pattern overlay conferma (es. pubblica, elimina)
```typescript
// Nel TS: stringa come toggle (vuota = overlay chiuso)
articoloDaPubblicare = '';
pubblica(id: string) { this.articoloDaPubblicare = id; }
annulla() { this.articoloDaPubblicare = ''; }
```
```html
<!-- Nel HTML: fuori da <main>, dentro <ion-content> -->
@if (articoloDaPubblicare) {
    <div class="overlay-backdrop">
        <div class="overlay-card">...</div>
    </div>
}
```

### Pattern download PDF (blob)
```typescript
this.service.downloadDocumento(this.token, idArticolo).subscribe({
    next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `articolo-${idArticolo}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    }
});
// Nel service: responseType: 'blob' as 'json' per evitare errori di tipo Angular
```

### Pattern service (HttpClient)
```typescript
@Injectable({ providedIn: 'root' })
export class NomeService {
    private base = environment.apiUrl;
    constructor(private http: HttpClient) {}

    getConferenze(token: string): Observable<{ conferenze: Conferenza[] }> {
        return this.http.get<{ conferenze: Conferenza[] }>(
            `${this.base}/dashboard-X/conferenze`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }
}
```

### Layout pagine
- **Header:** `.app-header` con logo + brand-name `Peer-<span>ipato</span>`
- **Main:** `.main-content` > `.container` (max-width 1000-1200px)
- **Tabella:** `.list-container` > `.list-title-bar` > `.table-head` > `.article-row` (grid)
- **Pulsante back:** `.btn-back` in `.page-header-top` (sfondo `#1B365D`)
- **Stato vuoto:** `.empty-state` con SVG + `<h2>`
- **Colori:** brand blu `#1B365D`, gold `#C59343`, sfondo `#F4F6F9`

---

## 8. STATO IMPLEMENTAZIONE

| Funzionalità | Stato |
|---|---|
| Auth register/login/logout | ✅ |
| Modifica password | ✅ |
| Modifica email | ✅ |
| HomePage + routing dashboard per ruolo | ✅ |
| Pagina Profilo | ✅ |
| Dashboard Chair — lista conferenze | ✅ |
| Crea Nuova Conferenza | ✅ |
| Gestione Conferenza (pannello) | ✅ |
| Inserimento Co-chair | ✅ |
| Inserimento Membro PC | ✅ |
| Lista Articoli Pubblicati (Chair) | ✅ |
| Dashboard Autore — conferenze in sottomissione | ✅ |
| Sottomissione Articolo (upload PDF) | ✅ |
| Lista Articoli Sottomessi (Autore) | ✅ |
| Dashboard Revisore — articoli assegnati | ✅ |
| Scheda Revisione (scrivi revisione) | ✅ |
| Dashboard Membro PC — conferenze in revisione | ✅ |
| Lista Articoli PC | ✅ |
| Assegna Sotto-Revisore | ✅ |
| Dashboard Editore — conferenze | ✅ |
| Lista Articoli Editore (con pubblica + scarica PDF) | ✅ |
| Visualizza Revisioni (Editore) | ✅ |
| Notifiche | ❌ non implementato |

---

## 9. CONVENZIONI CODICE

- **ID generazione:** `generateId(n)` → stringa alfanumerica di n caratteri
  - Conferenze: 6 char · Articoli: 10 char · Pubblicazioni: 10 char · Revisioni: 6 char
- **Ruoli validi:** `autore | revisore | chair | editore`
- **membro_pc** non è un ruolo: è una relazione `(id_conferenza, id_revisore)` nella tabella `membro_pc`
- **e_assegnato** è SOLO per sotto-revisori (non membri PC). I membri PC possono revisionare senza assegnazione previa.
- **LONGBLOB:** mai incluso nelle query di lista; recuperato solo con `getDocumentoById` / `downloadDocumento`
- **Errori MySQL:** `ER_DUP_ENTRY` (code 1062) → risposta 409
- **Params Express 5:** usare `req.params['nome'] as string` (non destructuring, evita errore `string | string[]`)
- **Upload file:** multer `memoryStorage` → `req.file.buffer` direttamente in LONGBLOB; limite 16MB app, 64MB MySQL
- **media_voti:** media ponderata `Σ(valutazione × voto_competenza) / Σ(voto_competenza)`
- **Pubblica limite:** `countByConferenza >= getLimiteByArticolo` → 409 Conflict
- **Approccio sviluppo:** bottom-up (model → controller → route → service → UI)
- **Test data:** 16 utenti, pw `password`
  - chair1@test.com / chair2@test.com
  - autore1-5@test.com
  - revisore1-5@test.com (PC), revisore6-7@test.com (test)
  - editore1-2@test.com

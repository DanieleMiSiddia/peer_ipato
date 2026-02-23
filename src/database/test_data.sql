-- ============================================================
-- SCRIPT DI TEST: peer_ipato / sistemone
-- Solo INSERT — non modifica lo schema esistente
-- ============================================================
--
-- PASSWORD DI TUTTI GLI UTENTI: password
--
-- Se il login fallisce, genera un hash valido con:
--   node -e "const b=require('bcrypt'); b.hash('password',10).then(h=>console.log(h))"
-- poi sostituisci il valore di @pwd qui sotto.
--
-- ============================================================
-- CREDENZIALI (16 utenti):
--
--   CHAIR (2)
--     chair1@test.com      / password  →  Chair principale (tutte le conferenze)
--     chair2@test.com      / password  →  Co-Chair (tutte le conferenze)
--
--   AUTORI (5)
--     autore1@test.com     / password
--     autore2@test.com     / password
--     autore3@test.com     / password
--     autore4@test.com     / password
--     autore5@test.com     / password
--
--   REVISORI PC (5) — membri del comitato di tutte le conferenze
--     revisore1@test.com   / password  →  competenza: Machine Learning
--     revisore2@test.com   / password  →  competenza: Deep Learning
--     revisore3@test.com   / password  →  competenza: Computer Vision
--     revisore4@test.com   / password  →  competenza: Data Science
--     revisore5@test.com   / password  →  competenza: Networking
--
--   REVISORI TEST (2) — solo per test assegnazioni, non membri PC
--     revisore6@test.com   / password  →  competenza: Web Security
--     revisore7@test.com   / password  →  competenza: Cloud Computing
--
--   EDITORI (2)
--     editore1@test.com    / password  →  Editore CONF01, CONF02
--     editore2@test.com    / password  →  Editore CONF03, CONF04
--
-- ============================================================

USE sistemone;

SET @pwd = '$2b$10$Nb/H7V5JMeh7OOgTeA2Q9.N8x.qbq3xwplVfD53xM2l3KEKL.TXkm';

-- ============================================================
-- 1. UTENTI + SPECIALIZZAZIONI
-- ============================================================

INSERT INTO utente (id_utente, nome, cognome, email, password, role, competenza, ultimo_logout) VALUES
    -- Chair
    ('U0001', 'Mario',     'Rossi',    'chair1@test.com',    @pwd, 'chair',   NULL,               NULL),
    ('U0002', 'Anna',      'Bianchi',  'chair2@test.com',    @pwd, 'chair',   NULL,               NULL),
    -- Autori
    ('U0003', 'Luca',      'Ricci',    'autore1@test.com',   @pwd, 'autore',  NULL,               NULL),
    ('U0004', 'Sara',      'Ferrari',  'autore2@test.com',   @pwd, 'autore',  NULL,               NULL),
    ('U0005', 'Marco',     'Esposito', 'autore3@test.com',   @pwd, 'autore',  NULL,               NULL),
    ('U0006', 'Elena',     'Russo',    'autore4@test.com',   @pwd, 'autore',  NULL,               NULL),
    ('U0007', 'Paolo',     'Conti',    'autore5@test.com',   @pwd, 'autore',  NULL,               NULL),
    -- Revisori PC
    ('U0008', 'Giulia',    'Marin',    'revisore1@test.com', @pwd, 'revisore','Machine Learning', NULL),
    ('U0009', 'Franco',    'Gatti',    'revisore2@test.com', @pwd, 'revisore','Deep Learning',    NULL),
    ('U0010', 'Sofia',     'Mancini',  'revisore3@test.com', @pwd, 'revisore','Computer Vision',  NULL),
    ('U0011', 'Andrea',    'Costa',    'revisore4@test.com', @pwd, 'revisore','Data Science',     NULL),
    ('U0012', 'Chiara',    'Fontana',  'revisore5@test.com', @pwd, 'revisore','Networking',       NULL),
    -- Revisori test
    ('U0013', 'Roberto',   'Serra',    'revisore6@test.com', @pwd, 'revisore','Web Security',     NULL),
    ('U0014', 'Maria',     'Greco',    'revisore7@test.com', @pwd, 'revisore','Cloud Computing',  NULL),
    -- Editori
    ('U0015', 'Luigi',     'Verdi',    'editore1@test.com',  @pwd, 'editore', NULL,               NULL),
    ('U0016', 'Francesca', 'Bruno',    'editore2@test.com',  @pwd, 'editore', NULL,               NULL);

INSERT INTO chair   (id_utente) VALUES ('U0001'), ('U0002');

INSERT INTO autore  (id_utente) VALUES ('U0003'), ('U0004'), ('U0005'), ('U0006'), ('U0007');

INSERT INTO revisore (id_utente) VALUES
    ('U0008'), ('U0009'), ('U0010'), ('U0011'), ('U0012'),
    ('U0013'), ('U0014');

INSERT INTO editore (id_utente) VALUES ('U0015'), ('U0016');

-- ============================================================
-- VERIFICA STEP 1
-- ============================================================

SELECT 'utente'   AS tabella, COUNT(*) AS righe FROM utente
UNION ALL SELECT 'chair',   COUNT(*) FROM chair
UNION ALL SELECT 'autore',  COUNT(*) FROM autore
UNION ALL SELECT 'revisore',COUNT(*) FROM revisore
UNION ALL SELECT 'editore', COUNT(*) FROM editore;
-- Atteso: utente=16, chair=2, autore=5, revisore=7, editore=2

-- ============================================================
-- 2. CONFERENZE
-- ============================================================
--
-- Fasi basate sulla data odierna (2026-02-22):
--
--   CONF01 → SOTTOMISSIONE  : oggi cade dentro data_fine_sottomissione (2026-04-30)
--   CONF02 → REVISIONE      : sottomissione chiusa (2026-01-31), revisione aperta (2026-05-31)
--   CONF03 → PUBBLICAZIONE  : revisione chiusa (2025-12-31), conferenza futura (2026-05-05)
--   CONF04 → TERMINATA      : conferenza già conclusa (2025-05-05)
--
-- Colonne (in ordine schema):
--   id_conferenza, data_inizio_conferenza, data_fine_conferenza,
--   data_inizio_revisione, data_fine_revisione,
--   data_inizio_sottomissione, data_fine_sottomissione,
--   numero_articoli, nome, topic, id_chair, id_editore
--
-- numero_articoli = limite massimo di pubblicazioni per la conferenza
--   CONF01/02: 10  (limite ampio, nessuna pubblicazione prevista)
--   CONF03:     5  (pubblicheremo 3 su 5)
--   CONF04:     5  (pubblicheremo tutti e 5)
-- ============================================================

-- CONF01: Fase SOTTOMISSIONE
--   sottomissione APERTA  (2026-01-01 → 2026-04-30)  ← oggi 2026-02-22 è inside
--   revisione    FUTURA   (2026-05-01 → 2026-07-31)
--   conferenza   FUTURA   (2026-10-01 → 2026-10-05)
INSERT INTO conferenza VALUES (
    'CONF01',
    '2026-10-01', '2026-10-05',
    '2026-05-01', '2026-07-31',
    '2026-01-01', '2026-04-30',
    10,
    'Workshop on Emerging Web Technologies 2026',
    'Web, Cloud Computing, Microservices',
    'U0001', 'U0015'
);

-- CONF02: Fase REVISIONE
--   sottomissione CHIUSA  (2025-09-01 → 2026-01-31)  ← scaduta prima di oggi
--   revisione    APERTA   (2026-02-01 → 2026-05-31)  ← oggi 2026-02-22 è inside
--   conferenza   FUTURA   (2026-09-01 → 2026-09-05)
INSERT INTO conferenza VALUES (
    'CONF02',
    '2026-09-01', '2026-09-05',
    '2026-02-01', '2026-05-31',
    '2025-09-01', '2026-01-31',
    10,
    'International Conference on AI Systems 2026',
    'Artificial Intelligence, Machine Learning, Computer Vision',
    'U0001', 'U0015'
);

-- CONF03: Fase PUBBLICAZIONE
--   sottomissione CHIUSA  (2025-03-01 → 2025-07-31)
--   revisione    CHIUSA   (2025-08-01 → 2025-12-31)  ← scaduta prima di oggi
--   conferenza   FUTURA   (2026-05-01 → 2026-05-05)
INSERT INTO conferenza VALUES (
    'CONF03',
    '2026-05-01', '2026-05-05',
    '2025-08-01', '2025-12-31',
    '2025-03-01', '2025-07-31',
    5,
    'Symposium on Data Science and Analytics 2026',
    'Data Science, Big Data, Statistical Learning',
    'U0001', 'U0016'
);

-- CONF04: TERMINATA
--   sottomissione CHIUSA  (2024-06-01 → 2024-10-31)
--   revisione    CHIUSA   (2024-11-01 → 2025-02-28)
--   conferenza   CONCLUSA (2025-05-01 → 2025-05-05)  ← già passata
INSERT INTO conferenza VALUES (
    'CONF04',
    '2025-05-01', '2025-05-05',
    '2024-11-01', '2025-02-28',
    '2024-06-01', '2024-10-31',
    5,
    'Conference on Distributed Computing 2025',
    'Distributed Systems, Networking, Cloud',
    'U0001', 'U0016'
);

-- ============================================================
-- VERIFICA STEP 2
-- ============================================================

SELECT id_conferenza, nome,
    CASE
        WHEN CURDATE() <= data_fine_sottomissione THEN 'SOTTOMISSIONE'
        WHEN CURDATE() <= data_fine_revisione     THEN 'REVISIONE'
        WHEN data_fine_conferenza >= CURDATE()    THEN 'PUBBLICAZIONE'
        ELSE 'TERMINATA'
    END AS fase_calcolata
FROM conferenza
ORDER BY id_conferenza;
-- Atteso: CONF01=SOTTOMISSIONE, CONF02=REVISIONE, CONF03=PUBBLICAZIONE, CONF04=TERMINATA

-- ============================================================
-- 3. ARTICOLI (20 = 5 per conferenza, uno per autore)
-- ============================================================
--
-- Mapping autore → articolo (uguale per tutte le conferenze):
--   art0001 → U0003 (autore1 - Luca Ricci)
--   art0002 → U0004 (autore2 - Sara Ferrari)
--   art0003 → U0005 (autore3 - Marco Esposito)
--   art0004 → U0006 (autore4 - Elena Russo)
--   art0005 → U0007 (autore5 - Paolo Conti)
--
-- media_voti = 0.00 per tutti; verrà aggiornata in Step 5
-- documento  = magic bytes PDF (%PDF-1.4) → non apribile ma sufficiente per test download
-- ============================================================

-- ── CONF01 (5 articoli — fase SOTTOMISSIONE, nessuna revisione) ──
INSERT INTO articolo (id_articolo, titolo, stato, topic, data_decisione, documento, id_autore, media_voti, id_conferenza) VALUES
    ('c01art0001', 'Serverless Architecture Patterns for Microservices',
     'SOTTOMESSO', 'Cloud Computing',  NULL, UNHEX('255044462D312E34'), 'U0003', 0.00, 'CONF01'),
    ('c01art0002', 'Progressive Web Apps and Offline-First Design',
     'SOTTOMESSO', 'Web',              NULL, UNHEX('255044462D312E34'), 'U0004', 0.00, 'CONF01'),
    ('c01art0003', 'Edge Computing Integration in Modern Web Stacks',
     'SOTTOMESSO', 'Cloud Computing',  NULL, UNHEX('255044462D312E34'), 'U0005', 0.00, 'CONF01'),
    ('c01art0004', 'WebAssembly Performance Benchmarks for Cloud Workloads',
     'SOTTOMESSO', 'Web',              NULL, UNHEX('255044462D312E34'), 'U0006', 0.00, 'CONF01'),
    ('c01art0005', 'API Gateway Strategies for Distributed Microservices',
     'SOTTOMESSO', 'Microservices',    NULL, UNHEX('255044462D312E34'), 'U0007', 0.00, 'CONF01');

-- ── CONF02 (5 articoli — fase REVISIONE, 2 revisioni per articolo in Step 5) ──
INSERT INTO articolo (id_articolo, titolo, stato, topic, data_decisione, documento, id_autore, media_voti, id_conferenza) VALUES
    ('c02art0001', 'Deep Learning Approaches for Medical Image Segmentation',
     'SOTTOMESSO', 'Machine Learning',       NULL, UNHEX('255044462D312E34'), 'U0003', 0.00, 'CONF02'),
    ('c02art0002', 'Federated Learning with Differential Privacy at Scale',
     'SOTTOMESSO', 'Machine Learning',       NULL, UNHEX('255044462D312E34'), 'U0004', 0.00, 'CONF02'),
    ('c02art0003', 'Vision Transformers for Real-Time Object Detection',
     'SOTTOMESSO', 'Computer Vision',        NULL, UNHEX('255044462D312E34'), 'U0005', 0.00, 'CONF02'),
    ('c02art0004', 'Self-Supervised Contrastive Learning for NLP Tasks',
     'SOTTOMESSO', 'Artificial Intelligence',NULL, UNHEX('255044462D312E34'), 'U0006', 0.00, 'CONF02'),
    ('c02art0005', 'Multimodal Fusion for Cross-Lingual Sentiment Analysis',
     'SOTTOMESSO', 'Machine Learning',       NULL, UNHEX('255044462D312E34'), 'U0007', 0.00, 'CONF02');

-- ── CONF03 (5 articoli — fase PUBBLICAZIONE, 3 revisioni per articolo in Step 5) ──
INSERT INTO articolo (id_articolo, titolo, stato, topic, data_decisione, documento, id_autore, media_voti, id_conferenza) VALUES
    ('c03art0001', 'Causal Inference Methods for High-Dimensional Data',
     'SOTTOMESSO', 'Statistical Learning', NULL, UNHEX('255044462D312E34'), 'U0003', 0.00, 'CONF03'),
    ('c03art0002', 'Scalable Graph Neural Networks for Social Network Analysis',
     'SOTTOMESSO', 'Big Data',             NULL, UNHEX('255044462D312E34'), 'U0004', 0.00, 'CONF03'),
    ('c03art0003', 'Anomaly Detection in Time-Series with Autoencoders',
     'SOTTOMESSO', 'Data Science',         NULL, UNHEX('255044462D312E34'), 'U0005', 0.00, 'CONF03'),
    ('c03art0004', 'Explainable AI Techniques for Healthcare Decision Support',
     'SOTTOMESSO', 'Statistical Learning', NULL, UNHEX('255044462D312E34'), 'U0006', 0.00, 'CONF03'),
    ('c03art0005', 'Differential Privacy in Federated Analytics Pipelines',
     'SOTTOMESSO', 'Data Science',         NULL, UNHEX('255044462D312E34'), 'U0007', 0.00, 'CONF03');

-- ── CONF04 (5 articoli — TERMINATA, 3 revisioni per articolo in Step 5) ──
INSERT INTO articolo (id_articolo, titolo, stato, topic, data_decisione, documento, id_autore, media_voti, id_conferenza) VALUES
    ('c04art0001', 'Byzantine Fault Tolerance in Distributed Ledger Systems',
     'SOTTOMESSO', 'Distributed Systems', NULL, UNHEX('255044462D312E34'), 'U0003', 0.00, 'CONF04'),
    ('c04art0002', 'Latency Optimization in Peer-to-Peer Overlay Networks',
     'SOTTOMESSO', 'Networking',          NULL, UNHEX('255044462D312E34'), 'U0004', 0.00, 'CONF04'),
    ('c04art0003', 'Consensus Algorithms for Large-Scale Distributed Systems',
     'SOTTOMESSO', 'Distributed Systems', NULL, UNHEX('255044462D312E34'), 'U0005', 0.00, 'CONF04'),
    ('c04art0004', 'Adaptive Load Balancing in Kubernetes Microservices',
     'SOTTOMESSO', 'Cloud',               NULL, UNHEX('255044462D312E34'), 'U0006', 0.00, 'CONF04'),
    ('c04art0005', 'Fault-Tolerant Storage Systems with Erasure Coding',
     'SOTTOMESSO', 'Distributed Systems', NULL, UNHEX('255044462D312E34'), 'U0007', 0.00, 'CONF04');

-- ============================================================
-- VERIFICA STEP 3
-- ============================================================

SELECT id_conferenza, COUNT(*) AS num_articoli
FROM articolo
GROUP BY id_conferenza
ORDER BY id_conferenza;
-- Atteso: CONF01=5, CONF02=5, CONF03=5, CONF04=5

-- ============================================================
-- 4. RELAZIONI
-- ============================================================
--
-- co_chair   : U0002 (Anna Bianchi - chair2) su tutte le 4 conferenze
--
-- membro_pc  : U0008–U0012 (5 revisori PC) × 4 conferenze = 20 righe
--              U0013–U0014 (revisori test) NON inseriti → usati per test assegnazioni
--
-- e_assegnato: SOLO per sotto-revisori (non membri PC)
--              I membri PC (U0008–U0012) NON hanno bisogno di assegnazione:
--              possono revisionare qualsiasi articolo della loro conferenza.
--              U0013 → c02art0001, c03art0001  (test flusso assegnazione)
--              U0014 → c02art0002, c04art0001  (test flusso assegnazione)
-- ============================================================

-- ── Co-chair ─────────────────────────────────────────────────
INSERT INTO co_chair (id_conferenza, id_chair) VALUES
    ('CONF01', 'U0002'),
    ('CONF02', 'U0002'),
    ('CONF03', 'U0002'),
    ('CONF04', 'U0002');

-- ── Membri PC (5 revisori × 4 conferenze) ────────────────────
INSERT INTO membro_pc (id_conferenza, id_revisore) VALUES
    ('CONF01', 'U0008'), ('CONF01', 'U0009'), ('CONF01', 'U0010'), ('CONF01', 'U0011'), ('CONF01', 'U0012'),
    ('CONF02', 'U0008'), ('CONF02', 'U0009'), ('CONF02', 'U0010'), ('CONF02', 'U0011'), ('CONF02', 'U0012'),
    ('CONF03', 'U0008'), ('CONF03', 'U0009'), ('CONF03', 'U0010'), ('CONF03', 'U0011'), ('CONF03', 'U0012'),
    ('CONF04', 'U0008'), ('CONF04', 'U0009'), ('CONF04', 'U0010'), ('CONF04', 'U0011'), ('CONF04', 'U0012');

-- ── Assegnazioni sotto-revisori ───────────────────────────────
-- I membri PC (U0008–U0012) NON necessitano di e_assegnato:
-- possono revisionare qualsiasi articolo della loro conferenza direttamente.
--
-- e_assegnato è usato SOLO per i sotto-revisori (non membri PC).
-- Inseriamo U0013 e U0014 su alcuni articoli per testare il flusso
-- di assegnazione sotto-revisore dalla UI (pagina assegna-sotto-revisore).
--
--   U0013 (Roberto Serra) → assegnato a c02art0001 e c03art0001
--   U0014 (Maria Greco)   → assegnato a c02art0002 e c04art0001
INSERT INTO e_assegnato (id_revisore, id_articolo, metodo_assegnazione) VALUES
    ('U0013', 'c02art0001', 'MANUALE'),
    ('U0013', 'c03art0001', 'MANUALE'),
    ('U0014', 'c02art0002', 'MANUALE'),
    ('U0014', 'c04art0001', 'MANUALE');

-- ============================================================
-- VERIFICA STEP 4
-- ============================================================

SELECT 'co_chair'    AS tabella, COUNT(*) AS righe FROM co_chair
UNION ALL SELECT 'membro_pc',   COUNT(*) FROM membro_pc
UNION ALL SELECT 'e_assegnato', COUNT(*) FROM e_assegnato;
-- Atteso: co_chair=4, membro_pc=20, e_assegnato=4

-- ============================================================
-- 5. REVISIONI + UPDATE media_voti
-- ============================================================
--
-- Solo i membri PC (U0008–U0012) inseriscono revisioni (non servono e_assegnato).
-- CONF01 → 0 revisioni (fase sottomissione)
-- CONF02 → 2 revisioni per articolo × 5 articoli = 10 revisioni
-- CONF03 → 3 revisioni per articolo × 5 articoli = 15 revisioni
-- CONF04 → 3 revisioni per articolo × 5 articoli = 15 revisioni
--
-- media_voti = Σ(valutazione × voto_competenza) / Σ(voto_competenza)
--
-- Valori pre-calcolati (usati per la verifica finale):
--   CONF02: c02art0001=3.60  c02art0002=4.40  c02art0003=2.75  c02art0004=4.50  c02art0005=2.75
--   CONF03: c03art0001=3.83  c03art0002=4.00  c03art0003=2.33  c03art0004=4.83  c03art0005=3.33
--   CONF04: c04art0001=4.50  c04art0002=2.50  c04art0003=3.83  c04art0004=4.67  c04art0005=3.33
--
-- Colonne: id_review, voto_competenza, valutazione, commento_chair, commento, stato_review, id_revisore, id_articolo
-- ============================================================

-- ── CONF02: 10 revisioni (2 per articolo) ────────────────────
-- c02art0001  →  (4×3 + 3×2) / (3+2) = 18/5 = 3.60
INSERT INTO revisione VALUES
    ('r20001', 3, 4, NULL, 'Architettura solida e ben strutturata. La metodologia è chiara e replicabile.',                     NULL, 'U0008', 'c02art0001'),
    ('r20002', 2, 3, NULL, 'Buona impostazione ma mancano esperimenti su dataset di grandi dimensioni.',                        NULL, 'U0009', 'c02art0001');

-- c02art0002  →  (5×2 + 4×3) / (2+3) = 22/5 = 4.40
INSERT INTO revisione VALUES
    ('r20003', 2, 5, NULL, 'Approccio innovativo alla privacy. Risultati eccellenti su benchmark standard.',                    NULL, 'U0010', 'c02art0002'),
    ('r20004', 3, 4, NULL, 'Contributo rilevante. La sezione relativa all efficienza computazionale è molto convincente.',      NULL, 'U0011', 'c02art0002');

-- c02art0003  →  (2×1 + 3×3) / (1+3) = 11/4 = 2.75
INSERT INTO revisione VALUES
    ('r20005', 1, 2, NULL, 'La novità rispetto allo stato dell arte non è sufficientemente motivata.',                          NULL, 'U0012', 'c02art0003'),
    ('r20006', 3, 3, NULL, 'Risultati discreti ma la complessità del modello non è giustificata dai miglioramenti ottenuti.',   NULL, 'U0008', 'c02art0003');

-- c02art0004  →  (4×2 + 5×2) / (2+2) = 18/4 = 4.50
INSERT INTO revisione VALUES
    ('r20007', 2, 4, NULL, 'Framework ben progettato. Le valutazioni sperimentali sono rigorose e convincenti.',                NULL, 'U0009', 'c02art0004'),
    ('r20008', 2, 5, NULL, 'Ottima qualità. Il lavoro estende significativamente la letteratura esistente.',                    NULL, 'U0010', 'c02art0004');

-- c02art0005  →  (3×3 + 2×1) / (3+1) = 11/4 = 2.75
INSERT INTO revisione VALUES
    ('r20009', 3, 3, NULL, 'Idea interessante ma l implementazione presenta lacune metodologiche da colmare.',                  NULL, 'U0011', 'c02art0005'),
    ('r20010', 1, 2, NULL, 'Il confronto con i metodi esistenti è superficiale. Necessarie revisioni sostanziali.',             NULL, 'U0012', 'c02art0005');

-- ── CONF03: 15 revisioni (3 per articolo) ────────────────────
-- c03art0001  →  (4×3 + 3×2 + 5×1) / (3+2+1) = 23/6 ≈ 3.83
INSERT INTO revisione VALUES
    ('r30001', 3, 4, NULL, 'Metodologia causale ben fondata. Buona validazione empirica su dati reali.',                        NULL, 'U0008', 'c03art0001'),
    ('r30002', 2, 3, NULL, 'Lavoro solido ma la sezione sperimentale potrebbe essere ampliata.',                                NULL, 'U0009', 'c03art0001'),
    ('r30003', 1, 5, NULL, 'Ottima intuizione teorica. Risultati molto promettenti per applicazioni future.',                   NULL, 'U0010', 'c03art0001');

-- c03art0002  →  (5×2 + 4×3 + 3×2) / (2+3+2) = 28/7 = 4.00
INSERT INTO revisione VALUES
    ('r30004', 2, 5, NULL, 'Contributo significativo alle GNN su larga scala. Benchmark esaustivi e rigorosi.',                 NULL, 'U0011', 'c03art0002'),
    ('r30005', 3, 4, NULL, 'Buona scalabilità dimostrata. Il confronto con lo stato dell arte è adeguato.',                    NULL, 'U0012', 'c03art0002'),
    ('r30006', 2, 3, NULL, 'Lavoro interessante ma alcune ipotesi potrebbero essere meglio giustificate.',                     NULL, 'U0008', 'c03art0002');

-- c03art0003  →  (2×1 + 3×2 + 2×3) / (1+2+3) = 14/6 ≈ 2.33
INSERT INTO revisione VALUES
    ('r30007', 1, 2, NULL, 'Il modello proposto è elementare rispetto allo stato dell arte attuale.',                           NULL, 'U0009', 'c03art0003'),
    ('r30008', 2, 3, NULL, 'Risultati discreti ma la novità del contributo non è chiaramente definita.',                       NULL, 'U0010', 'c03art0003'),
    ('r30009', 3, 2, NULL, 'Metodologia debole. Necessarie revisioni sostanziali prima della pubblicazione.',                   NULL, 'U0011', 'c03art0003');

-- c03art0004  →  (5×3 + 5×2 + 4×1) / (3+2+1) = 29/6 ≈ 4.83
INSERT INTO revisione VALUES
    ('r30010', 3, 5, NULL, 'Lavoro eccellente. Contributo molto rilevante per la XAI in ambito medico.',                       NULL, 'U0012', 'c03art0004'),
    ('r30011', 2, 5, NULL, 'Ottima combinazione di interpretabilità e accuratezza. Fortemente raccomandato.',                   NULL, 'U0008', 'c03art0004'),
    ('r30012', 1, 4, NULL, 'Articolo di alta qualità. Le spiegazioni prodotte sono intuitive e clinicamente utili.',            NULL, 'U0009', 'c03art0004');

-- c03art0005  →  (3×2 + 2×1 + 4×3) / (2+1+3) = 20/6 ≈ 3.33
INSERT INTO revisione VALUES
    ('r30013', 2, 3, NULL, 'Approccio interessante ma la garanzia di privacy va meglio formalizzata.',                         NULL, 'U0010', 'c03art0005'),
    ('r30014', 1, 2, NULL, 'Il contributo rispetto alla letteratura esistente non è sufficientemente differenziato.',           NULL, 'U0011', 'c03art0005'),
    ('r30015', 3, 4, NULL, 'Buona integrazione tra privacy differenziale e federated learning. Solide basi teoriche.',          NULL, 'U0012', 'c03art0005');

-- ── CONF04: 15 revisioni (3 per articolo) ────────────────────
-- c04art0001  →  (5×2 + 4×3 + 5×1) / (2+3+1) = 27/6 = 4.50
INSERT INTO revisione VALUES
    ('r40001', 2, 5, NULL, 'Contributo fondamentale per la tolleranza ai guasti. Analisi della complessità impeccabile.',       NULL, 'U0008', 'c04art0001'),
    ('r40002', 3, 4, NULL, 'Solida base teorica e sperimentazione molto convincente. Da pubblicare.',                           NULL, 'U0009', 'c04art0001'),
    ('r40003', 1, 5, NULL, 'Risultati notevoli. Il protocollo proposto migliora significativamente lo stato dell arte.',        NULL, 'U0010', 'c04art0001');

-- c04art0002  →  (2×1 + 3×3 + 2×2) / (1+3+2) = 15/6 = 2.50
INSERT INTO revisione VALUES
    ('r40004', 1, 2, NULL, 'Approccio naive. Non vengono considerate le tecniche di ottimizzazione più recenti.',               NULL, 'U0011', 'c04art0002'),
    ('r40005', 3, 3, NULL, 'Risultati nella media. La sezione di valutazione manca di confronti significativi.',                NULL, 'U0012', 'c04art0002'),
    ('r40006', 2, 2, NULL, 'Contributo limitato. Le assunzioni di base del modello non sono sufficientemente motivate.',        NULL, 'U0008', 'c04art0002');

-- c04art0003  →  (4×2 + 4×3 + 3×1) / (2+3+1) = 23/6 ≈ 3.83
INSERT INTO revisione VALUES
    ('r40007', 2, 4, NULL, 'Algoritmo di consenso ben progettato. I risultati empirici supportano le affermazioni teoriche.',   NULL, 'U0009', 'c04art0003'),
    ('r40008', 3, 4, NULL, 'Buona scalabilità dimostrata su cluster di grandi dimensioni. Lavoro maturo.',                      NULL, 'U0010', 'c04art0003'),
    ('r40009', 1, 3, NULL, 'Contributo valido ma alcune comparazioni con letteratura recente risultano mancanti.',              NULL, 'U0011', 'c04art0003');

-- c04art0004  →  (5×3 + 4×2 + 5×1) / (3+2+1) = 28/6 ≈ 4.67
INSERT INTO revisione VALUES
    ('r40010', 3, 5, NULL, 'Soluzione elegante ed efficiente. Il bilanciamento del carico supera i benchmark esistenti.',       NULL, 'U0012', 'c04art0004'),
    ('r40011', 2, 4, NULL, 'Ottima ingegnerizzazione. L integrazione con Kubernetes è descritta in modo esaustivo.',            NULL, 'U0008', 'c04art0004'),
    ('r40012', 1, 5, NULL, 'Lavoro di alta qualità. Approccio innovativo con risultati di produzione verificabili.',            NULL, 'U0009', 'c04art0004');

-- c04art0005  →  (3×2 + 4×3 + 2×1) / (2+3+1) = 20/6 ≈ 3.33
INSERT INTO revisione VALUES
    ('r40013', 2, 3, NULL, 'Sistema tollerante ai guasti con buone proprietà teoriche. Implementazione corretta.',              NULL, 'U0010', 'c04art0005'),
    ('r40014', 3, 4, NULL, 'L erasure coding è applicato in modo efficace. Buona analisi del trade-off spazio/resilienza.',     NULL, 'U0011', 'c04art0005'),
    ('r40015', 1, 2, NULL, 'Contributo modesto rispetto alle soluzioni esistenti. Manca un confronto diretto con Reed-Solomon.',NULL, 'U0012', 'c04art0005');

-- ── UPDATE media_voti (media ponderata da revisione) ─────────
SET SQL_SAFE_UPDATES = 0;

UPDATE articolo a
SET a.media_voti = (
    SELECT ROUND(
        SUM(r.valutazione * r.voto_competenza) / SUM(r.voto_competenza),
    2)
    FROM revisione r
    WHERE r.id_articolo = a.id_articolo
)
WHERE a.id_articolo IN (
    SELECT DISTINCT id_articolo FROM revisione
);

SET SQL_SAFE_UPDATES = 1;

-- ============================================================
-- VERIFICA STEP 5
-- ============================================================

SELECT 'revisione' AS tabella, COUNT(*) AS righe FROM revisione;
-- Atteso: 40

SELECT id_articolo, media_voti FROM articolo
WHERE id_articolo LIKE 'c02%' OR id_articolo LIKE 'c03%' OR id_articolo LIKE 'c04%'
ORDER BY id_articolo;
-- Atteso:
--   c02art0001=3.60  c02art0002=4.40  c02art0003=2.75  c02art0004=4.50  c02art0005=2.75
--   c03art0001=3.83  c03art0002=4.00  c03art0003=2.33  c03art0004=4.83  c03art0005=3.33
--   c04art0001=4.50  c04art0002=2.50  c04art0003=3.83  c04art0004=4.67  c04art0005=3.33

-- ============================================================
-- 6. PUBBLICAZIONI
-- ============================================================
--
-- Editore per CONF03 e CONF04: U0016 (Francesca Bruno - editore2)
--
-- CONF03 (numero_articoli=5, limite=5):
--   Pubblichiamo i 3 articoli con media_voti più alta:
--     c03art0004 → 4.83  (1°)
--     c03art0002 → 4.00  (2°)
--     c03art0001 → 3.83  (3°)
--   Non pubblicati: c03art0005 (3.33), c03art0003 (2.33)
--
-- CONF04 (numero_articoli=5, limite=5):
--   Pubblichiamo tutti e 5 gli articoli → limite raggiunto
--   (utile per testare il blocco 409 Conflict dalla UI)
--
-- codice_pubblicazione: CHAR(10), generato come stringa fissa per il test
-- ============================================================

-- ── CONF03: 3 pubblicazioni ───────────────────────────────────
INSERT INTO pubblicazione (codice_pubblicazione, id_articolo, id_editore) VALUES
    ('PUB3000001', 'c03art0004', 'U0016'),
    ('PUB3000002', 'c03art0002', 'U0016'),
    ('PUB3000003', 'c03art0001', 'U0016');

-- ── CONF04: 5 pubblicazioni (tutte) ──────────────────────────
INSERT INTO pubblicazione (codice_pubblicazione, id_articolo, id_editore) VALUES
    ('PUB4000001', 'c04art0001', 'U0016'),
    ('PUB4000002', 'c04art0002', 'U0016'),
    ('PUB4000003', 'c04art0003', 'U0016'),
    ('PUB4000004', 'c04art0004', 'U0016'),
    ('PUB4000005', 'c04art0005', 'U0016');

-- ============================================================
-- VERIFICA STEP 6
-- ============================================================

SELECT 'pubblicazione' AS tabella, COUNT(*) AS righe FROM pubblicazione;
-- Atteso: 8

SELECT p.codice_pubblicazione, p.id_articolo, a.titolo, a.media_voti, a.id_conferenza
FROM pubblicazione p
JOIN articolo a ON p.id_articolo = a.id_articolo
ORDER BY a.id_conferenza, a.media_voti DESC;
-- Atteso: 3 righe CONF03 (ordinate per media decrescente), 5 righe CONF04

-- Verifica limite CONF04 raggiunto (deve restituire 0 slot disponibili):
SELECT c.numero_articoli AS limite,
       COUNT(p.codice_pubblicazione) AS pubblicati,
       c.numero_articoli - COUNT(p.codice_pubblicazione) AS slot_disponibili
FROM conferenza c
JOIN articolo a ON a.id_conferenza = c.id_conferenza
JOIN pubblicazione p ON p.id_articolo = a.id_articolo
WHERE c.id_conferenza = 'CONF04'
GROUP BY c.numero_articoli;
-- Atteso: limite=5, pubblicati=5, slot_disponibili=0

-- ============================================================
-- VERIFICA FINALE — riepilogo completo
-- ============================================================

SELECT 'utente'        AS tabella, COUNT(*) AS righe FROM utente
UNION ALL SELECT 'conferenza',    COUNT(*) FROM conferenza
UNION ALL SELECT 'articolo',      COUNT(*) FROM articolo
UNION ALL SELECT 'membro_pc',     COUNT(*) FROM membro_pc
UNION ALL SELECT 'co_chair',      COUNT(*) FROM co_chair
UNION ALL SELECT 'e_assegnato',   COUNT(*) FROM e_assegnato
UNION ALL SELECT 'revisione',     COUNT(*) FROM revisione
UNION ALL SELECT 'pubblicazione', COUNT(*) FROM pubblicazione;
-- Atteso: utente=16, conferenza=4, articolo=20, membro_pc=20,
--         co_chair=4, e_assegnato=4, revisione=40, pubblicazione=8

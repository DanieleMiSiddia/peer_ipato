-- ============================================================
-- SCHEMA DATABASE: Sistema Gestione Conferenze (peer_ipato)
-- DBMS: MySQL
-- ============================================================
-- Fix applicati:
--   #1  Aggiunto campo password in utente
--   #2  articolo.topic VARCHAR(10) → VARCHAR(90)
--   #3  Aggiunto stato RIFIUTATO nel CHECK di articolo
--   #5  Rimossi ID ridondanti dalle tabelle di specializzazione
--   #6  media_voti INT → DECIMAL(4,2)
--   #7  notifiche.id_notifica → AUTO_INCREMENT
--   #8  Ampliati VARCHAR troppo corti
--   #9  Naming convention normalizzata a snake_case
-- ============================================================

DROP SCHEMA IF EXISTS sistemone;
CREATE SCHEMA sistemone;
USE sistemone;

-- ============================================================
-- TABELLA BASE: UTENTE
-- ============================================================
CREATE TABLE utente (
    id_utente CHAR(5) PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    cognome VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(15) NOT NULL,
    competenza VARCHAR(20) NULL,
    ultimo_logout DATETIME NULL
);

-- ============================================================
-- TABELLE DI SPECIALIZZAZIONE (ereditarieta' da utente)
-- ============================================================
CREATE TABLE autore (
    id_utente CHAR(5) PRIMARY KEY,
    CONSTRAINT autore_fk FOREIGN KEY (id_utente) REFERENCES utente(id_utente) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE revisore (
    id_utente CHAR(5) PRIMARY KEY,
    preferenza VARCHAR(20),
    CONSTRAINT revisore_fk FOREIGN KEY (id_utente) REFERENCES utente(id_utente) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE chair (
    id_utente CHAR(5) PRIMARY KEY,
    CONSTRAINT chair_fk FOREIGN KEY (id_utente) REFERENCES utente(id_utente) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE membro_pc (
    id_utente CHAR(5) PRIMARY KEY,
    CONSTRAINT membro_pc_fk FOREIGN KEY (id_utente) REFERENCES utente(id_utente) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE editore (
    id_utente CHAR(5) PRIMARY KEY,
    CONSTRAINT editore_fk FOREIGN KEY (id_utente) REFERENCES utente(id_utente) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- TABELLA: CONFERENZA
-- ============================================================
CREATE TABLE conferenza (
    id_conferenza CHAR(6),
    data_inizio_conferenza DATE NOT NULL,
    data_fine_conferenza DATE NOT NULL,
    data_inizio_revisione DATE NOT NULL,
    data_fine_revisione DATE NOT NULL,
    data_inizio_sottomissione DATE NOT NULL,
    data_fine_sottomissione DATE NOT NULL,
    numero_articoli SMALLINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    topic VARCHAR(90) NOT NULL,
    id_chair CHAR(5) NOT NULL,
    id_editore CHAR(5) NOT NULL,
    CONSTRAINT conferenza_pk PRIMARY KEY (id_conferenza),
    CONSTRAINT conferenza_fk1 FOREIGN KEY (id_chair) REFERENCES chair(id_utente) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT conferenza_fk2 FOREIGN KEY (id_editore) REFERENCES editore(id_utente) ON DELETE NO ACTION ON UPDATE CASCADE
);

-- ============================================================
-- TABELLA: ARTICOLO
-- ============================================================
CREATE TABLE articolo (
    id_articolo CHAR(10),
    titolo VARCHAR(200) NOT NULL,
    stato VARCHAR(20) DEFAULT 'SOTTOMESSO',
    topic VARCHAR(90) NOT NULL,
    data_decisione DATE,
    documento LONGBLOB NOT NULL,
    id_autore CHAR(5) NOT NULL,
    media_voti DECIMAL(4,2) DEFAULT 0.00,
    id_conferenza CHAR(6) NOT NULL,
    CONSTRAINT articolo_pk PRIMARY KEY (id_articolo),
    CONSTRAINT statofinale_ck CHECK (stato IN ('ACCETTATO', 'RIFIUTATO', 'IN_REVISIONE_F', 'SOTTOMESSO_F', 'SOTTOMESSO')),
    CONSTRAINT conferenza_fk FOREIGN KEY (id_conferenza) REFERENCES conferenza(id_conferenza) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT articolo_fk1 FOREIGN KEY (id_autore) REFERENCES autore(id_utente) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- TABELLA: REVISIONE
-- ============================================================
CREATE TABLE revisione (
    id_review CHAR(6),
    voto_competenza SMALLINT NOT NULL,
    valutazione SMALLINT NOT NULL,
    commento_chair VARCHAR(200),
    commento VARCHAR(200) NOT NULL,
    stato_review TINYINT,
    id_revisore CHAR(5) NOT NULL,
    id_articolo CHAR(10) NOT NULL,
    CONSTRAINT review_pk PRIMARY KEY (id_review),
    CONSTRAINT rate_ck CHECK (valutazione BETWEEN 0 AND 10),
    CONSTRAINT fk_review_articolo FOREIGN KEY (id_articolo) REFERENCES articolo(id_articolo) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT fk_review_revisore FOREIGN KEY (id_revisore) REFERENCES revisore(id_utente) ON DELETE NO ACTION ON UPDATE CASCADE
);

-- ============================================================
-- TABELLA: NOTIFICHE
-- ============================================================
CREATE TABLE notifiche (
    id_notifica INT AUTO_INCREMENT,
    tipo_notifica SMALLINT NOT NULL,
    data_notifica DATE NOT NULL,
    id_utente CHAR(5) NOT NULL,
    CONSTRAINT notifica_pk PRIMARY KEY (id_notifica),
    CONSTRAINT notifiche_fk FOREIGN KEY (id_utente) REFERENCES utente(id_utente) ON DELETE NO ACTION ON UPDATE CASCADE
);

-- ============================================================
-- TABELLE ASSOCIATIVE (relazioni N-M)
-- ============================================================

-- Inviti a conferenza (membro_pc <-> conferenza)
CREATE TABLE invitato_a (
    id_conferenza CHAR(6),
    id_membro_pc CHAR(5),
    stato_invito VARCHAR(15) NOT NULL DEFAULT 'INVITATO',
    data_invito DATE NOT NULL,
    CONSTRAINT invitato_a_pk PRIMARY KEY (id_conferenza, id_membro_pc),
    CONSTRAINT statoinvito_ck CHECK (stato_invito IN ('INVITATO', 'ACCETTATO', 'RIFIUTATO', 'SCADUTO')),
    CONSTRAINT invito_conferenza_fk FOREIGN KEY (id_conferenza) REFERENCES conferenza(id_conferenza) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT invito_membro_fk FOREIGN KEY (id_membro_pc) REFERENCES membro_pc(id_utente) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- Gestione revisioni (revisore <-> revisione)
CREATE TABLE gestisce (
    id_revisore CHAR(5),
    id_review CHAR(6),
    motivo VARCHAR(30) NOT NULL,
    CONSTRAINT gest_pk PRIMARY KEY (id_revisore, id_review),
    CONSTRAINT gest_rev_fk FOREIGN KEY (id_review) REFERENCES revisione(id_review) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT gest_revisore_fk FOREIGN KEY (id_revisore) REFERENCES revisore(id_utente) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Assegnazione articoli a revisori (revisore <-> articolo)
CREATE TABLE e_assegnato (
    id_revisore CHAR(5),
    id_articolo CHAR(10),
    metodo_assegnazione VARCHAR(100) DEFAULT 'AUTOMATICO_KEYWORDS',
    CONSTRAINT assegnazione_pk PRIMARY KEY (id_revisore, id_articolo),
    CONSTRAINT metodo_ck CHECK (metodo_assegnazione IN ('MANUALE', 'AUTOMATICO_KEYWORDS', 'BIDDING', 'COMPETENZA')),
    CONSTRAINT ass_fk1 FOREIGN KEY (id_revisore) REFERENCES revisore(id_utente) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT ass_fk2 FOREIGN KEY (id_articolo) REFERENCES articolo(id_articolo) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Pubblicazioni (articolo -> editore)
CREATE TABLE pubblicazione (
    codice_pubblicazione CHAR(10),
    id_articolo CHAR(10) NOT NULL UNIQUE,
    id_editore CHAR(5) NOT NULL,
    PRIMARY KEY (codice_pubblicazione),
    CONSTRAINT pubb_editore_fk FOREIGN KEY (id_editore) REFERENCES editore(id_utente) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT pubb_articolo_fk FOREIGN KEY (id_articolo) REFERENCES articolo(id_articolo) ON DELETE NO ACTION ON UPDATE CASCADE
);

-- Offerte di revisione / bidding (articolo <-> revisore)
CREATE TABLE offerta (
    id_articolo CHAR(10),
    id_revisore CHAR(5),
    data_scadenza DATE NOT NULL,
    PRIMARY KEY (id_articolo, id_revisore),
    CONSTRAINT offerta_articolo_fk FOREIGN KEY (id_articolo) REFERENCES articolo(id_articolo) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT offerta_revisore_fk FOREIGN KEY (id_revisore) REFERENCES revisore(id_utente) ON DELETE NO ACTION ON UPDATE CASCADE
);

-- Co-chair di conferenza (conferenza <-> chair)
CREATE TABLE co_chair (
    id_conferenza CHAR(6),
    id_chair CHAR(5),
    PRIMARY KEY (id_conferenza, id_chair),
    CONSTRAINT co_chair_conferenza_fk FOREIGN KEY (id_conferenza) REFERENCES conferenza(id_conferenza) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT co_chair_chair_fk FOREIGN KEY (id_chair) REFERENCES chair(id_utente) ON DELETE CASCADE ON UPDATE CASCADE
);

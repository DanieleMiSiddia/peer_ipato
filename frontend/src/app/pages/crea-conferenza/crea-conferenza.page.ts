import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { DashboardChairService } from '../../services/dashboard-chair.service';

@Component({
    selector: 'app-crea-conferenza',
    templateUrl: './crea-conferenza.page.html',
    styleUrls: ['./crea-conferenza.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent]
})
export class CreaConferenzaPage implements OnInit {

    // Campi form
    nome          = '';
    editoreEmail  = '';
    articoliStima = '';
    topicInput    = '';

    // Cronologia
    sottInizio = '';
    sottFine   = '';
    revInizio  = '';
    revFine    = '';
    confInizio = '';
    confFine   = '';

    // Stato UI
    selectedTopics: string[] = [];
    errorMessage  = '';
    showSuccess   = false;
    successDetails = '';
    loading       = false;

    private token = localStorage.getItem('token') ?? '';

    constructor(
        private chairService: DashboardChairService,
        private router: Router
    ) {}

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); }
    }

    // topic management
    addTopic(event: KeyboardEvent): void {
        if (event.key === 'Enter' && this.topicInput.trim()) {
            event.preventDefault();
            this.selectedTopics = [...this.selectedTopics, this.topicInput.trim()];
            this.topicInput = '';
        }
    }

    removeTopic(t: string): void {
        this.selectedTopics = this.selectedTopics.filter(item => item !== t);
    }

    // validazione date
    private validateDates(): boolean {
        const s = (d: string) => d ? new Date(d) : null;
        const si = s(this.sottInizio), sf = s(this.sottFine);
        const ri = s(this.revInizio),  rf = s(this.revFine);
        const ci = s(this.confInizio), cf = s(this.confFine);

        if (si && sf && sf < si) return this.showErr("La data di fine sottomissione non può essere precedente all'inizio.");
        if (sf && ri && ri < sf) return this.showErr("La revisione non può iniziare prima della fine della sottomissione.");
        if (ri && rf && rf < ri) return this.showErr("La data di fine revisione non può essere precedente all'inizio.");
        if (rf && ci && ci < rf) return this.showErr("La conferenza non può iniziare prima del termine della revisione.");
        if (ci && cf && cf < ci) return this.showErr("La data di fine conferenza non può essere precedente all'inizio.");
        return true;
    }

    private showErr(msg: string): false {
        this.errorMessage = msg;
        return false;
    }

    submit(): void {
        this.errorMessage = '';

        // Auto-aggiungi topic non confermato
        if (this.topicInput.trim()) {
            this.selectedTopics = [...this.selectedTopics, this.topicInput.trim()];
            this.topicInput = '';
        }

        if (!this.nome)                        return void this.showErr('Il campo "Nome Conferenza" è obbligatorio.');
        if (!this.editoreEmail)                return void this.showErr('Il campo "Email Editore" è obbligatorio.');
        if (!this.articoliStima)               return void this.showErr('Il campo "Numero Articoli Stimati" è obbligatorio.');
        if (this.selectedTopics.length === 0)  return void this.showErr('Aggiungi almeno un topic alla conferenza.');
        if (!this.sottInizio || !this.sottFine) return void this.showErr('Compila le date della Fase Sottomissione.');
        if (!this.revInizio  || !this.revFine)  return void this.showErr('Compila le date della Fase Revisione.');
        if (!this.confInizio || !this.confFine) return void this.showErr('Compila le date dei Giorni Conferenza.');
        if (!this.validateDates()) return;

        this.loading = true;

        this.chairService.creaConferenza(this.token, {
            nome:                      this.nome,
            topic:                     this.selectedTopics.join(', '),
            numero_articoli:           this.articoliStima,
            editore_email:             this.editoreEmail,
            data_inizio_sottomissione: this.sottInizio,
            data_fine_sottomissione:   this.sottFine,
            data_inizio_revisione:     this.revInizio,
            data_fine_revisione:       this.revFine,
            data_inizio_conferenza:    this.confInizio,
            data_fine_conferenza:      this.confFine
        }).subscribe({
            next: (data) => {
                this.loading = false;
                this.successDetails = `<strong>${this.nome}</strong><br>ID: ${data.id_conferenza}<br><br>La conferenza è stata configurata correttamente.`;
                this.showSuccess = true;
            },
            error: (err) => {
                this.loading = false;
                this.showErr(err.error?.message || 'Errore durante la creazione della conferenza.');
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/dashboard-chair']);
    }
}

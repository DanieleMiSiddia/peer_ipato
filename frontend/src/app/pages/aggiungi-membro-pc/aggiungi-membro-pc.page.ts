import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { DashboardChairService } from '../../services/dashboard-chair.service';

@Component({
    selector: 'app-aggiungi-membro-pc',
    templateUrl: './aggiungi-membro-pc.page.html',
    styleUrls: ['./aggiungi-membro-pc.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent]
})
export class AggiungiMembroPCPage implements OnInit {
    email         = '';
    errorMessage  = '';
    successMessage = '';
    loading       = false;
    idConferenza  = '';

    private token = localStorage.getItem('token') ?? '';

    constructor(
        private chairService: DashboardChairService,
        private router:       Router,
        private route:        ActivatedRoute
    ) {}

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }
        this.idConferenza = this.route.snapshot.queryParamMap.get('id') ?? '';
        if (!this.idConferenza) { this.router.navigate(['/dashboard-chair']); }
    }

    submit(): void {
        this.errorMessage  = '';
        this.successMessage = '';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email.trim())) {
            this.errorMessage = 'Inserisci un indirizzo email valido.';
            return;
        }

        this.loading = true;

        this.chairService.aggiungiMembroPC(this.token, this.idConferenza, this.email.trim()).subscribe({
            next: () => {
                this.loading = false;
                this.successMessage = 'Membro PC aggiunto con successo!';
                setTimeout(() => this.goBack(), 1500);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.message || 'Errore durante l\'operazione.';
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/gestione-conferenza'], { queryParams: { id: this.idConferenza } });
    }
}

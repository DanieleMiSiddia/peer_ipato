import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { DashboardMembroPCService } from '../../services/dashboard-membro-pc.service';

@Component({
    selector: 'app-assegna-sotto-revisore',
    templateUrl: './assegna-sotto-revisore.page.html',
    styleUrls: ['./assegna-sotto-revisore.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent]
})
export class AssegnaSottoRevisorePage implements OnInit {
    email          = '';
    errorMessage   = '';
    successMessage = '';
    loading        = false;

    idArticolo   = '';
    idConferenza = '';

    private token      = localStorage.getItem('token') ?? '';
    private router     = inject(Router);
    private route      = inject(ActivatedRoute);
    private membroSvc  = inject(DashboardMembroPCService);

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }

        this.idArticolo   = this.route.snapshot.queryParamMap.get('idArticolo')   ?? '';
        this.idConferenza = this.route.snapshot.queryParamMap.get('idConferenza') ?? '';

        if (!this.idArticolo || !this.idConferenza) {
            this.router.navigate(['/dashboard-membro-pc']);
        }
    }

    submit(): void {
        this.errorMessage   = '';
        this.successMessage = '';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email.trim())) {
            this.errorMessage = 'Inserisci un indirizzo email valido.';
            return;
        }

        this.loading = true;

        this.membroSvc.assegnaRevisore(
            this.token,
            this.idArticolo,
            this.email.trim(),
            this.idConferenza
        ).subscribe({
            next: (res) => {
                this.loading       = false;
                this.successMessage = res.message;
                setTimeout(() => this.goBack(), 1500);
            },
            error: (err) => {
                this.loading      = false;
                this.errorMessage = err.error?.message ?? 'Errore durante l\'assegnazione. Riprova.';
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/lista-articoli-pc'], { queryParams: { id: this.idConferenza } });
    }
}

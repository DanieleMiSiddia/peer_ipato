import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { DashboardRevisoreService } from '../../services/dashboard-revisore.service';

@Component({
    selector: 'app-scheda-revisione',
    templateUrl: './scheda-revisione.page.html',
    styleUrls: ['./scheda-revisione.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent]
})
export class SchedaRevisionePage implements OnInit {

    // Campi form
    votoCompetenza = 2;
    valutazione    = 3;
    commento       = '';

    // Stato stelle
    starsArray = [1, 2, 3, 4, 5];
    starHover  = 0;

    // Stato UI
    errorMessage = '';
    showSuccess  = false;
    loading      = false;
    downloading  = false;

    // Parametri navigazione
    idArticolo = '';
    from       = '';         // 'revisore' | 'pc' — determina dove tornare

    private token       = localStorage.getItem('token') ?? '';
    private router      = inject(Router);
    private route       = inject(ActivatedRoute);
    private revisoreSvc = inject(DashboardRevisoreService);

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }

        this.idArticolo = this.route.snapshot.queryParamMap.get('idArticolo') ?? '';
        this.from       = this.route.snapshot.queryParamMap.get('from')       ?? 'revisore';

        if (!this.idArticolo) {
            this.goBack();
        }
    }

    submit(): void {
        this.errorMessage = '';

        if (!this.commento.trim()) {
            this.errorMessage = 'Il campo commento è obbligatorio.';
            return;
        }

        this.loading = true;

        this.revisoreSvc.creaRevisione(
            this.token,
            this.idArticolo,
            this.votoCompetenza,
            this.valutazione,
            this.commento.trim()
        ).subscribe({
            next: () => {
                this.loading     = false;
                this.showSuccess = true;
            },
            error: (err) => {
                this.loading      = false;
                this.errorMessage = err.error?.message ?? 'Errore durante l\'invio della revisione.';
            }
        });
    }

    scaricaPDF(): void {
        this.downloading = true;

        this.revisoreSvc.downloadDocumento(this.token, this.idArticolo).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a   = document.createElement('a');
                a.href     = url;
                a.download = `articolo-${this.idArticolo}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
                this.downloading = false;
            },
            error: () => {
                this.errorMessage = 'Impossibile scaricare il documento. Riprova più tardi.';
                this.downloading  = false;
            }
        });
    }

    goBack(): void {
        if (this.from === 'pc') {
            this.router.navigate(['/lista-articoli-pc']);
        } else {
            this.router.navigate(['/dashboard-revisore']);
        }
    }
}

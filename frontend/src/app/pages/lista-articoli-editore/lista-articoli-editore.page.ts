import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { DashboardEditoreService, ArticoloEditore } from '../../services/dashboard-editore.service';

@Component({
    selector: 'app-lista-articoli-editore',
    templateUrl: './lista-articoli-editore.page.html',
    styleUrls: ['./lista-articoli-editore.page.scss'],
    standalone: true,
    imports: [CommonModule, DecimalPipe, IonContent]
})
export class ListaArticoliEditorePage implements OnInit {
    nomeUtente           = '';
    articoli:            ArticoloEditore[] = [];
    isEmpty              = false;
    idConferenza         = '';
    downloadingId        = '';
    articoloDaPubblicare = '';
    publishLoading       = false;
    successMsg           = '';
    errorMsg             = '';

    private token = localStorage.getItem('token') ?? '';

    private route      = inject(ActivatedRoute);
    private router     = inject(Router);
    private userSvc    = inject(UserService);
    private editoreSvc = inject(DashboardEditoreService);

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }

        this.idConferenza = this.route.snapshot.queryParamMap.get('id') ?? '';
        if (!this.idConferenza) {
            this.router.navigate(['/dashboard-editore']);
            return;
        }

        this.caricaProfilo();
        this.caricaArticoli();
    }

    caricaProfilo(): void {
        this.userSvc.getProfilo(this.token).subscribe({
            next:  (data) => { this.nomeUtente = data.utente.nome + ' ' + data.utente.cognome; },
            error: ()     => { this.clearAndRedirect(); }
        });
    }

    caricaArticoli(): void {
        this.editoreSvc.getArticoli(this.token, this.idConferenza).subscribe({
            next: (data) => {
                this.articoli = data.articoli;
                this.isEmpty  = data.articoli.length === 0;
            },
            error: () => { this.clearAndRedirect(); }
        });
    }

    goToRevisioni(idArticolo: string): void {
        this.router.navigate(['/visualizza-revisioni'], {
            queryParams: { idArticolo, idConferenza: this.idConferenza, from: 'editore' }
        });
    }

    scaricaPDF(idArticolo: string): void {
        this.downloadingId = idArticolo;
        this.editoreSvc.downloadDocumento(this.token, idArticolo).subscribe({
            next: (blob) => {
                const url  = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href     = url;
                link.download = `articolo-${idArticolo}.pdf`;
                link.click();
                URL.revokeObjectURL(url);
                this.downloadingId = '';
            },
            error: () => {
                this.downloadingId = '';
            }
        });
    }

    pubblica(idArticolo: string): void {
        this.successMsg           = '';
        this.errorMsg             = '';
        this.articoloDaPubblicare = idArticolo;
    }

    annullaPublicazione(): void {
        this.articoloDaPubblicare = '';
    }

    confermaPublicazione(): void {
        if (!this.articoloDaPubblicare) return;
        this.publishLoading = true;

        this.editoreSvc.pubblica(this.token, this.articoloDaPubblicare).subscribe({
            next: (res) => {
                this.articoli             = this.articoli.filter(a => a.id_articolo !== this.articoloDaPubblicare);
                this.isEmpty              = this.articoli.length === 0;
                this.successMsg           = res.message;
                this.articoloDaPubblicare = '';
                this.publishLoading       = false;
            },
            error: (err) => {
                this.errorMsg             = err.error?.message ?? 'Impossibile pubblicare l\'articolo. Riprova.';
                this.articoloDaPubblicare = '';
                this.publishLoading       = false;
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/dashboard-editore']);
    }

    private clearAndRedirect(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth']);
    }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { DashboardMembroPCService, ArticoloPC } from '../../services/dashboard-membro-pc.service';

@Component({
    selector: 'app-lista-articoli-pc',
    templateUrl: './lista-articoli-pc.page.html',
    styleUrls: ['./lista-articoli-pc.page.scss'],
    standalone: true,
    imports: [CommonModule, IonContent]
})
export class ListaArticoliPCPage implements OnInit {
    nomeUtente   = '';
    articoli:    ArticoloPC[] = [];
    isEmpty      = false;
    errorMsg     = '';
    idConferenza = '';

    private token = localStorage.getItem('token') ?? '';

    private route    = inject(ActivatedRoute);
    private router   = inject(Router);
    private userSvc  = inject(UserService);
    private membroSvc = inject(DashboardMembroPCService);

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }

        this.idConferenza = this.route.snapshot.queryParamMap.get('id') ?? '';
        if (!this.idConferenza) {
            this.router.navigate(['/dashboard-membro-pc']);
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
        this.membroSvc.getArticoli(this.token, this.idConferenza).subscribe({
            next: (data) => {
                this.articoli = data.articoli;
                this.isEmpty  = data.articoli.length === 0;
            },
            error: () => { this.clearAndRedirect(); }
        });
    }

    goToAssegna(idArticolo: string): void {
        this.router.navigate(['/assegna-sotto-revisore'], {
            queryParams: { idArticolo, idConferenza: this.idConferenza }
        });
    }

    goToRevisiona(idArticolo: string): void {
        this.router.navigate(['/scheda-revisione'], {
            queryParams: { idArticolo, from: 'pc' }
        });
    }

    goBack(): void {
        this.router.navigate(['/dashboard-membro-pc']);
    }

    private clearAndRedirect(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth']);
    }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { DashboardChairService, ArticoloPubblicatoChair } from '../../services/dashboard-chair.service';

@Component({
    selector: 'app-lista-articoli-pubblicati',
    templateUrl: './lista-articoli-pubblicati.page.html',
    styleUrls: ['./lista-articoli-pubblicati.page.scss'],
    standalone: true,
    imports: [CommonModule, DecimalPipe, IonContent]
})
export class ListaArticoliPubblicatiPage implements OnInit {
    nomeUtente = '';
    articoli:  ArticoloPubblicatoChair[] = [];
    isEmpty    = false;

    private idConferenza = '';
    private token        = localStorage.getItem('token') ?? '';

    private route    = inject(ActivatedRoute);
    private router   = inject(Router);
    private userSvc  = inject(UserService);
    private chairSvc = inject(DashboardChairService);

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }

        this.idConferenza = this.route.snapshot.queryParamMap.get('id') ?? '';
        if (!this.idConferenza) {
            this.router.navigate(['/dashboard-chair']);
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
        this.chairSvc.getArticoliPubblicati(this.token, this.idConferenza).subscribe({
            next: (data) => {
                this.articoli = data.articoli;
                this.isEmpty  = data.articoli.length === 0;
            },
            error: () => { this.clearAndRedirect(); }
        });
    }

    goBack(): void {
        this.router.navigate(['/gestione-conferenza'], { queryParams: { id: this.idConferenza } });
    }

    private clearAndRedirect(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth']);
    }
}

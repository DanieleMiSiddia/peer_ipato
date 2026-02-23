import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { DashboardEditoreService, RevisioneEditore } from '../../services/dashboard-editore.service';

@Component({
    selector: 'app-visualizza-revisioni',
    templateUrl: './visualizza-revisioni.page.html',
    styleUrls: ['./visualizza-revisioni.page.scss'],
    standalone: true,
    imports: [CommonModule, IonContent]
})
export class VisualizzaRevisioniPage implements OnInit {
    nomeUtente  = '';
    revisioni:  RevisioneEditore[] = [];
    isEmpty     = false;

    private idArticolo   = '';
    private idConferenza = '';
    private from         = '';
    private token      = localStorage.getItem('token') ?? '';

    private route      = inject(ActivatedRoute);
    private router     = inject(Router);
    private userSvc    = inject(UserService);
    private editoreSvc = inject(DashboardEditoreService);

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }

        this.idArticolo   = this.route.snapshot.queryParamMap.get('idArticolo')   ?? '';
        this.idConferenza = this.route.snapshot.queryParamMap.get('idConferenza') ?? '';
        this.from         = this.route.snapshot.queryParamMap.get('from')         ?? '';

        if (!this.idArticolo) {
            this.router.navigate(['/dashboard-editore']);
            return;
        }

        this.caricaProfilo();
        this.caricaRevisioni();
    }

    caricaProfilo(): void {
        this.userSvc.getProfilo(this.token).subscribe({
            next:  (data) => { this.nomeUtente = data.utente.nome + ' ' + data.utente.cognome; },
            error: ()     => { this.clearAndRedirect(); }
        });
    }

    caricaRevisioni(): void {
        this.editoreSvc.getRevisioni(this.token, this.idArticolo).subscribe({
            next: (data) => {
                this.revisioni = data.revisioni;
                this.isEmpty   = data.revisioni.length === 0;
            },
            error: () => { this.clearAndRedirect(); }
        });
    }

    goBack(): void {
        if (this.from === 'editore') {
            this.router.navigate(['/lista-articoli-editore'], {
                queryParams: { id: this.idConferenza }
            });
        } else {
            this.router.navigate(['/dashboard-editore']);
        }
    }

    private clearAndRedirect(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth']);
    }
}

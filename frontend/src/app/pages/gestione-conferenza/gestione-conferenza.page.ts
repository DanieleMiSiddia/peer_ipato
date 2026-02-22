import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { DashboardChairService } from '../../services/dashboard-chair.service';

@Component({
    selector: 'app-gestione-conferenza',
    templateUrl: './gestione-conferenza.page.html',
    styleUrls: ['./gestione-conferenza.page.scss'],
    standalone: true,
    imports: [CommonModule, IonContent]
})
export class GestioneConferenzaPage implements OnInit {
    nomeConferenza = '...';
    idConferenza   = '';

    private token = localStorage.getItem('token') ?? '';

    constructor(
        private chairService: DashboardChairService,
        private router:       Router,
        private route:        ActivatedRoute
    ) {}

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }

        this.idConferenza = this.route.snapshot.queryParamMap.get('id') ?? '';
        if (!this.idConferenza) { this.router.navigate(['/dashboard-chair']); return; }

        this.caricaConferenza();
    }

    caricaConferenza(): void {
        this.chairService.getConferenza(this.token, this.idConferenza).subscribe({
            next:  (data) => { this.nomeConferenza = data.conferenza.nome; },
            error: ()     => { this.router.navigate(['/dashboard-chair']); }
        });
    }

    goToInserisciMembro(): void {
        this.router.navigate(['/aggiungi-membro-pc'], { queryParams: { id: this.idConferenza } });
    }

    goToInserisciChair(): void {
        this.router.navigate(['/aggiungi-co-chair'], { queryParams: { id: this.idConferenza } });
    }

    goBack(): void {
        this.router.navigate(['/dashboard-chair']);
    }
}

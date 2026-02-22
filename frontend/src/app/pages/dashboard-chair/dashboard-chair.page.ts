import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { DashboardChairService, ConferenzaItem } from '../../services/dashboard-chair.service';

@Component({
    selector: 'app-dashboard-chair',
    templateUrl: './dashboard-chair.page.html',
    styleUrls: ['./dashboard-chair.page.scss'],
    standalone: true,
    imports: [CommonModule, RouterLink, IonContent]
})
export class DashboardChairPage implements OnInit {
    nomeUtente = '';
    conferenze: ConferenzaItem[] = [];
    isEmpty    = false;

    private token = localStorage.getItem('token') ?? '';

    readonly STATO_CLASSE: Record<string, string> = {
        'Fase Sottomissione': 'dot-yellow',
        'Fase Revisione':     'dot-green',
        'Fase Pubblicazione': 'dot-blue'
    };

    constructor(
        private userService:  UserService,
        private authService:  AuthService,
        private chairService: DashboardChairService,
        private router:       Router
    ) {}

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }
        this.caricaProfilo();
        this.caricaConferenze();
    }

    caricaProfilo(): void {
        this.userService.getProfilo(this.token).subscribe({
            next:  (data) => { this.nomeUtente = data.utente.nome + ' ' + data.utente.cognome; },
            error: ()     => { this.clearAndRedirect(); }
        });
    }

    caricaConferenze(): void {
        this.chairService.getConferenze(this.token).subscribe({
            next: (data) => {
                this.conferenze = data.conferenze;
                this.isEmpty    = data.conferenze.length === 0;
            },
            error: () => { this.clearAndRedirect(); }
        });
    }

    goToGestisci(id: string): void {
        this.router.navigate(['/gestione-conferenza'], { queryParams: { id } });
    }

    goToCreaConferenza(): void {
        this.router.navigate(['/crea-conferenza']);
    }

    logout(): void {
        this.authService.logout(this.token).subscribe({
            complete: () => this.clearAndRedirect(),
            error:    () => this.clearAndRedirect()
        });
    }

    private clearAndRedirect(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth']);
    }
}

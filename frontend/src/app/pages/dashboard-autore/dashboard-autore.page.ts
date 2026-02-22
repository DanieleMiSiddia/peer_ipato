import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { DashboardAutoreService, ConferenzaSottomissione } from '../../services/dashboard-autore.service';

@Component({
    selector: 'app-dashboard-autore',
    templateUrl: './dashboard-autore.page.html',
    styleUrls: ['./dashboard-autore.page.scss'],
    standalone: true,
    imports: [CommonModule, RouterLink, IonContent]
})
export class DashboardAutorePage implements OnInit {
    nomeUtente = '';
    conferenze: ConferenzaSottomissione[] = [];
    isEmpty    = false;

    private token = localStorage.getItem('token') ?? '';

    constructor(
        private userService:   UserService,
        private authService:   AuthService,
        private autoreService: DashboardAutoreService,
        private router:        Router
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
        this.autoreService.getConferenze(this.token).subscribe({
            next: (data) => {
                this.conferenze = data.conferenze;
                this.isEmpty    = data.conferenze.length === 0;
            },
            error: () => { this.clearAndRedirect(); }
        });
    }

    formatData(iso: string): string {
        const d  = new Date(iso);
        const gg = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${gg}/${mm}/${d.getFullYear()}`;
    }

    goToSottomissione(id: string): void {
        this.router.navigate(['/sottomissione-articolo'], { queryParams: { id } });
    }

    goToListaArticoli(): void {
        this.router.navigate(['/lista-articoli-sottomessi']);
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

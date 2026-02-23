import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { DashboardRevisoreService, ArticoloAssegnato } from '../../services/dashboard-revisore.service';

@Component({
    selector: 'app-dashboard-revisore',
    templateUrl: './dashboard-revisore.page.html',
    styleUrls: ['./dashboard-revisore.page.scss'],
    standalone: true,
    imports: [CommonModule, RouterLink, IonContent]
})
export class DashboardRevisorePage implements OnInit {
    nomeUtente = '';
    articoli:  ArticoloAssegnato[] = [];
    isEmpty    = false;

    private token = localStorage.getItem('token') ?? '';

    constructor(
        private userService:     UserService,
        private authService:     AuthService,
        private revisoreService: DashboardRevisoreService,
        private router:          Router
    ) {}

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }
        this.caricaProfilo();
        this.caricaArticoli();
    }

    caricaProfilo(): void {
        this.userService.getProfilo(this.token).subscribe({
            next:  (data) => { this.nomeUtente = data.utente.nome + ' ' + data.utente.cognome; },
            error: ()     => { this.clearAndRedirect(); }
        });
    }

    caricaArticoli(): void {
        this.revisoreService.getArticoliAssegnati(this.token).subscribe({
            next: (data) => {
                this.articoli = data.articoli;
                this.isEmpty  = data.articoli.length === 0;
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

    getBadgeSorgente(sorgente: 'Assegnazione' | 'Offerta'): string {
        return sorgente === 'Offerta' ? 'badge-blue' : 'badge-purple';
    }

    goToMembroPC(): void {
        this.router.navigate(['/dashboard-membro-pc']);
    }

    goToScheda(idArticolo: string): void {
        this.router.navigate(['/scheda-revisione'], {
            queryParams: { idArticolo, from: 'revisore' }
        });
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

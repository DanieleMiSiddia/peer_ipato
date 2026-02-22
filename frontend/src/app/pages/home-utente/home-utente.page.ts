import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-home-utente',
    templateUrl: './home-utente.page.html',
    styleUrls: ['./home-utente.page.scss'],
    standalone: true,
    imports: [CommonModule, RouterLink, IonContent]
})
export class HomeUtentePage implements OnInit {
    nomeUtente = '';
    private token = localStorage.getItem('token') ?? '';

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        if (!this.token) {
            this.router.navigate(['/auth']);
            return;
        }
        this.caricaProfilo();
    }

    caricaProfilo(): void {
        this.userService.getProfilo(this.token).subscribe({
            next: (data) => { this.nomeUtente = data.utente.nome; },
            error: ()     => { this.clearAndRedirect(); }
        });
    }

    goToDashboard(): void {
        this.userService.getDashboardUrl(this.token).subscribe({
            next:  (data) => { this.router.navigate([this.mapDashboardUrl(data.dashboardUrl)]); },
            error: ()     => { this.clearAndRedirect(); }
        });
    }

    logout(): void {
        this.authService.logout(this.token).subscribe({
            complete: () => this.clearAndRedirect(),
            error:    () => this.clearAndRedirect()
        });
    }

    private mapDashboardUrl(url: string): string {
        if (url.includes('DashboardAutore'))   return '/dashboard-autore';
        if (url.includes('DashboardRevisore')) return '/dashboard-revisore';
        if (url.includes('DashboardMembroPC')) return '/dashboard-membro-pc';
        if (url.includes('DashboardChair'))    return '/dashboard-chair';
        if (url.includes('DashboardEditore'))  return '/dashboard-editore';
        return '/home-utente';
    }

    private clearAndRedirect(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth']);
    }
}

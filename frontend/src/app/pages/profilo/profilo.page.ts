import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';

const ROLE_MAP: Record<string, string> = {
    'chair':    'Chair',
    'autore':   'Autore',
    'revisore': 'Revisore',
    'editore':  'Editore'
};

@Component({
    selector: 'app-profilo',
    templateUrl: './profilo.page.html',
    styleUrls: ['./profilo.page.scss'],
    standalone: true,
    imports: [CommonModule, IonContent]
})
export class ProfiloPage implements OnInit {
    nome       = '---';
    cognome    = '---';
    email      = '---';
    ruolo      = '---';
    competenza: string | null = null;

    private token = localStorage.getItem('token') ?? '';

    constructor(private userService: UserService, private router: Router) {}

    ngOnInit(): void {
        if (!this.token) { this.router.navigate(['/auth']); return; }
        this.caricaProfilo();
    }

    caricaProfilo(): void {
        this.userService.getProfilo(this.token).subscribe({
            next: (data) => {
                const u = data.utente;
                this.nome       = u.nome;
                this.cognome    = u.cognome;
                this.email      = u.email;
                this.ruolo      = ROLE_MAP[u.role] ?? u.role;
                this.competenza = u.competenza;
            },
            error: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                this.router.navigate(['/auth']);
            }
        });
    }

    goToModificaPassword(): void { this.router.navigate(['/modifica-password']); }
    goToModificaEmail():    void { this.router.navigate(['/modifica-email']); }
    goBack():               void { this.router.navigate(['/home-utente']); }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-modifica-email',
    templateUrl: './modifica-email.page.html',
    styleUrls: ['./modifica-email.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent]
})
export class ModificaEmailPage {
    nuovaEmail  = '';
    messaggio   = '';
    tipoMsg: 'success' | 'error' | '' = '';
    loading     = false;

    private token = localStorage.getItem('token') ?? '';

    constructor(private userService: UserService, private router: Router) {
        if (!this.token) this.router.navigate(['/auth']);
    }

    get emailValida(): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.nuovaEmail.trim());
    }

    submit(): void {
        this.messaggio = '';
        this.tipoMsg   = '';

        if (!this.emailValida) {
            this.messaggio = 'Inserisci un indirizzo email valido.';
            this.tipoMsg   = 'error';
            return;
        }

        this.loading = true;

        this.userService.modificaEmail(this.token, this.nuovaEmail.trim()).subscribe({
            next: () => {
                this.messaggio = 'Email cambiata correttamente! Reindirizzamento...';
                this.tipoMsg   = 'success';
                setTimeout(() => this.router.navigate(['/profilo']), 1500);
            },
            error: (err) => {
                if (err.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    this.router.navigate(['/auth']);
                    return;
                }
                this.messaggio = err.error?.message || 'Errore durante l\'operazione.';
                this.tipoMsg   = 'error';
                this.loading   = false;
            }
        });
    }

    annulla(): void { this.router.navigate(['/profilo']); }
}

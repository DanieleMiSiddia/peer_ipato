import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-modifica-password',
    templateUrl: './modifica-password.page.html',
    styleUrls: ['./modifica-password.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent]
})
export class ModificaPasswordPage {
    vecchiaPassword  = '';
    nuovaPassword    = '';
    confermaPassword = '';
    messaggio        = '';
    tipoMsg: 'success' | 'error' | '' = '';
    loading          = false;

    private token = localStorage.getItem('token') ?? '';

    constructor(private userService: UserService, private router: Router) {
        if (!this.token) this.router.navigate(['/auth']);
    }

    submit(): void {
        this.messaggio = '';
        this.tipoMsg   = '';

        if (this.nuovaPassword.length < 6) {
            this.messaggio = 'La password deve avere almeno 6 caratteri.';
            this.tipoMsg   = 'error';
            return;
        }
        if (this.nuovaPassword !== this.confermaPassword) {
            this.messaggio = 'Le due password non coincidono.';
            this.tipoMsg   = 'error';
            return;
        }

        this.loading = true;

        this.userService.modificaPassword(this.token, this.vecchiaPassword, this.nuovaPassword).subscribe({
            next: () => {
                this.messaggio = 'Password aggiornata con successo! Reindirizzamento...';
                this.tipoMsg   = 'success';
                setTimeout(() => this.router.navigate(['/profilo']), 1500);
            },
            error: (err) => {
                if (err.status === 401) {
                    this.messaggio = 'Password attuale non corretta.';
                    this.tipoMsg   = 'error';
                    this.loading   = false;
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

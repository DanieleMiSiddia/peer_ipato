import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

const ROLE_MAP: Record<string, string> = {
    'Chair':    'chair',
    'Autore':   'autore',
    'Revisore': 'revisore',
    'Editore':  'editore'
};

@Component({
    selector: 'app-registrazione',
    templateUrl: './registrazione.page.html',
    styleUrls: ['./registrazione.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonContent, RouterLink]
})
export class RegistrazionePage {
    nome             = '';
    cognome          = '';
    email            = '';
    ruolo            = '';
    competenze       = '';
    password         = '';
    confPassword     = '';
    showPassword     = false;
    showConfPassword = false;
    messaggio        = '';
    tipoMsg: 'success' | 'error' | '' = '';
    loading          = false;

    constructor(private authService: AuthService, private router: Router) {}

    submit(): void {
        this.messaggio = '';
        this.tipoMsg   = '';

        if (!this.nome || !this.cognome || !this.email || !this.ruolo || !this.password || !this.confPassword) {
            this.messaggio = 'Tutti i campi obbligatori devono essere compilati.';
            this.tipoMsg   = 'error';
            return;
        }
        if (this.password !== this.confPassword) {
            this.messaggio = 'Le password non coincidono.';
            this.tipoMsg   = 'error';
            return;
        }

        this.loading = true;

        this.authService.register({
            nome:       this.nome,
            cognome:    this.cognome,
            email:      this.email,
            password:   this.password,
            role:       ROLE_MAP[this.ruolo],
            competenza: this.competenze.trim() || null
        }).subscribe({
            next: () => {
                this.messaggio = 'Registrazione completata! Reindirizzamento al login...';
                this.tipoMsg   = 'success';
                setTimeout(() => this.router.navigate(['/auth']), 1500);
            },
            error: (err) => {
                this.messaggio = err.error?.message || 'Errore di connessione al server.';
                this.tipoMsg   = 'error';
                this.loading   = false;
            }
        });
    }
}

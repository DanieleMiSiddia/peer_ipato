import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonInput, IonButton } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, IonContent, IonInput, IonButton]
})
export class AuthPage {
    email    = '';
    password = '';
    loading        = false;
    errorMessage   = '';
    successMessage = '';

    constructor(private authService: AuthService, private router: Router) {}

    onLogin(): void {
        this.loading        = true;
        this.errorMessage   = '';
        this.successMessage = '';

        this.authService.login(this.email, this.password).subscribe({
            next: (data) => {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.successMessage = 'Login effettuato! Reindirizzamento...';
                setTimeout(() => this.router.navigate(['/home-utente']), 1000);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Errore di connessione al server';
                this.loading = false;
            }
        });
    }
}

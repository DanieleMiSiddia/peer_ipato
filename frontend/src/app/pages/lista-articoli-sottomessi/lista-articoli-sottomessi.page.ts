import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { ArticoloService, ArticoloItem } from '../../services/articolo.service';

const STATO_BADGE: Record<string, { label: string; classe: string }> = {
    'SOTTOMESSO':     { label: 'Sottomesso',   classe: 'badge-yellow' },
    'IN_REVISIONE_F': { label: 'In Revisione', classe: 'badge-blue'   },
    'SOTTOMESSO_F':   { label: 'In Revisione', classe: 'badge-blue'   },
    'ACCETTATO':      { label: 'Accettato',    classe: 'badge-green'  },
    'RIFIUTATO':      { label: 'Rifiutato',    classe: 'badge-red'    },
};

@Component({
    selector: 'app-lista-articoli-sottomessi',
    templateUrl: './lista-articoli-sottomessi.page.html',
    styleUrls: ['./lista-articoli-sottomessi.page.scss'],
    standalone: true,
    imports: [CommonModule, IonContent]
})
export class ListaArticoliSottomessiPage implements OnInit {
    nomeUtente  = '';
    articoli:   ArticoloItem[] = [];
    isEmpty     = false;
    errorMsg    = '';

    // Overlay conferma eliminazione
    articoloDaEliminare: ArticoloItem | null = null;
    deleteLoading = false;

    private token = localStorage.getItem('token') ?? '';

    constructor(
        private userService:    UserService,
        private articoloService: ArticoloService,
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
        this.articoloService.getMiei(this.token).subscribe({
            next: (data) => {
                this.articoli = data.articoli;
                this.isEmpty  = data.articoli.length === 0;
            },
            error: () => { this.clearAndRedirect(); }
        });
    }

    getStatoBadge(stato: string): { label: string; classe: string } {
        return STATO_BADGE[stato] ?? { label: stato, classe: 'badge-yellow' };
    }

    chiediConfermaElimina(art: ArticoloItem): void {
        this.errorMsg            = '';
        this.articoloDaEliminare = art;
    }

    annullaElimina(): void {
        this.articoloDaEliminare = null;
    }

    confermaElimina(): void {
        if (!this.articoloDaEliminare) return;
        this.deleteLoading = true;

        this.articoloService.elimina(this.token, this.articoloDaEliminare.id_articolo).subscribe({
            next: () => {
                this.articoli            = this.articoli.filter(a => a.id_articolo !== this.articoloDaEliminare!.id_articolo);
                this.isEmpty             = this.articoli.length === 0;
                this.articoloDaEliminare = null;
                this.deleteLoading       = false;
            },
            error: (err) => {
                this.articoloDaEliminare = null;
                this.deleteLoading       = false;
                this.errorMsg = err.error?.message ?? 'Impossibile eliminare l\'articolo. Riprova.';
            }
        });
    }

    goBack(): void { this.router.navigate(['/dashboard-autore']); }

    private clearAndRedirect(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth']);
    }
}

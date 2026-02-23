import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then(m => m.AuthPage),
  },
  {
    path: 'home-utente',
    loadComponent: () => import('./pages/home-utente/home-utente.page').then(m => m.HomeUtentePage),
  },
  {
    path: 'dashboard-chair',
    loadComponent: () => import('./pages/dashboard-chair/dashboard-chair.page').then(m => m.DashboardChairPage),
  },
  {
    path: 'crea-conferenza',
    loadComponent: () => import('./pages/crea-conferenza/crea-conferenza.page').then(m => m.CreaConferenzaPage),
  },
  {
    path: 'gestione-conferenza',
    loadComponent: () => import('./pages/gestione-conferenza/gestione-conferenza.page').then(m => m.GestioneConferenzaPage),
  },
  {
    path: 'aggiungi-membro-pc',
    loadComponent: () => import('./pages/aggiungi-membro-pc/aggiungi-membro-pc.page').then(m => m.AggiungiMembroPCPage),
  },
  {
    path: 'aggiungi-co-chair',
    loadComponent: () => import('./pages/aggiungi-co-chair/aggiungi-co-chair.page').then(m => m.AggiungiCoChairPage),
  },
  {
    path: 'profilo',
    loadComponent: () => import('./pages/profilo/profilo.page').then(m => m.ProfiloPage),
  },
  {
    path: 'modifica-email',
    loadComponent: () => import('./pages/modifica-email/modifica-email.page').then(m => m.ModificaEmailPage),
  },
  {
    path: 'modifica-password',
    loadComponent: () => import('./pages/modifica-password/modifica-password.page').then(m => m.ModificaPasswordPage),
  },
  {
    path: 'lista-articoli-sottomessi',
    loadComponent: () => import('./pages/lista-articoli-sottomessi/lista-articoli-sottomessi.page').then(m => m.ListaArticoliSottomessiPage),
  },
  {
    path: 'sottomissione-articolo',
    loadComponent: () => import('./pages/sottomissione-articolo/sottomissione-articolo.page').then(m => m.SottomissioneArticoloPage),
  },
  {
    path: 'dashboard-autore',
    loadComponent: () => import('./pages/dashboard-autore/dashboard-autore.page').then(m => m.DashboardAutorePage),
  },
  {
    path: 'registrazione',
    loadComponent: () => import('./pages/registrazione/registrazione.page').then(m => m.RegistrazionePage),
  },
  {
    path: 'dashboard-revisore',
    loadComponent: () => import('./pages/dashboard-revisore/dashboard-revisore.page').then(m => m.DashboardRevisorePage),
  },
  {
    path: 'dashboard-membro-pc',
    loadComponent: () => import('./pages/dashboard-membro-pc/dashboard-membro-pc.page').then(m => m.DashboardMembroPCPage),
  },
  {
    path: 'lista-articoli-pc',
    loadComponent: () => import('./pages/lista-articoli-pc/lista-articoli-pc.page').then(m => m.ListaArticoliPCPage),
  },
  {
    path: 'assegna-sotto-revisore',
    loadComponent: () => import('./pages/assegna-sotto-revisore/assegna-sotto-revisore.page').then(m => m.AssegnaSottoRevisorePage),
  },
  {
    path: 'scheda-revisione',
    loadComponent: () => import('./pages/scheda-revisione/scheda-revisione.page').then(m => m.SchedaRevisionePage),
  },
  {
    path: 'dashboard-editore',
    loadComponent: () => import('./pages/dashboard-editore/dashboard-editore.page').then(m => m.DashboardEditorePage),
  },
  {
    path: 'lista-articoli-editore',
    loadComponent: () => import('./pages/lista-articoli-editore/lista-articoli-editore.page').then(m => m.ListaArticoliEditorePage),
  },
  {
    path: 'visualizza-revisioni',
    loadComponent: () => import('./pages/visualizza-revisioni/visualizza-revisioni.page').then(m => m.VisualizzaRevisioniPage),
  },
  {
    path: 'lista-articoli-pubblicati',
    loadComponent: () => import('./pages/lista-articoli-pubblicati/lista-articoli-pubblicati.page').then(m => m.ListaArticoliPubblicatiPage),
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];

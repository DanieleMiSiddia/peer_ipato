import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConferenzaEditore {
    id_conferenza:       string;
    nome:                string;
    data_fine_conferenza: string;
}

export interface ArticoloEditore {
    id_articolo: string;
    titolo:      string;
    media_voti:  number;
}

export interface RevisioneEditore {
    id_review:       string;
    valutazione:     number;
    voto_competenza: number;
    commento:        string;
}

@Injectable({ providedIn: 'root' })
export class DashboardEditoreService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getConferenze(token: string): Observable<{ conferenze: ConferenzaEditore[] }> {
        return this.http.get<{ conferenze: ConferenzaEditore[] }>(
            `${this.apiUrl}/dashboard-editore/conferenze`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }

    getArticoli(token: string, idConferenza: string): Observable<{ articoli: ArticoloEditore[] }> {
        return this.http.get<{ articoli: ArticoloEditore[] }>(
            `${this.apiUrl}/dashboard-editore/conferenze/${idConferenza}/articoli`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }

    getRevisioni(token: string, idArticolo: string): Observable<{ revisioni: RevisioneEditore[] }> {
        return this.http.get<{ revisioni: RevisioneEditore[] }>(
            `${this.apiUrl}/dashboard-editore/articoli/${idArticolo}/revisioni`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }

    pubblica(token: string, idArticolo: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${this.apiUrl}/dashboard-editore/articoli/${idArticolo}/pubblica`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }

    downloadDocumento(token: string, idArticolo: string): Observable<Blob> {
        return this.http.get(
            `${this.apiUrl}/dashboard-editore/articoli/${idArticolo}/documento`,
            {
                headers:      { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            }
        );
    }
}

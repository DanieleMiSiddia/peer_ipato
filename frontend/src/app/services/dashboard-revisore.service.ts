import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ArticoloAssegnato {
    id_articolo:         string;
    titolo:              string;
    stato:               string;
    topic:               string;
    media_voti:          number;
    id_conferenza:       string;
    id_autore:           string;
    metodo_assegnazione: string;
    data_scadenza:       string;
    sorgente:            'Assegnazione' | 'Offerta';
}

@Injectable({ providedIn: 'root' })
export class DashboardRevisoreService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getArticoliAssegnati(token: string): Observable<{ articoli: ArticoloAssegnato[] }> {
        return this.http.get<{ articoli: ArticoloAssegnato[] }>(
            `${this.apiUrl}/dashboard-revisore/articoli-assegnati`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }

    downloadDocumento(token: string, idArticolo: string): Observable<Blob> {
        return this.http.get(
            `${this.apiUrl}/dashboard-revisore/articoli/${idArticolo}/documento`,
            {
                headers:      { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            }
        );
    }

    creaRevisione(
        token:          string,
        id_articolo:    string,
        voto_competenza: number,
        valutazione:    number,
        commento:       string
    ): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${this.apiUrl}/dashboard-revisore/revisioni`,
            { id_articolo, voto_competenza, valutazione, commento },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }
}

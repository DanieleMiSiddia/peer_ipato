import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConferenzaMembroPCItem {
    id_conferenza:       string;
    nome:                string;
    data_fine_revisione: string;
}

export interface ArticoloPC {
    id_articolo:   string;
    titolo:        string;
    stato:         string;
    topic:         string;
    media_voti:    number;
    id_autore:     string;
    id_conferenza: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardMembroPCService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getConferenze(token: string): Observable<{ conferenze: ConferenzaMembroPCItem[] }> {
        return this.http.get<{ conferenze: ConferenzaMembroPCItem[] }>(
            `${this.apiUrl}/dashboard-membro-pc/conferenze`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }

    getArticoli(token: string, idConferenza: string): Observable<{ articoli: ArticoloPC[] }> {
        return this.http.get<{ articoli: ArticoloPC[] }>(
            `${this.apiUrl}/dashboard-membro-pc/conferenze/${idConferenza}/articoli`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }

    assegnaRevisore(token: string, idArticolo: string, emailRevisore: string, idConferenza: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${this.apiUrl}/dashboard-membro-pc/articoli/${idArticolo}/assegna`,
            { email_revisore: emailRevisore, id_conferenza: idConferenza },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }
}

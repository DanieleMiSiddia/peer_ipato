import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConferenzaItem {
    id_conferenza: string;
    nome:          string;
    stato:         string;
}

interface ConferenzeResponse {
    conferenze: ConferenzaItem[];
}

@Injectable({ providedIn: 'root' })
export class DashboardChairService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getConferenze(token: string): Observable<ConferenzeResponse> {
        return this.http.get<ConferenzeResponse>(`${this.apiUrl}/dashboard-chair/conferenze`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    getConferenza(token: string, id: string): Observable<{ conferenza: { nome: string } }> {
        return this.http.get<{ conferenza: { nome: string } }>(`${this.apiUrl}/dashboard-chair/conferenze/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    aggiungiMembroPC(token: string, idConferenza: string, email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/dashboard-chair/conferenze/${idConferenza}/membro-pc`, { email }, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
    }

    aggiungiCoChair(token: string, idConferenza: string, email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/dashboard-chair/conferenze/${idConferenza}/co-chair`, { email }, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
    }

    creaConferenza(token: string, body: object): Observable<{ id_conferenza: string }> {
        return this.http.post<{ id_conferenza: string }>(`${this.apiUrl}/dashboard-chair/conferenze`, body, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
    }
}

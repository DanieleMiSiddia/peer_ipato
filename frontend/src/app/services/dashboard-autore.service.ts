import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConferenzaSottomissione {
    id_conferenza:           string;
    nome:                    string;
    data_fine_sottomissione: string;
    topic:                   string;
}

@Injectable({ providedIn: 'root' })
export class DashboardAutoreService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getConferenze(token: string): Observable<{ conferenze: ConferenzaSottomissione[] }> {
        return this.http.get<{ conferenze: ConferenzaSottomissione[] }>(
            `${this.apiUrl}/dashboard-autore/conferenze`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }
}

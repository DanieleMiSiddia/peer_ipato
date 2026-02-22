import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProfiloResponse {
    utente: {
        nome:       string;
        cognome:    string;
        email:      string;
        role:       string;
        competenza: string | null;
    };
}

interface DashboardResponse {
    dashboardUrl: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getProfilo(token: string): Observable<ProfiloResponse> {
        return this.http.get<ProfiloResponse>(`${this.apiUrl}/homepage/profilo`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    getDashboardUrl(token: string): Observable<DashboardResponse> {
        return this.http.get<DashboardResponse>(`${this.apiUrl}/homepage/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    modificaEmail(token: string, nuova_email: string): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.apiUrl}/utente/email`,
            { nuova_email },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }

    modificaPassword(token: string, vecchia_password: string, nuova_password: string): Observable<{ message: string }> {
        return this.http.put<{ message: string }>(`${this.apiUrl}/utente/modificaPassword`,
            { vecchia_password, nuova_password },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    }
}

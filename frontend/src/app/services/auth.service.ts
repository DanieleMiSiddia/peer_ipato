import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
    token: string;
    user: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password });
    }

    logout(token: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    register(body: {
        nome: string; cognome: string; email: string;
        password: string; role: string; competenza: string | null;
    }): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/auth/register`, body);
    }
}

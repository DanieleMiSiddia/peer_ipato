import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ArticoloItem {
    id_articolo:   string;
    titolo:        string;
    topic:         string;
    stato:         string;
    id_conferenza: string;
}

@Injectable({ providedIn: 'root' })
export class ArticoloService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    sottometti(token: string, idConferenza: string, titolo: string, topic: string, file: File): Observable<any> {
        const fd = new FormData();
        fd.append('id_conferenza', idConferenza);
        fd.append('titolo',        titolo);
        fd.append('topic',         topic);
        fd.append('documento',     file);

        // NON impostare Content-Type: il browser lo setta automaticamente
        // con il boundary corretto per multipart/form-data
        return this.http.post(`${this.apiUrl}/articolo`, fd, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    getMiei(token: string): Observable<{ articoli: ArticoloItem[] }> {
        return this.http.get<{ articoli: ArticoloItem[] }>(`${this.apiUrl}/articolo/miei`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    elimina(token: string, idArticolo: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/articolo/${idArticolo}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}

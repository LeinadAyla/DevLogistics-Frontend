import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../environment';

export interface Item {
  id?: number;
  name: string;
  description?: string;
  quantity: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = `${environment.apiBaseUrl}/items`;
  private defaultTimeoutMs = 5000; // 5s

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl).pipe(
      timeout(this.defaultTimeoutMs),
      retry(1),
      catchError(this.handleError)
    );
  }

  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item).pipe(
      timeout(this.defaultTimeoutMs),
      catchError(this.handleError)
    );
  }

  updateItem(id: number, item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, item).pipe(
      timeout(this.defaultTimeoutMs),
      catchError(this.handleError)
    );
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      timeout(this.defaultTimeoutMs),
      catchError(this.handleError)
    );
  }

  private handleError = (error: any) => {
    // Timeout error (RxJS timeout operator throws a TimeoutError instance)
    const errName = (error && (error.name || error.constructor?.name)) as string | undefined;
    if (errName === 'TimeoutError') {
      return throwError(() => ({
        userMessage: 'A requisição excedeu o tempo limite. Tente novamente mais tarde.',
        status: 408,
        original: error
      }));
    }

    // Network or CORS issues typically surface with status === 0 (HttpErrorResponse)
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        // A client-side or network error occurred.
        return throwError(() => ({
          userMessage: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:5000 e se o CORS está configurado.',
          status: 0,
          original: error
        }));
      }

      // Other HTTP error statuses
      const serverMsg = error.error && error.error.error ? error.error.error : error.message;
      return throwError(() => ({
        userMessage: serverMsg || 'Ocorreu um erro ao comunicar com o servidor.',
        status: error.status,
        original: error
      }));
    }

    // Fallback for unknown errors
    return throwError(() => ({
      userMessage: 'Ocorreu um erro inesperado. Veja o console para mais detalhes.',
      status: -1,
      original: error
    }));
  };
}

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const messageService = inject(MessageService);
  const token = auth.getToken();
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(authReq).pipe(
    catchError((err) => {
      const message = err.error?.error || err.message || 'An error occurred';
      messageService.add({ severity: 'error', summary: 'Error', detail: message, life: 4000 });
      return throwError(() => err);
    })
  );
};

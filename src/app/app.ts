import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './partials/shared_modules/toast/toast';
import { AuthService } from './core/_auth/auth.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'voicefirst_admin';

  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.auth.bootstrapSession().pipe(
      catchError(() => of(false))
    ).subscribe();
  }
}

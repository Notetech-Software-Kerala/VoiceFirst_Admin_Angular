import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './partials/shared_modules/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'voicefirst_admin';
}

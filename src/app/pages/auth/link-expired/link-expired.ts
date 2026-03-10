import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-link-expired',
  imports: [],
  templateUrl: './link-expired.html',
  styleUrl: './link-expired.css',
})
export class LinkExpired {
constructor(private router:Router) { }

  backToLogin() {
   this.router.navigate(['/login']);
  }

  requestLink() {

  }
}

import { Component } from '@angular/core';
import { WebMenu } from './web-menu/web-menu';
import { AppMenu } from './app-menu/app-menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Location } from '@angular/common';
@Component({
  selector: 'app-configure-menu',
  imports: [AppMenu, WebMenu, MatIconModule, MatButtonModule],
  templateUrl: './configure-menu.html',
  styleUrl: './configure-menu.css',
})
export class ConfigureMenu {



  constructor(
    private location: Location
  ) { }
  goBack() {
    this.location.back();
  }
}

import { Component } from '@angular/core';
import { WebMenu } from './web-menu/web-menu';
import { AppMenu } from './app-menu/app-menu';

@Component({
  selector: 'app-configure-menu',
  imports: [AppMenu, WebMenu],
  templateUrl: './configure-menu.html',
  styleUrl: './configure-menu.css',
})
export class ConfigureMenu {

}

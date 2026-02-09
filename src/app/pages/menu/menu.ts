import { Component } from '@angular/core';
import { WebMenu } from "./web-menu/web-menu";

@Component({
  selector: 'app-menu',
  imports: [WebMenu],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {

}

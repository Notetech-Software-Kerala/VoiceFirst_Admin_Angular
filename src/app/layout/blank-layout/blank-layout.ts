import { Component, Inject, OnInit, Renderer2, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-blank-layout',
  imports: [RouterOutlet],
  templateUrl: './blank-layout.html',
  styleUrl: './blank-layout.css',
})
export class BlankLayout implements OnInit {

  private renderer = inject(Renderer2);

  ngOnInit(): void {
    // Load saved theme or system preference
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    const isDarkTheme = saved ? saved === 'dark' : prefersDark;

    // Apply theme to body
    if (isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

}

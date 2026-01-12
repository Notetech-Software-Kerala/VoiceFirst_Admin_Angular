import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, ElementRef, inject, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, shareReplay, Subject, takeUntil } from 'rxjs';
import { ConfirmDialog } from '../../partials/shared_modules/confirm-dialog/confirm-dialog';
import { MENU_CONFIG, MenuItem } from '../../core/_config/menuConfig';

@Component({
  selector: 'app-base-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './base-layout.html',
  styleUrl: './base-layout.css',
})
export class BaseLayout {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  private router = inject(Router);
  private bpo = inject(BreakpointObserver);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  isHandset$ = this.bpo.observe('(max-width: 768px)')
    .pipe(map(state => state.matches), shareReplay(1));


  isSidebarCollapsed = true;           // collapsed on mobile by default
  isDarkTheme = false;                 // updated from saved/system pref

  private renderer = inject(Renderer2);

  openSubmenus = new Set<number>();

  menu: MenuItem[] = MENU_CONFIG;

  ngOnInit(): void {
    // Load saved theme or system preference
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    this.isDarkTheme = saved ? saved === 'dark' : prefersDark;

    // Apply theme to body
    this.applyBodyThemeClass();

    // Expand sidebar by default on large screens
    if (window.innerWidth > 768) {
      this.isSidebarCollapsed = false;
    }

    this.menu.forEach(item => {
      if (item.children?.length && this.isGroupActive(item)) {
        this.openSubmenus.add(item.id);
      }
    });

    // Keep submenus in sync when route changes
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.menu.forEach(item => {
        if (!item.children?.length) return;
        if (this.isGroupActive(item)) this.openSubmenus.add(item.id);
        else this.openSubmenus.delete(item.id);
      });
    });

    this.bpo.observe('(max-width: 768px)')
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        // collapse on small screens, expand on large
        this.isSidebarCollapsed = result.matches ? true : false;
      });

    // auto-collapse after navigation on small screens
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const isSmall = this.bpo.isMatched('(max-width: 768px)');
        if (isSmall) this.isSidebarCollapsed = true;
      });
  }

  get logoSrc(): string {
    const dark = this.isDarkTheme;
    const collapsed = this.isSidebarCollapsed;

    // adjust filenames to match your assets
    if (collapsed && dark) return '/images/logos/logo.png';
    if (collapsed && !dark) return '/images/logos/logo.png';
    if (!collapsed && dark) return '/images/logos/voicefirst_logo_light.png';
    return '/images/logos/voicefirst_logo.png';
  }

  get logoAlt(): string {
    const size = this.isSidebarCollapsed ? 'compact' : 'full';
    const theme = this.isDarkTheme ? 'dark' : 'light';
    return `Logo ${size} ${theme}`;
  }


  isGroupActive(item: MenuItem): boolean {
    if (!item.children?.length) return false;
    return item.children.some(child => {
      if (!child.route) return false;
      return this.router.isActive(child.route, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  expandAndFocusSearch(): void {
    if (this.isSidebarCollapsed && window.innerWidth <= 768) {
      // On small screens we slide-in first
      this.isSidebarCollapsed = false;
      setTimeout(() => this.searchInput?.nativeElement.focus(), 250);
    } else if (this.isSidebarCollapsed === true) {
      // On desktop, just expand and focus
      this.isSidebarCollapsed = false;
      setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
    } else {
      // Already expanded — just focus
      this.searchInput?.nativeElement.focus();
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    this.applyBodyThemeClass();
  }

  private applyBodyThemeClass(): void {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  // Toggle one submenu; auto-expand sidebar if currently collapsed
  toggleSubmenu(id: number): void {
    if (this.isSidebarCollapsed) this.isSidebarCollapsed = false;
    this.openSubmenus.has(id) ? this.openSubmenus.delete(id) : this.openSubmenus.add(id);
  }

  // Optional "accordion" behavior (close others)
  toggleSubmenuAccordion(id: number): void {
    if (this.isSidebarCollapsed) { this.isSidebarCollapsed = false; }
    if (this.openSubmenus.has(id)) this.openSubmenus.clear();
    else { this.openSubmenus.clear(); this.openSubmenus.add(id); }
  }

  isOpen(id: number): boolean { return this.openSubmenus.has(id); }

  // Keyboard support for buttons that act like disclosure controls
  onDisclosureKeydown(e: KeyboardEvent, id: number, accordion = false): void {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggleSubmenu(id); }
  }

  onLogout() {
    const ref = this.dialog.open(ConfirmDialog, {
      panelClass: 'modern-confirm-panel',
      autoFocus: false,           // keep focus on buttons
      data: {
        icon: 'logout',
        tone: 'accent',             // 'warn' | 'accent' | 'neutral'
        title: 'Logout',
        message: `Are you sure you want to logout?`,
        confirmText: 'Logout',
        cancelText: 'Cancel',
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (ok) {
        // perform delete...
        this.router.navigate(['/login']);
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../core/auth/auth.service';
import { TaskService } from '../../shared/services/task.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    RippleModule,
  ],
  template: `
    <div class="layout" [class.sidebar-open]="sidebarOpen">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1 class="app-title">Moe Zaky's Tasks</h1>
          <button
            pButton
            pRipple
            icon="pi pi-times"
            class="sidebar-close p-button-text p-button-rounded"
            (click)="sidebarOpen = false"
            aria-label="Close menu"
          ></button>
        </div>
        <nav class="sidebar-nav">
          <a pButton pRipple routerLink="/board" routerLinkActive="active" class="p-button-text" (click)="closeSidebarOnNav()">
            <i class="pi pi-calendar"></i>
            <span>Board</span>
          </a>
          <a pButton pRipple routerLink="/dashboard" routerLinkActive="active" class="p-button-text" (click)="closeSidebarOnNav()">
            <i class="pi pi-chart-bar"></i>
            <span>Dashboard</span>
          </a>
          <a pButton pRipple routerLink="/profile" routerLinkActive="active" class="p-button-text" (click)="closeSidebarOnNav()">
            <i class="pi pi-user"></i>
            <span>Profile</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          @if (auth.isLoggedIn()) {
            <span class="username">{{ auth.getUsername() }}</span>
            <button pButton pRipple icon="pi pi-sign-out" (click)="logout()" class="p-button-text p-button-rounded"></button>
          } @else {
            <a pButton pRipple routerLink="/login" class="p-button-text p-button-sm">Login</a>
          }
        </div>
      </aside>
      <div class="sidebar-overlay" (click)="sidebarOpen = false" [class.visible]="sidebarOpen"></div>
      <div class="main">
        <button
          pButton
          pRipple
          icon="pi pi-bars"
          class="sidebar-toggle p-button-text p-button-rounded"
          (click)="sidebarOpen = true"
          aria-label="Open menu"
        ></button>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .layout {
        display: flex;
        min-height: 100vh;
      }
      .sidebar {
        width: var(--app-sidebar-width);
        background: var(--app-nav-bg);
        border-right: 1px solid var(--app-border);
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 1001;
        transition: transform 0.25s ease;
      }
      .sidebar-header {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--app-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .sidebar-close {
        display: none;
      }
      .app-title {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--app-text);
      }
      .sidebar-nav {
        flex: 1;
        padding: 1rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .sidebar-nav a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.65rem 1rem;
        border-radius: 8px;
        color: var(--app-text);
        text-decoration: none;
        transition: background 0.2s, color 0.2s;
      }
      .sidebar-nav a:hover {
        background: var(--app-column-bg);
      }
      .sidebar-nav a.active:hover {
        background: var(--app-accent-bg);
      }
      .sidebar-nav a.active {
        background: var(--app-accent-bg);
        color: var(--app-accent-text);
        font-weight: 600;
        border-left: 3px solid var(--app-accent);
        margin-left: -3px;
        padding-left: calc(1rem + 3px);
      }
      .sidebar-nav a i {
        font-size: 1.1rem;
      }
      .sidebar-footer {
        padding: 1rem 1.25rem;
        border-top: 1px solid var(--app-border);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .sidebar-footer .username {
        flex: 1;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--app-text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .main {
        flex: 1;
        margin-left: var(--app-sidebar-width);
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .sidebar-toggle {
        display: none;
      }
      .content {
        flex: 1;
        padding: 1.5rem 2rem;
        background: var(--app-bg);
        min-height: calc(100vh - 60px);
      }
      .sidebar-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      .sidebar-overlay.visible {
        opacity: 1;
        pointer-events: auto;
      }
      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
          width: min(90vw, 300px);
          padding-bottom: env(safe-area-inset-bottom);
        }
        .layout.sidebar-open .sidebar {
          transform: translateX(0);
        }
        .sidebar-close {
          display: block;
          min-width: 44px;
          min-height: 44px;
        }
        .sidebar-overlay {
          display: block;
        }
        .main {
          margin-left: 0;
        }
        .sidebar-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: max(1rem, env(safe-area-inset-top));
          left: max(1rem, env(safe-area-inset-left));
          z-index: 100;
          min-width: 48px;
          min-height: 48px;
          border-radius: 12px;
          background: var(--app-glass-bg) !important;
          border: var(--app-glass-border) !important;
        }
        .sidebar-header {
          padding: 1rem 1rem;
        }
        .app-title {
          font-size: 1rem;
        }
        .sidebar-nav a {
          padding: 0.85rem 1rem;
          min-height: 48px;
        }
        .sidebar-footer {
          padding: 1rem;
        }
        .content {
          padding: 1rem;
          padding-top: calc(48px + 1rem + env(safe-area-inset-top));
        }
      }
      @media (max-width: 480px) {
        .sidebar {
          width: 100vw;
        }
        .content {
          padding: 0.75rem;
          padding-top: calc(48px + 0.75rem + env(safe-area-inset-top));
        }
        .sidebar-toggle {
          top: max(0.75rem, env(safe-area-inset-top));
          left: max(0.75rem, env(safe-area-inset-left));
        }
      }
    `,
  ],
})
export class LayoutComponent {
  sidebarOpen = false;

  constructor(
    public auth: AuthService,
    private taskService: TaskService,
    private router: Router
  ) {}

  closeSidebarOnNav() {
    this.sidebarOpen = false;
  }

  logout() {
    this.auth.logout();
    this.taskService.clearTasks();
    this.router.navigate(['/login']);
  }
}

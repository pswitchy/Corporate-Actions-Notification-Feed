import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CorporateActionsDashboardComponent } from './components/corporate-actions-dashboard/corporate-actions-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CorporateActionsDashboardComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <app-navbar />
      <main>
        <app-corporate-actions-dashboard />
      </main>
      
      <!-- Footer -->
      <footer class="border-t border-white/10 py-6 mt-8">
        <div class="max-w-7xl mx-auto px-6 text-center">
          <p class="text-slate-500 text-sm">
            © 2026 InvestTrack. Real-Time Corporate Actions Notification Feed Demo
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'Corporate Actions Feed';
}

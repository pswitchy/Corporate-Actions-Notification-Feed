import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, NotificationCenterComponent],
    template: `
    <nav class="sticky top-0 z-40 glass border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <span class="text-xl">📊</span>
            </div>
            <div>
              <h1 class="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                InvestTrack
              </h1>
              <p class="text-[10px] text-slate-500 -mt-0.5">Corporate Actions Feed</p>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center gap-6">
            <a href="#" class="text-sm text-white font-medium hover:text-indigo-400 transition-colors">
              Dashboard
            </a>
            <a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">
              Portfolio
            </a>
            <a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">
              Analytics
            </a>
            <a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">
              Settings
            </a>
          </div>

          <!-- Right Side: Notifications & Profile -->
          <div class="flex items-center gap-4">
            <!-- Notification Center -->
            <app-notification-center />

            <!-- Profile -->
            <div class="flex items-center gap-2 pl-4 border-l border-white/10">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                JD
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-medium text-white">John Doe</p>
                <p class="text-[10px] text-slate-500">Premium</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent { }

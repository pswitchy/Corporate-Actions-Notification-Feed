import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../services/websocket.service';
import { CorporateActionsService } from '../../services/corporate-actions.service';
import { CorporateAction, EventType } from '../../models/corporate-action.model';

@Component({
    selector: 'app-corporate-actions-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
<div class="min-h-screen p-6">
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Corporate Actions Dashboard</h1>
        <p class="text-slate-400 mt-1">Real-time feed of corporate action events</p>
      </div>
      <div class="flex items-center gap-2 px-4 py-2 glass rounded-lg">
        <span class="w-3 h-3 rounded-full animate-pulse" 
              [ngClass]="{'bg-emerald-400': connected(), 'bg-red-400': !connected()}">
        </span>
        <span class="text-sm" 
              [ngClass]="{'text-emerald-400': connected(), 'text-red-400': !connected()}">
          {{ connected() ? 'Live Connected' : 'Disconnected' }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="glass rounded-xl p-4 card-hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-sm">Total Events</p>
            <p class="text-3xl font-bold text-white mt-1">{{ stats().total }}</p>
          </div>
          <div class="text-3xl opacity-50">📈</div>
        </div>
      </div>
      <div class="glass rounded-xl p-4 card-hover border-l-4 border-emerald-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-emerald-400 text-sm">Dividends</p>
            <p class="text-3xl font-bold text-emerald-400 mt-1">{{ stats().dividends }}</p>
          </div>
          <div class="text-3xl">💰</div>
        </div>
      </div>
      <div class="glass rounded-xl p-4 card-hover border-l-4 border-purple-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-400 text-sm">Stock Splits</p>
            <p class="text-3xl font-bold text-purple-400 mt-1">{{ stats().splits }}</p>
          </div>
          <div class="text-3xl">📊</div>
        </div>
      </div>
      <div class="glass rounded-xl p-4 card-hover border-l-4 border-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-400 text-sm">Mergers</p>
            <p class="text-3xl font-bold text-blue-400 mt-1">{{ stats().mergers }}</p>
          </div>
          <div class="text-3xl">🤝</div>
        </div>
      </div>
    </div>

    <div class="glass rounded-xl p-6">
      <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2"><span>🎯</span>Simulate Corporate Action</h2>
      <div class="flex flex-wrap gap-3">
        <button (click)="simulateRandomEvent()" [disabled]="isSimulating()" class="btn btn-primary">🎲 Random Event</button>
        <button (click)="simulateEvent('DIVIDEND')" [disabled]="isSimulating()" class="btn btn-dividend">💰 Dividend</button>
        <button (click)="simulateEvent('STOCK_SPLIT')" [disabled]="isSimulating()" class="btn btn-split">📊 Stock Split</button>
        <button (click)="simulateEvent('MERGER')" [disabled]="isSimulating()" class="btn btn-merger">🤝 Merger</button>
        <button (click)="clearAllEvents()" class="btn btn-ghost ml-auto">🗑️ Clear All</button>
      </div>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto pb-2">
      <button (click)="setFilter('ALL')" 
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200" 
              [ngClass]="{
                'bg-white/20': selectedFilter() === 'ALL',
                'text-white': selectedFilter() === 'ALL',
                'bg-white/5': selectedFilter() !== 'ALL',
                'text-slate-400': selectedFilter() !== 'ALL'
              }">
        All Events
      </button>
      <button (click)="setFilter('DIVIDEND')" 
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200" 
              [ngClass]="{
                'bg-emerald-500/20': selectedFilter() === 'DIVIDEND',
                'text-emerald-400': selectedFilter() === 'DIVIDEND',
                'bg-white/5': selectedFilter() !== 'DIVIDEND',
                'text-slate-400': selectedFilter() !== 'DIVIDEND'
              }">
        💰 Dividends
      </button>
      <button (click)="setFilter('STOCK_SPLIT')" 
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200" 
              [ngClass]="{
                'bg-purple-500/20': selectedFilter() === 'STOCK_SPLIT',
                'text-purple-400': selectedFilter() === 'STOCK_SPLIT',
                'bg-white/5': selectedFilter() !== 'STOCK_SPLIT',
                'text-slate-400': selectedFilter() !== 'STOCK_SPLIT'
              }">
        📊 Stock Splits
      </button>
      <button (click)="setFilter('MERGER')" 
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200" 
              [ngClass]="{
                'bg-blue-500/20': selectedFilter() === 'MERGER',
                'text-blue-400': selectedFilter() === 'MERGER',
                'bg-white/5': selectedFilter() !== 'MERGER',
                'text-slate-400': selectedFilter() !== 'MERGER'
              }">
        🤝 Mergers
      </button>
    </div>

    <div class="space-y-4">
      <div *ngIf="filteredEvents().length === 0" class="glass rounded-xl p-12 text-center">
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-xl font-semibold text-white mb-2">No Events Yet</h3>
        <p class="text-slate-400 mb-6">Click the Simulate Event buttons above to generate corporate action events</p>
        <button (click)="simulateRandomEvent()" class="btn btn-primary">🎲 Generate Random Event</button>
      </div>

      <div *ngFor="let event of filteredEvents(); trackBy: trackByEventId" 
           class="event-card glass animate-slide-in" 
           [ngClass]="getEventCardClass(event.type)">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="text-4xl">{{ getEventIcon(event.type) }}</div>
            <div>
              <span class="badge" [ngClass]="getBadgeClass(event.type)">
                {{ event.type === 'STOCK_SPLIT' ? 'STOCK SPLIT' : event.type }}
              </span>
              <p class="text-xs text-slate-500 mt-1">{{ formatTime(event.announcedAt) }}</p>
            </div>
          </div>
          
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl font-bold text-white">{{ event.ticker }}</span>
              <span class="text-slate-400">|</span>
              <span class="text-slate-300">{{ event.companyName }}</span>
            </div>
            <p class="text-slate-400">{{ event.description }}</p>
          </div>
          
          <div class="text-right">
            <ng-container *ngIf="event.type === 'DIVIDEND' && event.amount">
              <p class="text-2xl font-bold text-emerald-400">\${{ event.amount }}</p>
              <p class="text-xs text-slate-500">per share</p>
            </ng-container>
            <ng-container *ngIf="event.type === 'STOCK_SPLIT' && event.ratio">
              <p class="text-2xl font-bold text-purple-400">{{ event.ratio }}</p>
              <p class="text-xs text-slate-500">split ratio</p>
            </ng-container>
            <ng-container *ngIf="event.type === 'MERGER' && event.targetCompany">
              <p class="text-sm font-medium text-blue-400">{{ event.targetCompany }}</p>
              <p class="text-xs text-slate-500">target company</p>
            </ng-container>
          </div>
          
          <div class="text-right border-l border-white/10 pl-4">
            <p class="text-xs text-slate-500 uppercase">Effective Date</p>
            <p class="text-sm font-medium text-white">{{ formatDate(event.effectiveDate) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    `,
    styles: []
})
export class CorporateActionsDashboardComponent {
    private wsService = inject(WebSocketService);
    private caService = inject(CorporateActionsService);

    readonly events = this.wsService.events;
    readonly connected = this.wsService.connected;
    readonly eventsByType = this.wsService.eventsByType;

    isSimulating = signal(false);
    selectedFilter = signal<EventType | 'ALL'>('ALL');

    readonly filteredEvents = computed(() => {
        const filter = this.selectedFilter();
        let filtered = this.events();
        if (filter !== 'ALL') { filtered = filtered.filter(e => e.type === filter); }
        return [...filtered].sort((a, b) => new Date(b.announcedAt).getTime() - new Date(a.announcedAt).getTime());
    });

    readonly stats = computed(() => ({
        total: this.events().length,
        dividends: this.eventsByType().DIVIDEND.length,
        splits: this.eventsByType().STOCK_SPLIT.length,
        mergers: this.eventsByType().MERGER.length
    }));

    simulateEvent(type?: EventType): void {
        this.isSimulating.set(true);
        this.caService.simulateEvent(type).subscribe({
            next: () => this.isSimulating.set(false),
            error: () => this.isSimulating.set(false)
        });
    }

    simulateRandomEvent(): void { this.simulateEvent(); }
    setFilter(filter: EventType | 'ALL'): void { this.selectedFilter.set(filter); }

    getEventIcon(type: string): string {
        switch (type) { case 'DIVIDEND': return '💰'; case 'STOCK_SPLIT': return '📊'; case 'MERGER': return '🤝'; default: return '📢'; }
    }

    getEventCardClass(type: string): string {
        switch (type) { case 'DIVIDEND': return 'event-dividend'; case 'STOCK_SPLIT': return 'event-split'; case 'MERGER': return 'event-merger'; default: return ''; }
    }

    getBadgeClass(type: string): string {
        switch (type) { case 'DIVIDEND': return 'badge-dividend'; case 'STOCK_SPLIT': return 'badge-split'; case 'MERGER': return 'badge-merger'; default: return ''; }
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    formatTime(dateString: string): string {
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    clearAllEvents(): void {
        this.caService.clearEvents().subscribe({ next: () => window.location.reload() });
    }

    trackByEventId(index: number, event: CorporateAction): string {
        return event.id;
    }
}

import { Injectable, signal, computed } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { CorporateAction } from '../models/corporate-action.model';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private socket: Socket;
    private readonly SERVER_URL = 'http://localhost:3000';

    // Angular Signals for reactive state management
    private _events = signal<CorporateAction[]>([]);
    private _connected = signal<boolean>(false);
    private _connectionError = signal<string | null>(null);

    // Public readonly signals
    readonly events = this._events.asReadonly();
    readonly connected = this._connected.asReadonly();
    readonly connectionError = this._connectionError.asReadonly();

    // Computed signals
    readonly unreadCount = computed(() =>
        this._events().filter(e => !e.read).length
    );

    readonly latestEvents = computed(() =>
        [...this._events()]
            .sort((a, b) => new Date(b.announcedAt).getTime() - new Date(a.announcedAt).getTime())
            .slice(0, 5)
    );

    readonly eventsByType = computed(() => ({
        DIVIDEND: this._events().filter(e => e.type === 'DIVIDEND'),
        STOCK_SPLIT: this._events().filter(e => e.type === 'STOCK_SPLIT'),
        MERGER: this._events().filter(e => e.type === 'MERGER')
    }));

    constructor() {
        this.socket = io(this.SERVER_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true
        });

        this.setupSocketListeners();
    }

    private setupSocketListeners(): void {
        this.socket.on('connect', () => {
            console.log('✅ Connected to WebSocket server');
            this._connected.set(true);
            this._connectionError.set(null);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket server');
            this._connected.set(false);
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔴 Connection error:', error);
            this._connectionError.set('Failed to connect to server');
            this._connected.set(false);
        });

        // Receive initial events on connection
        this.socket.on('initial-events', (events: CorporateAction[]) => {
            console.log(`📦 Received ${events.length} initial events`);
            this._events.set(events);
        });

        // Receive new corporate action events
        this.socket.on('corporate-action', (event: CorporateAction) => {
            console.log('📥 New corporate action:', event);
            this._events.update(events => [...events, event]);
        });

        // Handle event updates
        this.socket.on('event-updated', (update: { id: string; read: boolean }) => {
            this._events.update(events =>
                events.map(e => e.id === update.id ? { ...e, read: update.read } : e)
            );
        });

        // Handle mark all as read
        this.socket.on('all-events-read', () => {
            this._events.update(events => events.map(e => ({ ...e, read: true })));
        });
    }

    // Mark a single event as read
    markAsRead(eventId: string): void {
        this.socket.emit('mark-read', eventId);
        this._events.update(events =>
            events.map(e => e.id === eventId ? { ...e, read: true } : e)
        );
    }

    // Mark all events as read
    markAllAsRead(): void {
        this.socket.emit('mark-all-read');
        this._events.update(events => events.map(e => ({ ...e, read: true })));
    }

    // Reconnect to server
    reconnect(): void {
        if (!this.socket.connected) {
            this.socket.connect();
        }
    }

    // Disconnect from server
    disconnect(): void {
        this.socket.disconnect();
    }
}

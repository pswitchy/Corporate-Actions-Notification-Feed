import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CorporateAction, EventType } from '../models/corporate-action.model';

interface SimulateEventResponse {
    success: boolean;
    message: string;
    event: CorporateAction;
}

interface EventsResponse {
    success: boolean;
    count: number;
    events: CorporateAction[];
}

@Injectable({
    providedIn: 'root'
})
export class CorporateActionsService {
    private readonly API_URL = 'http://localhost:3000/api';
    private http = inject(HttpClient);

    // Simulate a corporate action event
    simulateEvent(type?: EventType): Observable<SimulateEventResponse> {
        return this.http.post<SimulateEventResponse>(
            `${this.API_URL}/simulate-event`,
            type ? { type } : {}
        );
    }

    // Get all events
    getEvents(): Observable<EventsResponse> {
        return this.http.get<EventsResponse>(`${this.API_URL}/events`);
    }

    // Clear all events
    clearEvents(): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(
            `${this.API_URL}/events`
        );
    }
}

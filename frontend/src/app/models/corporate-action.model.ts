export interface CorporateAction {
    id: string;
    type: 'DIVIDEND' | 'STOCK_SPLIT' | 'MERGER';
    ticker: string;
    companyName: string;
    description: string;
    amount?: number;
    ratio?: string;
    targetCompany?: string;
    effectiveDate: string;
    announcedAt: string;
    read: boolean;
}

export type EventType = 'DIVIDEND' | 'STOCK_SPLIT' | 'MERGER';

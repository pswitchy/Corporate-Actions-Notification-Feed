import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { JSONFilePreset } from 'lowdb/node';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Socket.io setup with CORS
// Socket.io setup with CORS
// Allow any origin for development purposes
const corsConfig = {
    origin: (origin, callback) => {
        callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
};

const io = new Server(httpServer, {
    cors: corsConfig
});

// Middleware
app.use(cors({
    origin: true, // Reflects the request origin
    credentials: true
}));
app.use(express.json());

// Initialize LowDB
const defaultData = { events: [] };
const db = await JSONFilePreset('db.json', defaultData);

// Sample data for generating realistic events
const stockData = {
    DIVIDEND: [
        { ticker: 'AAPL', companyName: 'Apple Inc.', amount: 0.24 },
        { ticker: 'MSFT', companyName: 'Microsoft Corporation', amount: 0.75 },
        { ticker: 'JNJ', companyName: 'Johnson & Johnson', amount: 1.19 },
        { ticker: 'PG', companyName: 'Procter & Gamble', amount: 0.94 },
        { ticker: 'KO', companyName: 'Coca-Cola Company', amount: 0.46 },
        { ticker: 'PEP', companyName: 'PepsiCo Inc.', amount: 1.26 },
        { ticker: 'VZ', companyName: 'Verizon Communications', amount: 0.66 },
        { ticker: 'T', companyName: 'AT&T Inc.', amount: 0.28 }
    ],
    STOCK_SPLIT: [
        { ticker: 'TSLA', companyName: 'Tesla Inc.', ratio: '3:1' },
        { ticker: 'AMZN', companyName: 'Amazon.com Inc.', ratio: '20:1' },
        { ticker: 'GOOGL', companyName: 'Alphabet Inc.', ratio: '20:1' },
        { ticker: 'NVDA', companyName: 'NVIDIA Corporation', ratio: '4:1' },
        { ticker: 'SHOP', companyName: 'Shopify Inc.', ratio: '10:1' },
        { ticker: 'CMG', companyName: 'Chipotle Mexican Grill', ratio: '50:1' }
    ],
    MERGER: [
        { ticker: 'DIS', companyName: 'Walt Disney Company', targetCompany: '21st Century Fox' },
        { ticker: 'AVGO', companyName: 'Broadcom Inc.', targetCompany: 'VMware Inc.' },
        { ticker: 'MSFT', companyName: 'Microsoft Corporation', targetCompany: 'Activision Blizzard' },
        { ticker: 'AMD', companyName: 'Advanced Micro Devices', targetCompany: 'Xilinx Inc.' },
        { ticker: 'ORCL', companyName: 'Oracle Corporation', targetCompany: 'Cerner Corporation' },
        { ticker: 'META', companyName: 'Meta Platforms Inc.', targetCompany: 'Within Unlimited' }
    ]
};

// Simulated SQS Queue Class
class SimulatedSQSQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    // Add event to queue
    enqueue(event) {
        this.queue.push(event);
        console.log(`📥 Event added to queue: ${event.type} - ${event.ticker}`);
        this.processQueue();
    }

    // Process queue (simulates SQS polling)
    async processQueue() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const event = this.queue.shift();

            // Simulate processing delay (like real SQS)
            await new Promise(resolve => setTimeout(resolve, 100));

            // Persist to database
            await this.persistEvent(event);

            // Broadcast to all connected clients
            io.emit('corporate-action', event);
            console.log(`📤 Event broadcasted: ${event.type} - ${event.ticker}`);
        }

        this.processing = false;
    }

    // Persist event to LowDB
    async persistEvent(event) {
        await db.update(({ events }) => events.push(event));
        console.log(`💾 Event persisted to database: ${event.id}`);
    }
}

// Initialize queue
const sqsQueue = new SimulatedSQSQueue();

// Generate a corporate action event
function generateEvent(type) {
    const eventType = type || ['DIVIDEND', 'STOCK_SPLIT', 'MERGER'][Math.floor(Math.random() * 3)];
    const dataPool = stockData[eventType];
    const randomData = dataPool[Math.floor(Math.random() * dataPool.length)];

    const now = new Date();
    const effectiveDate = new Date(now.getTime() + (Math.random() * 30 + 7) * 24 * 60 * 60 * 1000);

    const baseEvent = {
        id: uuidv4(),
        type: eventType,
        ticker: randomData.ticker,
        companyName: randomData.companyName,
        announcedAt: now.toISOString(),
        effectiveDate: effectiveDate.toISOString(),
        read: false
    };

    switch (eventType) {
        case 'DIVIDEND':
            return {
                ...baseEvent,
                amount: randomData.amount,
                description: `${randomData.companyName} declared a quarterly dividend of $${randomData.amount} per share`
            };
        case 'STOCK_SPLIT':
            return {
                ...baseEvent,
                ratio: randomData.ratio,
                description: `${randomData.companyName} announced a ${randomData.ratio} stock split`
            };
        case 'MERGER':
            return {
                ...baseEvent,
                targetCompany: randomData.targetCompany,
                description: `${randomData.companyName} to acquire ${randomData.targetCompany}`
            };
        default:
            return baseEvent;
    }
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send existing events to newly connected client
    const existingEvents = db.data.events;
    socket.emit('initial-events', existingEvents);
    console.log(`📦 Sent ${existingEvents.length} existing events to client`);

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Allow clients to mark events as read
    socket.on('mark-read', async (eventId) => {
        await db.update(({ events }) => {
            const event = events.find(e => e.id === eventId);
            if (event) event.read = true;
        });
        io.emit('event-updated', { id: eventId, read: true });
    });

    // Allow clients to mark all as read
    socket.on('mark-all-read', async () => {
        await db.update(({ events }) => {
            events.forEach(e => e.read = true);
        });
        io.emit('all-events-read');
    });
});

// REST API Endpoints

// Simulate a corporate action event
app.post('/api/simulate-event', (req, res) => {
    const { type } = req.body;

    // Validate event type if provided
    if (type && !['DIVIDEND', 'STOCK_SPLIT', 'MERGER'].includes(type)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid event type. Must be DIVIDEND, STOCK_SPLIT, or MERGER'
        });
    }

    const event = generateEvent(type);
    sqsQueue.enqueue(event);

    res.json({
        success: true,
        message: 'Event queued for processing',
        event
    });
});

// Get all events
app.get('/api/events', (req, res) => {
    const events = db.data.events;
    res.json({
        success: true,
        count: events.length,
        events
    });
});

// Get unread events count
app.get('/api/events/unread-count', (req, res) => {
    const unreadCount = db.data.events.filter(e => !e.read).length;
    res.json({
        success: true,
        unreadCount
    });
});

// Clear all events (for testing)
app.delete('/api/events', async (req, res) => {
    await db.update(data => { data.events = []; });
    res.json({
        success: true,
        message: 'All events cleared'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connectedClients: io.engine.clientsCount
    });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║     Corporate Actions Notification Server                    ║
║══════════════════════════════════════════════════════════════║
║  🚀 Server running on http://localhost:${PORT}                  ║
║  📡 WebSocket ready for connections                          ║
║  💾 Database: db.json                                        ║
║══════════════════════════════════════════════════════════════║
║  API Endpoints:                                              ║
║  POST /api/simulate-event  - Trigger a corporate action      ║
║  GET  /api/events          - Get all events                  ║
║  GET  /api/events/unread-count - Get unread count            ║
║  DELETE /api/events        - Clear all events                ║
║  GET  /api/health          - Health check                    ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

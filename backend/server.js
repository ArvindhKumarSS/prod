const express = require('express');
const cors = require('cors');
const visitorTracker = require('./middleware/visitorTracker');
const { logError } = require('./utils/errorLogger');
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI clients
const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const customOpenaiClient = new OpenAI({
    apiKey: process.env.CUSTOM_OPENAI_API_KEY,
    baseURL: process.env.CUSTOM_OPENAI_BASE_URL
});

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Initialize database
const initDb = async () => {
    try {
        const sqlScript = fs.readFileSync(path.join(__dirname, 'dbscripts', 'init.sql'), 'utf8');
        await pool.query(sqlScript);
        console.log('Database initialized successfully');
    } catch (error) {
        await logError('Database Initialization', error);
        console.error('Error initializing database:', error);
        process.exit(1); // Exit if database initialization fails
    }
};

// Initialize database on startup
initDb();

// Apply visitor tracking middleware to all routes
app.use(visitorTracker);

// Root endpoint
app.get('/api', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT NOW()');
        res.json({ message: 'Backend is running', time: rows[0].now });
    } catch (error) {
        await logError('/api', error, req);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Quotes endpoints
app.get('/api/quotes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM quotes ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        await logError('/api/quotes', error, req);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Random quote endpoint
app.get('/api/quotes/random', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1');
        res.json(rows[0]);
    } catch (error) {
        await logError('/api/quotes/random', error, req);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch (error) {
        await logError('/api/health', error, req);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Math AI endpoint
app.post('/api/math-gen', async (req, res) => {
    console.log('Math-gen endpoint hit:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers,
        ip: req.ip
    });
    
    const { query, model = 'openai' } = req.body;
    if (!query) {
        console.error('No query provided in request body');
        return res.status(400).json({ error: 'Query is required' });
    }

    // Select the appropriate client based on the model
    const client = model === 'custom' ? customOpenaiClient : openaiClient;
    const mname = model  === 'custom' ? 'Qwen/Qwen2.5-Math-7B-Instruct' : 'gpt-3.5-turbo';

    console.log(`Using ${model} model for request`);
    
    try {
        // Get AI to generate math solution
        console.log('Calling OpenAI with query:', query);
        const completion = await client.chat.completions.create({
            model: mname,
            messages: [
                {
                    role: "system",
                    content: `You are a math expert. Help solve math problems and explain the solution step by step.
                    Rules:
                    1. If the query is not math-related, politely say so. `
                },
                {
                    role: "user",
                    content: query
                }
            ],
            temperature: 0.3,
            max_tokens: 1000
        });

        const solution = completion.choices[0].message.content;
        console.log('OpenAI response received, length:', solution.length);
        res.json({ solution });
    } catch (error) {
        console.error('Error generating math solution:', error);
        res.status(500).json({ error: 'Failed to generate math solution' });
    }
});

// After all your API routes, add this catch-all route
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    // Serve index.html for all other routes
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Error handling middleware
app.use(async (err, req, res, next) => {
    await logError(req.path, err, req);
    res.status(500).json({ error: 'Internal server error' });
});

// Debug: Print all registered routes
function printRoutes(app) {
    console.log('=== Registered Routes ===');
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Routes registered directly on the app
            console.log(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
            // Router middleware
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    console.log(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${handler.route.path}`);
                }
            });
        }
    });
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    printRoutes(app);  // Print routes on startup
}); 
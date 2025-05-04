const express = require('express');
const cors = require('cors');
const visitorTracker = require('./middleware/visitorTracker');
const { logError } = require('./utils/errorLogger');
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

// Error handling middleware
app.use(async (err, req, res, next) => {
    await logError(req.path, err, req);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 
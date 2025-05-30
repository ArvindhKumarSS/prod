const express = require('express');
const { pool } = require('../db');
const cors = require('cors');
const path = require('path');
const basicAuth = require('express-basic-auth');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.MCP_PORT || 3002;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// Basic authentication middleware
app.use(basicAuth({
    users: { 
        [process.env.MCP_USERNAME || 'admin']: process.env.MCP_PASSWORD || 'changeme'
    },
    challenge: true,
    realm: 'Degen Monk MCP'
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Database performance metrics
app.get('/metrics/performance', async (req, res) => {
    try {
        const metrics = await pool.query(`
            SELECT 
                datname,
                numbackends as active_connections,
                xact_commit as transactions_committed,
                xact_rollback as transactions_rolled_back,
                blks_read as blocks_read,
                blks_hit as blocks_hit,
                tup_returned as rows_returned,
                tup_fetched as rows_fetched,
                tup_inserted as rows_inserted,
                tup_updated as rows_updated,
                tup_deleted as rows_deleted
            FROM pg_stat_database 
            WHERE datname = current_database()
        `);
        res.json(metrics.rows[0]);
    } catch (error) {
        console.error('Error fetching performance metrics:', error);
        res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
});

// Table statistics
app.get('/metrics/tables', async (req, res) => {
    try {
        const tables = await pool.query(`
            SELECT 
                schemaname,
                relname as table_name,
                n_live_tup as row_count,
                n_dead_tup as dead_rows,
                last_vacuum,
                last_autovacuum,
                last_analyze,
                last_autoanalyze
            FROM pg_stat_user_tables
            ORDER BY n_live_tup DESC
        `);
        res.json(tables.rows);
    } catch (error) {
        console.error('Error fetching table statistics:', error);
        res.status(500).json({ error: 'Failed to fetch table statistics' });
    }
});

// Connection pool status
app.get('/metrics/pool', (req, res) => {
    const poolStatus = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
        max: pool.options.max,
        min: pool.options.min
    };
    res.json(poolStatus);
});

// Slow queries (last hour)
app.get('/metrics/slow-queries', async (req, res) => {
    try {
        const slowQueries = await pool.query(`
            SELECT 
                query,
                calls,
                total_time,
                mean_time,
                rows
            FROM pg_stat_statements
            WHERE datname = current_database()
            AND mean_time > 1000  -- queries taking more than 1 second
            ORDER BY mean_time DESC
            LIMIT 10
        `);
        res.json(slowQueries.rows);
    } catch (error) {
        console.error('Error fetching slow queries:', error);
        res.status(500).json({ error: 'Failed to fetch slow queries' });
    }
});

// Database stats endpoint
app.get('/stats', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT count(*) FROM quotes) as quotes_count,
                (SELECT count(*) FROM visitors) as visitors_count,
                (SELECT count(*) FROM visitor_events) as events_count,
                (SELECT max(created_at) FROM quotes) as latest_quote,
                (SELECT max(created_at) FROM visitors) as latest_visitor
        `);
        res.json(stats.rows[0]);
    } catch (error) {
        console.error('Error fetching database stats:', error);
        res.status(500).json({ error: 'Failed to fetch database stats' });
    }
});

// Quotes management endpoints
app.get('/quotes', async (req, res) => {
    try {
        const quotes = await pool.query('SELECT * FROM quotes ORDER BY created_at DESC');
        res.json(quotes.rows);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ error: 'Failed to fetch quotes' });
    }
});

app.post('/quotes', async (req, res) => {
    const { text, author } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO quotes (text, author) VALUES ($1, $2) RETURNING *',
            [text, author]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({ error: 'Failed to create quote' });
    }
});

app.delete('/quotes/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM quotes WHERE id = $1', [req.params.id]);
        res.json({ message: 'Quote deleted successfully' });
    } catch (error) {
        console.error('Error deleting quote:', error);
        res.status(500).json({ error: 'Failed to delete quote' });
    }
});

// Visitor stats endpoints
app.get('/visitors', async (req, res) => {
    try {
        const visitors = await pool.query(`
            SELECT v.*, 
                   COUNT(ve.id) as event_count,
                   MAX(ve.created_at) as last_event
            FROM visitors v
            LEFT JOIN visitor_events ve ON v.id = ve.visitor_id
            GROUP BY v.id
            ORDER BY v.created_at DESC
            LIMIT 100
        `);
        res.json(visitors.rows);
    } catch (error) {
        console.error('Error fetching visitors:', error);
        res.status(500).json({ error: 'Failed to fetch visitors' });
    }
});

app.get('/visitors/events', async (req, res) => {
    try {
        const events = await pool.query(`
            SELECT ve.*, v.ip_address, v.user_agent
            FROM visitor_events ve
            JOIN visitors v ON ve.visitor_id = v.id
            ORDER BY ve.created_at DESC
            LIMIT 100
        `);
        res.json(events.rows);
    } catch (error) {
        console.error('Error fetching visitor events:', error);
        res.status(500).json({ error: 'Failed to fetch visitor events' });
    }
});

// Database schema for AI context
const DB_SCHEMA = `
Tables in the database:
1. quotes
   - id (integer, primary key)
   - text (text)
   - author (text)
   - created_at (timestamp)

2. visitors
   - id (integer, primary key)
   - ip_address (text)
   - user_agent (text)
   - created_at (timestamp)

3. visitor_events
   - id (integer, primary key)
   - visitor_id (integer, foreign key to visitors.id)
   - event_type (text)
   - created_at (timestamp)

Relationships:
- visitor_events.visitor_id references visitors.id
`;

// Natural language query endpoint
app.post('/query/natural', async (req, res) => {
    const { query, context } = req.body;
    
    try {
        // Get AI to generate SQL
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a SQL expert. Convert natural language queries into PostgreSQL SQL.
                    Database schema:
                    ${DB_SCHEMA}
                    
                    Rules:
                    1. Only generate SELECT queries
                    2. Never modify data (no INSERT, UPDATE, DELETE)
                    3. Use proper SQL injection prevention
                    4. Include helpful comments
                    5. Format the SQL for readability
                    6. Add LIMIT 100 to prevent large result sets
                    7. Return only the SQL query, nothing else`
                },
                {
                    role: "user",
                    content: `Convert this natural language query to SQL: "${query}"
                    ${context ? `Additional context: ${context}` : ''}`
                }
            ],
            temperature: 0.1,
            max_tokens: 500
        });

        const generatedSQL = completion.choices[0].message.content.trim();
        
        // Validate the generated SQL
        if (!generatedSQL.toLowerCase().startsWith('select')) {
            throw new Error('Generated query must be a SELECT statement');
        }

        // Execute the query
        const result = await pool.query(generatedSQL);

        // Get AI to explain the results
        const explanation = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a data analyst. Explain the results of a database query in simple terms.
                    Format the explanation in markdown.
                    Include:
                    1. A summary of what the query found
                    2. Key insights from the data
                    3. Any notable patterns or trends
                    4. Suggestions for follow-up queries`
                },
                {
                    role: "user",
                    content: `Explain these query results:
                    Query: ${generatedSQL}
                    Results: ${JSON.stringify(result.rows, null, 2)}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        res.json({
            query: generatedSQL,
            results: result.rows,
            explanation: explanation.choices[0].message.content,
            rowCount: result.rowCount
        });
    } catch (error) {
        console.error('Error processing natural language query:', error);
        res.status(500).json({
            error: 'Failed to process query',
            details: error.message
        });
    }
});

// Query history endpoint
app.get('/query/history', async (req, res) => {
    try {
        const history = await pool.query(`
            SELECT 
                query,
                created_at,
                row_count,
                execution_time
            FROM query_history
            ORDER BY created_at DESC
            LIMIT 50
        `);
        res.json(history.rows);
    } catch (error) {
        console.error('Error fetching query history:', error);
        res.status(500).json({ error: 'Failed to fetch query history' });
    }
});

// Serve static files at /mcp (so /mcp/* is handled by static middleware)
app.use('/mcp', express.static(path.join(__dirname, 'public')));

// Serve index.html at /mcp (instead of a catch-all route)
app.get('/mcp', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });

// Start server
app.listen(PORT, () => {
    console.log(`MCP server running on port ${PORT}`);
}); 
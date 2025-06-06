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

// Basic authentication middleware
app.use(basicAuth({
    users: { 
        [process.env.MCP_USERNAME || 'admin']: process.env.MCP_PASSWORD || 'changeme'
    },
    challenge: true,
    realm: 'Degen Monk MCP'
}));

// Serve static files first
app.use('/mcp', express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/mcp/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/mcp/metrics/performance', async (req, res) => {
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

app.get('/mcp/metrics/tables', async (req, res) => {
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

app.get('/mcp/metrics/pool', (req, res) => {
    const poolStatus = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
        max: pool.options.max,
        min: pool.options.min
    };
    res.json(poolStatus);
});

app.get('/mcp/metrics/slow-queries', async (req, res) => {
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

app.get('/mcp/stats', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT count(*) FROM quotes) as quotes_count,
                (SELECT count(*) FROM visitorinfo) as visitors_count,
                (SELECT count(*) FROM visitorinfo) as events_count,
                (SELECT max(created_at) FROM quotes) as latest_quote,
                (SELECT max(created_at) FROM visitorinfo) as latest_visitor
        `);
        res.json(stats.rows[0]);
    } catch (error) {
        console.error('Error fetching database stats:', error);
        res.status(500).json({ error: 'Failed to fetch database stats' });
    }
});

app.get('/mcp/quotes', (req, res) => {
  const query = `
    SELECT id, text, author, created_at, updated_at FROM quotes ORDER BY RANDOM() LIMIT 10
  `;
  pool.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching quotes:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result.rows);
    }
  });
});

app.post('/mcp/quotes', async (req, res) => {
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

app.delete('/mcp/quotes/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM quotes WHERE id = $1', [req.params.id]);
        res.json({ message: 'Quote deleted successfully' });
    } catch (error) {
        console.error('Error deleting quote:', error);
        res.status(500).json({ error: 'Failed to delete quote' });
    }
});

app.get('/mcp/visitorinfo', async (req, res) => {
    try {
        const visitors = await pool.query('SELECT ip_address, region, data, created_at FROM visitorinfo ORDER BY created_at DESC LIMIT 100');
        res.json(visitors.rows);
    } catch (error) {
        console.error('Error fetching visitor info:', error);
        res.status(500).json({ error: 'Failed to fetch visitor info' });
    }
});

app.post('/mcp/visitorinfo', async (req, res) => {
    const { ip_address, region, data } = req.body;
    try {
        await pool.query(
            'INSERT INTO visitorinfo (ip_address, region, data, created_at) VALUES ($1, $2, $3, NOW())',
            [ip_address, region, data]
        );
        res.status(201).json({ message: 'Visitor info inserted.' });
    } catch (error) {
        console.error('Error inserting visitor info:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/mcp/errorinfo', async (req, res) => {
    try {
        const errors = await pool.query('SELECT route, error_message, stack_trace, created_at FROM errorinfo ORDER BY created_at DESC LIMIT 100');
        res.json(errors.rows);
    } catch (error) {
        console.error('Error fetching error info:', error);
        res.status(500).json({ error: 'Failed to fetch error info' });
    }
});

app.post('/mcp/errorinfo', async (req, res) => {
    const { route, error_message, stack_trace } = req.body;
    try {
        await pool.query(
            'INSERT INTO errorinfo (route, error_message, stack_trace, created_at) VALUES ($1, $2, $3, NOW())',
            [route, error_message, stack_trace]
        );
        res.status(201).json({ message: 'Error info inserted.' });
    } catch (error) {
        console.error('Error inserting error info:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Database schema for AI context (updated to reflect actual errorinfo table schema)
const DB_SCHEMA = `
Tables in the database:
1. quotes
   - id (integer, primary key)
   - text (text)
   - author (text)
   - created_at (timestamp)
2. visitorinfo
   - id (integer, primary key)
   - ip_address (text)
   - region (text)
   - data (jsonb) (sample: { "ip": "::ffff:127.0.0.1", "browser": { "os": "Other 0.0.0", "major": "1", "minor": "25", "patch": "0", "family": "Wget" }, "headers": { "referer": null, "language": null }, "timestamp": "2025-05-04T13:14:00.161Z" })
   - created_at (timestamp)
3. errorinfo
   - id (integer, primary key)
   - route (text)
   - error_message (text)
   - stack_trace (text)
   - created_at (timestamp)
`;

app.post('/mcp/query/natural', async (req, res) => {
    const { query, context } = req.body;
    
    try {
        // Get AI to generate SQL
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
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
            model: "gpt-3.5-turbo",
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

app.get('/mcp/query/history', async (req, res) => {
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

// SPA fallback - must be last
app.get('/mcp', (req, res) => {
    res.redirect('/mcp/');
});

app.get('/mcp/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`MCP server running on port ${PORT}`);
}); 
const { pool } = require('../db');

const logError = async (route, error, req = null) => {
    try {
        const requestData = req ? {
            method: req.method,
            url: req.url,
            headers: req.headers,
            query: req.query,
            body: req.body,
            ip: req.ip || req.connection.remoteAddress
        } : null;

        await pool.query(
            'INSERT INTO errorinfo (route, error_message, stack_trace, request_data) VALUES ($1, $2, $3, $4)',
            [
                route,
                error.message || 'Unknown error',
                error.stack || null,
                requestData
            ]
        );
    } catch (logError) {
        // If error logging fails, log to console
        console.error('Failed to log error to database:', logError);
        console.error('Original error:', error);
    }
};

module.exports = { logError }; 
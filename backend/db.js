const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Try to load .env file if it exists (development)
try {
    dotenv.config({ path: path.join(__dirname, '.env') });
} catch (error) {
    // Ignore error if .env file doesn't exist (production)
    console.log('No .env file found, using environment variables');
}

// Validate required environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
});

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        process.exit(1);
    }
    console.log('Successfully connected to database');
    release();
});

module.exports = { pool }; 
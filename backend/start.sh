#!/bin/sh

# Function to check database connection
check_db() {
    node -e "
    const { pool } = require('./db');
    pool.connect((err, client, release) => {
        if (err) {
            console.error('Database connection error:', err);
            process.exit(1);
        }
        console.log('Database connection successful');
        release();
        process.exit(0);
    });
    "
}

# Wait for database to be ready
echo "Waiting for database to be ready..."
for i in $(seq 1 30); do
    if check_db; then
        echo "Database is ready!"
        break
    fi
    echo "Attempt $i: Database not ready yet..."
    if [ $i -eq 30 ]; then
        echo "Could not connect to database after 30 attempts"
        exit 1
    fi
    sleep 2
done

# Start the application
echo "Starting application..."
exec node server.js 
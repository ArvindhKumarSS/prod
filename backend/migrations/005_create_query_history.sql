-- Create query history table
CREATE TABLE IF NOT EXISTS query_history (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    natural_query TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    row_count INTEGER,
    execution_time INTEGER, -- in milliseconds
    user_id TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Create index on created_at for faster history queries
CREATE INDEX IF NOT EXISTS idx_query_history_created_at ON query_history(created_at DESC);

-- Grant permissions
GRANT ALL ON TABLE query_history TO degenmonk;
GRANT USAGE, SELECT ON SEQUENCE query_history_id_seq TO degenmonk; 
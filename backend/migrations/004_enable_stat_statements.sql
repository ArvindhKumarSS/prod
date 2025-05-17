-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Update postgresql.conf to track query statistics
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET pg_stat_statements.max = 10000;
ALTER SYSTEM SET pg_stat_statements.track_utility = 'on';

-- Grant usage to the application user
GRANT USAGE ON SCHEMA public TO degenmonk;
GRANT EXECUTE ON FUNCTION pg_stat_statements() TO degenmonk; 
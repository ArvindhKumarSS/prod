-- Create quotes table if it doesn't exist
DO $$ 
BEGIN
    CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL UNIQUE,
        author VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS visitorinfo (
        id SERIAL PRIMARY KEY,
        ip_address INET NOT NULL,
        region VARCHAR(255),
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS errorinfo (
        id SERIAL PRIMARY KEY,
        route VARCHAR(255) NOT NULL,
        error_message TEXT NOT NULL,
        stack_trace TEXT,
        request_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
EXCEPTION
    WHEN duplicate_table THEN 
        NULL;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quotes_created_at') THEN
        CREATE INDEX idx_quotes_created_at ON quotes(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_visitorinfo_created_at') THEN
        CREATE INDEX idx_visitorinfo_created_at ON visitorinfo(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_visitorinfo_ip_address') THEN
        CREATE INDEX idx_visitorinfo_ip_address ON visitorinfo(ip_address);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_errorinfo_created_at') THEN
        CREATE INDEX idx_errorinfo_created_at ON errorinfo(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_errorinfo_route') THEN
        CREATE INDEX idx_errorinfo_route ON errorinfo(route);
    END IF;
END $$;

-- Insert initial quotes if they don't exist
INSERT INTO quotes (text, author)
VALUES
    ('In the crypto market, the only certainty is uncertainty.', 'Degen Monk'),
    ('Buy the rumor, sell the news, meditate on the chart.', 'Degen Monk'),
    ('A diamond hand is just a paper hand that hasn''t been tested.', 'Degen Monk'),
    ('The market can stay irrational longer than you can stay solvent.', 'Degen Monk'),
    ('Not your keys, not your coins. Not your mind, not your peace.', 'Degen Monk'),
    ('The best time to buy was yesterday. The second best time is now.', 'Degen Monk'),
    ('In the monastery of markets,
The wise monk knows:
When others FOMO,
That''s when you HODL.', 'The Degen Sutra'),
    ('A monk''s patience is measured in blocks,
Not in minutes.
For in the blockchain,
Time is but a sequence of hashes.', 'The Crypto Dharma'),
    ('The path to enlightenment
Is paved with private keys.
Guard them well,
For they are your digital soul.', 'The Digital Bodhisattva'),
    ('In the garden of tokens,
The wise monk plants seeds of utility.
For value grows not from hype,
But from purpose.', 'The Token Master'),
    ('When the market meditates,
The degen monk trades.
When the market trades,
The degen monk meditates.', 'The Market Zen'),
    ('The greatest wealth is not in your wallet,
But in your ability to HODL
Through the winter of bear markets.', 'The Winter Monk')
ON CONFLICT DO NOTHING;

-- Create index on author if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'quotes'
        AND indexname = 'quotes_author_idx'
    ) THEN
        CREATE INDEX quotes_author_idx ON quotes(author);
    END IF;
END $$;

-- Insert quotes if they don't exist
INSERT INTO quotes (text, author)
SELECT 'In the monastery of markets,
The wise monk knows:
When others FOMO,
That''s when you HODL.', 'The Degen Sutra'
WHERE NOT EXISTS (
    SELECT 1 FROM quotes 
    WHERE text = 'In the monastery of markets,
The wise monk knows:
When others FOMO,
That''s when you HODL.'
);

INSERT INTO quotes (text, author)
SELECT 'A monk''s patience is measured in blocks,
Not in minutes.
For in the blockchain,
Time is but a sequence of hashes.', 'The Crypto Dharma'
WHERE NOT EXISTS (
    SELECT 1 FROM quotes 
    WHERE text = 'A monk''s patience is measured in blocks,
Not in minutes.
For in the blockchain,
Time is but a sequence of hashes.'
);

INSERT INTO quotes (text, author)
SELECT 'The path to enlightenment
Is paved with private keys.
Guard them well,
For they are your digital soul.', 'The Digital Bodhisattva'
WHERE NOT EXISTS (
    SELECT 1 FROM quotes 
    WHERE text = 'The path to enlightenment
Is paved with private keys.
Guard them well,
For they are your digital soul.'
);

INSERT INTO quotes (text, author)
SELECT 'In the garden of tokens,
The wise monk plants seeds of utility.
For value grows not from hype,
But from purpose.', 'The Token Master'
WHERE NOT EXISTS (
    SELECT 1 FROM quotes 
    WHERE text = 'In the garden of tokens,
The wise monk plants seeds of utility.
For value grows not from hype,
But from purpose.'
);

INSERT INTO quotes (text, author)
SELECT 'When the market meditates,
The degen monk trades.
When the market trades,
The degen monk meditates.', 'The Market Zen'
WHERE NOT EXISTS (
    SELECT 1 FROM quotes 
    WHERE text = 'When the market meditates,
The degen monk trades.
When the market trades,
The degen monk meditates.'
);

INSERT INTO quotes (text, author)
SELECT 'The greatest wealth is not in your wallet,
But in your ability to HODL
Through the winter of bear markets.', 'The Winter Monk'
WHERE NOT EXISTS (
    SELECT 1 FROM quotes 
    WHERE text = 'The greatest wealth is not in your wallet,
But in your ability to HODL
Through the winter of bear markets.'
); 
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid(), AES-256 encryption
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- Trigram similarity for title/name search
CREATE EXTENSION IF NOT EXISTS pg_cron;    -- Scheduled jobs: event reminders, cleanup
CREATE EXTENSION IF NOT EXISTS unaccent;   -- Accent-insensitive search

-- Scheduled Jobs (pg_cron)

-- 1. Event reminders 24h: runs every 5 minutes
SELECT cron.schedule(
  'event-reminder-24h',
  '*/5 * * * *',
  $$
    INSERT INTO notifications (tenant_id, user_id, type, title, body, payload)
    SELECT
      r.tenant_id,
      r.user_id,
      'event_reminder',
      'Event Tomorrow: ' || e.title,
      e.title || ' starts tomorrow at ' || TO_CHAR(e.start_at AT TIME ZONE 'Asia/Kolkata', 'HH12:MI AM'),
      jsonb_build_object('entity_type', 'event', 'entity_id', e.id)
    FROM events e
    JOIN event_rsvps r ON r.event_id = e.id AND r.status = 'attending'
    WHERE e.start_at BETWEEN now() + interval '23.5 hours' AND now() + interval '24.5 hours'
      AND e.status = 'published'
      AND e.reminder_sent_24h = false;

    UPDATE events SET reminder_sent_24h = true
    WHERE start_at BETWEEN now() + interval '23.5 hours' AND now() + interval '24.5 hours'
      AND status = 'published' AND reminder_sent_24h = false;
  $$
);

-- 2. Event reminders 1h: runs every 5 minutes
SELECT cron.schedule(
  'event-reminder-1h',
  '*/5 * * * *',
  $$
    INSERT INTO notifications (tenant_id, user_id, type, title, body, payload)
    SELECT
      r.tenant_id,
      r.user_id,
      'event_reminder',
      'Starting Soon: ' || e.title,
      e.title || ' begins in about 1 hour.',
      jsonb_build_object('entity_type', 'event', 'entity_id', e.id)
    FROM events e
    JOIN event_rsvps r ON r.event_id = e.id AND r.status = 'attending'
    WHERE e.start_at BETWEEN now() + interval '55 minutes' AND now() + interval '65 minutes'
      AND e.status = 'published'
      AND e.reminder_sent_1h = false;

    UPDATE events SET reminder_sent_1h = true
    WHERE start_at BETWEEN now() + interval '55 minutes' AND now() + interval '65 minutes'
      AND status = 'published' AND reminder_sent_1h = false;
  $$
);

-- 3. Notification cleanup: deletes older than 90 days, daily at 2:30 AM IST (21:00 UTC)
SELECT cron.schedule(
  'notification-cleanup',
  '30 21 * * *',
  $$
    DELETE FROM notifications WHERE created_at < now() - interval '90 days';
  $$
);

-- 4. Auto-complete events: runs daily at midnight IST (18:30 UTC)
SELECT cron.schedule(
  'events-auto-complete',
  '30 18 * * *',
  $$
    UPDATE events SET status = 'completed'
    WHERE status = 'published' AND end_at < now() - interval '1 hour';
  $$
);

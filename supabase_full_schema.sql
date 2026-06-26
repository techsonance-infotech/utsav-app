

-- ========================================================
-- MIGRATION: 00001_extensions.sql
-- ========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid(), AES-256 encryption
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- Trigram similarity for title/name search
CREATE EXTENSION IF NOT EXISTS pg_cron;    -- Scheduled jobs: event reminders, cleanup
CREATE EXTENSION IF NOT EXISTS unaccent;   -- Accent-insensitive search


-- ========================================================
-- MIGRATION: 00002_schema.sql
-- ========================================================

-- 1. tenants
CREATE TABLE tenants (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  slug                text NOT NULL UNIQUE,
  vertical            text NOT NULL DEFAULT 'ganpati',
  plan                text NOT NULL DEFAULT 'free',
  plan_expires_at     timestamptz,
  logo_url            text,
  banner_url          text,
  primary_color       text DEFAULT '#FF9500',
  city                text,
  state               text,
  country             text DEFAULT 'IN',
  default_language    text NOT NULL DEFAULT 'en',
  timezone            text NOT NULL DEFAULT 'Asia/Kolkata',
  is_public_donations boolean NOT NULL DEFAULT true,
  is_public_expenses  boolean NOT NULL DEFAULT false,
  is_active           boolean NOT NULL DEFAULT true,
  razorpay_key_id     text,
  whatsapp_group_url  text,
  founded_year        int,
  description         text,
  address             text,
  website_url         text,
  facebook_url        text,
  instagram_url       text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tenants_slug ON tenants(slug);

-- 2. donation_campaigns
CREATE TABLE donation_campaigns (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  target_amount   numeric(12,2),
  start_date      date,
  end_date        date,
  is_active       boolean NOT NULL DEFAULT true,
  is_public       boolean NOT NULL DEFAULT true,
  cover_image_url text,
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_campaigns_tenant ON donation_campaigns(tenant_id);

-- 3. expense_categories
CREATE TABLE expense_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        text NOT NULL,
  name_hi     text,
  name_gu     text,
  icon        text,
  budget      numeric(12,2),
  color       text DEFAULT '#FF9500',
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);
CREATE INDEX idx_expense_categories_tenant ON expense_categories(tenant_id);

-- 4. vendors
CREATE TABLE vendors (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by              uuid NOT NULL REFERENCES auth.users(id),
  linked_user_id          uuid REFERENCES auth.users(id),
  business_name           text NOT NULL,
  contact_person          text,
  phone                   text,
  email                   text,
  gst_number              text,
  category                text NOT NULL DEFAULT 'other',
  address                 text,
  city                    text,
  state                   text,
  bank_account_encrypted  bytea,
  rating                  numeric(2,1) CHECK (rating BETWEEN 1 AND 5),
  status                  text NOT NULL DEFAULT 'prospect',
  notes                   text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_vendors_tenant   ON vendors(tenant_id);
CREATE INDEX idx_vendors_status   ON vendors(tenant_id, status);
CREATE INDEX idx_vendors_category ON vendors(tenant_id, category);

-- 5. events
CREATE TABLE events (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by          uuid NOT NULL REFERENCES auth.users(id),
  title               text NOT NULL,
  title_hi            text,
  title_gu            text,
  description         text,
  category            text NOT NULL DEFAULT 'general',
  start_at            timestamptz NOT NULL,
  end_at              timestamptz,
  location_name       text,
  location_maps_url   text,
  banner_image_url    text,
  status              text NOT NULL DEFAULT 'draft',
  max_capacity        int,
  rsvp_required       boolean NOT NULL DEFAULT false,
  rsvp_deadline       timestamptz,
  is_recurring        boolean NOT NULL DEFAULT false,
  recurrence_rule     text,
  organiser_id        uuid REFERENCES auth.users(id),
  language            text NOT NULL DEFAULT 'en',
  tags                text[],
  volunteer_slots_count int DEFAULT 0,
  reminder_sent_24h   boolean NOT NULL DEFAULT false,
  reminder_sent_1h    boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_tenant      ON events(tenant_id);
CREATE INDEX idx_events_status      ON events(tenant_id, status);
CREATE INDEX idx_events_start       ON events(tenant_id, start_at ASC);
CREATE INDEX idx_events_title       ON events USING gin(title gin_trgm_ops);

-- 6. purchase_orders
CREATE TABLE purchase_orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id       uuid NOT NULL REFERENCES vendors(id),
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  po_number       text NOT NULL UNIQUE,
  title           text NOT NULL,
  description     text,
  line_items      jsonb NOT NULL DEFAULT '[]',
  subtotal        numeric(12,2) NOT NULL,
  gst_amount      numeric(12,2) DEFAULT 0,
  total_amount    numeric(12,2) NOT NULL,
  delivery_date   date,
  terms           text,
  status          text NOT NULL DEFAULT 'draft',
  pdf_url         text,
  sent_at         timestamptz,
  accepted_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_po_tenant  ON purchase_orders(tenant_id);
CREATE INDEX idx_po_vendor  ON purchase_orders(vendor_id);
CREATE INDEX idx_po_status  ON purchase_orders(tenant_id, status);

-- 7. vendor_invoices
CREATE TABLE vendor_invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  po_id           uuid REFERENCES purchase_orders(id),
  vendor_id       uuid NOT NULL REFERENCES vendors(id),
  reviewed_by     uuid REFERENCES auth.users(id),
  invoice_number  text NOT NULL,
  invoice_date    date NOT NULL,
  due_date        date,
  line_items      jsonb NOT NULL DEFAULT '[]',
  subtotal        numeric(12,2) NOT NULL,
  gst_amount      numeric(12,2) DEFAULT 0,
  total_amount    numeric(12,2) NOT NULL,
  document_url    text,
  status          text NOT NULL DEFAULT 'submitted',
  review_note     text,
  paid_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_tenant ON vendor_invoices(tenant_id);
CREATE INDEX idx_invoices_vendor ON vendor_invoices(vendor_id);
CREATE INDEX idx_invoices_po     ON vendor_invoices(po_id);

-- 8. tenant_members
CREATE TABLE tenant_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'member',
  status          text NOT NULL DEFAULT 'active',
  membership_type text DEFAULT 'annual',
  full_name       text NOT NULL,
  phone           text,
  avatar_url      text,
  city            text,
  state           text,
  date_of_birth   date,
  skills          text[],
  languages       text[] DEFAULT ARRAY['en'],
  emergency_contact_name  text,
  emergency_contact_phone text,
  notes           text,
  preferred_language text NOT NULL DEFAULT 'en',
  dnd_start_time  time,
  dnd_end_time    time,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);
CREATE INDEX idx_tenant_members_tenant     ON tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_user       ON tenant_members(user_id);
CREATE INDEX idx_tenant_members_role       ON tenant_members(tenant_id, role);
CREATE INDEX idx_tenant_members_fullname   ON tenant_members USING gin(full_name gin_trgm_ops);

-- 9. invitations
CREATE TABLE invitations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  role            text NOT NULL DEFAULT 'member',
  token           text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  email           text,
  phone           text,
  invitee_name    text,
  expires_at      timestamptz NOT NULL DEFAULT now() + interval '7 days',
  used_at         timestamptz,
  used_by         uuid REFERENCES auth.users(id),
  is_bulk         boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invitations_token     ON invitations(token);
CREATE INDEX idx_invitations_tenant    ON invitations(tenant_id);

-- 10. donations
CREATE TABLE donations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id         uuid REFERENCES donation_campaigns(id),
  donor_id            uuid REFERENCES auth.users(id),
  recorded_by         uuid REFERENCES auth.users(id),
  donor_name          text NOT NULL,
  donor_phone         text,
  donor_email         text,
  donor_address       text,
  amount              numeric(12,2) NOT NULL CHECK (amount > 0),
  currency            text NOT NULL DEFAULT 'INR',
  mode                text NOT NULL DEFAULT 'online',
  status              text NOT NULL DEFAULT 'pending',
  receipt_number      text UNIQUE,
  is_anonymous        boolean NOT NULL DEFAULT false,
  is_in_kind          boolean NOT NULL DEFAULT false,
  in_kind_description text,
  in_kind_value       numeric(12,2),
  note                text,
  razorpay_order_id   text UNIQUE,
  razorpay_payment_id text UNIQUE,
  razorpay_signature  text,
  paid_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_donations_tenant        ON donations(tenant_id);
CREATE INDEX idx_donations_donor         ON donations(donor_id);
CREATE INDEX idx_donations_campaign      ON donations(campaign_id);
CREATE INDEX idx_donations_status        ON donations(tenant_id, status);
CREATE INDEX idx_donations_paid_at       ON donations(tenant_id, paid_at DESC);
CREATE INDEX idx_donations_receipt       ON donations(receipt_number);

-- 11. expenses
CREATE TABLE expenses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id     uuid REFERENCES expense_categories(id),
  vendor_id       uuid REFERENCES vendors(id),
  invoice_id      uuid REFERENCES vendor_invoices(id),
  submitted_by    uuid NOT NULL REFERENCES auth.users(id),
  approved_by     uuid REFERENCES auth.users(id),
  rejected_by     uuid REFERENCES auth.users(id),
  title           text NOT NULL,
  description     text,
  amount          numeric(12,2) NOT NULL CHECK (amount > 0),
  currency        text NOT NULL DEFAULT 'INR',
  status          text NOT NULL DEFAULT 'draft',
  payment_mode    text,
  receipt_url     text,
  gst_amount      numeric(12,2) DEFAULT 0,
  review_note     text,
  expense_date    date NOT NULL DEFAULT CURRENT_DATE,
  approved_at     timestamptz,
  rejected_at     timestamptz,
  paid_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_expenses_tenant      ON expenses(tenant_id);
CREATE INDEX idx_expenses_status      ON expenses(tenant_id, status);
CREATE INDEX idx_expenses_submitted   ON expenses(submitted_by);
CREATE INDEX idx_expenses_vendor      ON expenses(vendor_id);
CREATE INDEX idx_expenses_date        ON expenses(tenant_id, expense_date DESC);

-- 12. event_rsvps
CREATE TABLE event_rsvps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_id    uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'attending',
  checked_in  boolean NOT NULL DEFAULT false,
  checked_in_at timestamptz,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
CREATE INDEX idx_rsvps_event   ON event_rsvps(event_id);
CREATE INDEX idx_rsvps_user    ON event_rsvps(user_id);
CREATE INDEX idx_rsvps_tenant  ON event_rsvps(tenant_id);

-- 13. volunteer_duties
CREATE TABLE volunteer_duties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_id        uuid REFERENCES events(id) ON DELETE SET NULL,
  assigned_to     uuid REFERENCES auth.users(id),
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  duty_type       text NOT NULL,
  title           text NOT NULL,
  description     text,
  location        text,
  start_at        timestamptz NOT NULL,
  end_at          timestamptz,
  max_volunteers  int DEFAULT 1,
  status          text NOT NULL DEFAULT 'open',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_duties_tenant  ON volunteer_duties(tenant_id);
CREATE INDEX idx_duties_event   ON volunteer_duties(event_id);
CREATE INDEX idx_duties_assigned ON volunteer_duties(assigned_to);

-- 14. volunteer_checkins
CREATE TABLE volunteer_checkins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  duty_id     uuid NOT NULL REFERENCES volunteer_duties(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_in_at  timestamptz NOT NULL DEFAULT now(),
  checked_out_at timestamptz,
  hours_logged   numeric(4,2) GENERATED ALWAYS AS (
    CASE WHEN checked_out_at IS NOT NULL
    THEN EXTRACT(EPOCH FROM (checked_out_at - checked_in_at)) / 3600
    ELSE NULL END
  ) STORED,
  UNIQUE(duty_id, user_id)
);
CREATE INDEX idx_checkins_tenant ON volunteer_checkins(tenant_id);
CREATE INDEX idx_checkins_user   ON volunteer_checkins(user_id);

-- 15. news_articles
CREATE TABLE news_articles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author_id           uuid NOT NULL REFERENCES auth.users(id),
  title               text NOT NULL,
  title_hi            text,
  title_gu            text,
  body                text NOT NULL,
  body_hi             text,
  body_gu             text,
  excerpt             text,
  category            text NOT NULL DEFAULT 'general',
  language            text NOT NULL DEFAULT 'en',
  banner_image_url    text,
  tags                text[],
  status              text NOT NULL DEFAULT 'draft',
  scheduled_at        timestamptz,
  published_at        timestamptz,
  allow_comments      boolean NOT NULL DEFAULT false,
  read_count          int NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_news_tenant      ON news_articles(tenant_id);
CREATE INDEX idx_news_status      ON news_articles(tenant_id, status);
CREATE INDEX idx_news_published   ON news_articles(tenant_id, published_at DESC);
CREATE INDEX idx_news_title       ON news_articles USING gin(title gin_trgm_ops);

-- 16. blog_posts
CREATE TABLE blog_posts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author_id           uuid NOT NULL REFERENCES auth.users(id),
  title               text NOT NULL,
  subtitle            text,
  slug                text NOT NULL,
  body                text NOT NULL,
  excerpt             text,
  cover_image_url     text,
  category            text NOT NULL DEFAULT 'general',
  tags                text[],
  language            text NOT NULL DEFAULT 'en',
  status              text NOT NULL DEFAULT 'draft',
  scheduled_at        timestamptz,
  published_at        timestamptz,
  estimated_read_mins int,
  allow_comments      boolean NOT NULL DEFAULT false,
  meta_title          text,
  meta_description    text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);
CREATE INDEX idx_blog_tenant    ON blog_posts(tenant_id);
CREATE INDEX idx_blog_status    ON blog_posts(tenant_id, status);
CREATE INDEX idx_blog_published ON blog_posts(tenant_id, published_at DESC);

-- 17. committees
CREATE TABLE committees (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  year        int NOT NULL,
  name        text NOT NULL DEFAULT 'Main Committee',
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  created_by  uuid NOT NULL REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, year, name)
);
CREATE INDEX idx_committees_tenant ON committees(tenant_id);

-- 18. committee_positions
CREATE TABLE committee_positions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  committee_id    uuid NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  member_id       uuid NOT NULL REFERENCES auth.users(id),
  position_title  text NOT NULL,
  department      text,
  sort_order      int NOT NULL DEFAULT 0,
  is_public       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_positions_committee ON committee_positions(committee_id);
CREATE INDEX idx_positions_member    ON committee_positions(member_id);

-- 19. chat_channels
CREATE TABLE chat_channels (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  type            text NOT NULL DEFAULT 'group',
  event_id        uuid REFERENCES events(id),
  is_readonly     boolean NOT NULL DEFAULT false,
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  last_message_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_channels_tenant ON chat_channels(tenant_id);
CREATE INDEX idx_channels_type   ON chat_channels(tenant_id, type);

-- 20. chat_channel_members
CREATE TABLE chat_channel_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id      uuid NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  is_admin        boolean NOT NULL DEFAULT false,
  is_muted        boolean NOT NULL DEFAULT false,
  last_read_at    timestamptz,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);
CREATE INDEX idx_channel_members_channel ON chat_channel_members(channel_id);
CREATE INDEX idx_channel_members_user    ON chat_channel_members(user_id);

-- 21. chat_messages
CREATE TABLE chat_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id      uuid NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES auth.users(id),
  reply_to_id     uuid REFERENCES chat_messages(id),
  content         text,
  image_url       text,
  document_url    text,
  document_name   text,
  reactions       jsonb DEFAULT '{}',
  is_pinned       boolean NOT NULL DEFAULT false,
  is_deleted      boolean NOT NULL DEFAULT false,
  deleted_at      timestamptz,
  sent_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_or_media CHECK (
    content IS NOT NULL OR image_url IS NOT NULL OR document_url IS NOT NULL
  )
);
CREATE INDEX idx_messages_channel  ON chat_messages(channel_id, sent_at DESC);
CREATE INDEX idx_messages_sender   ON chat_messages(sender_id);
CREATE INDEX idx_messages_tenant   ON chat_messages(tenant_id);

-- 22. gallery_albums
CREATE TABLE gallery_albums (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_id        uuid REFERENCES events(id),
  created_by      uuid NOT NULL REFERENCES auth.users(id),
  title           text NOT NULL,
  description     text,
  cover_image_url text,
  year            int,
  is_public       boolean NOT NULL DEFAULT true,
  watermark_enabled boolean NOT NULL DEFAULT false,
  media_count     int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_albums_tenant ON gallery_albums(tenant_id);
CREATE INDEX idx_albums_event  ON gallery_albums(event_id);

-- 23. gallery_media
CREATE TABLE gallery_media (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  album_id        uuid NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  uploaded_by     uuid NOT NULL REFERENCES auth.users(id),
  type            text NOT NULL DEFAULT 'photo',
  url             text NOT NULL,
  thumbnail_url   text,
  youtube_url     text,
  caption         text,
  file_size_bytes int,
  width           int,
  height          int,
  like_count      int NOT NULL DEFAULT 0,
  sort_order      int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_media_album  ON gallery_media(album_id);
CREATE INDEX idx_media_tenant ON gallery_media(tenant_id);

-- 24. notifications
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL,
  title       text NOT NULL,
  title_hi    text,
  title_gu    text,
  body        text NOT NULL,
  body_hi     text,
  body_gu     text,
  payload     jsonb NOT NULL DEFAULT '{}',
  channel     text NOT NULL DEFAULT 'push',
  is_read     boolean NOT NULL DEFAULT false,
  read_at     timestamptz,
  sent_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user   ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- 25. push_tokens
CREATE TABLE push_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  token       text NOT NULL UNIQUE,
  platform    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_push_tokens_user   ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_tenant ON push_tokens(tenant_id);

-- 26. audit_logs
CREATE TABLE audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid REFERENCES tenants(id) ON DELETE SET NULL,
  actor_id    uuid REFERENCES auth.users(id),
  actor_role  text,
  action      text NOT NULL,
  entity_type text,
  entity_id   uuid,
  before_data jsonb,
  after_data  jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_actor  ON audit_logs(actor_id);


-- ========================================================
-- MIGRATION: 00003_functions.sql
-- ========================================================

-- Stored Functions & Procedures

-- 1. Universal trigger function for updating updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Tenant financial summary calculation function
CREATE OR REPLACE FUNCTION tenant_financial_summary(p_tenant_id uuid)
RETURNS TABLE (
  total_donations   numeric,
  total_expenses    numeric,
  net_balance       numeric,
  pending_approvals int,
  donation_count    int,
  expense_count     int
) LANGUAGE sql STABLE AS $$
  WITH donation_stats AS (
    SELECT
      COALESCE(SUM(amount), 0) AS total_donations,
      COUNT(id)::int AS donation_count
    FROM donations
    WHERE tenant_id = p_tenant_id AND status = 'confirmed'
  ),
  expense_stats AS (
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE status IN ('approved', 'paid')), 0) AS total_expenses,
      COUNT(id) FILTER (WHERE status = 'pending_approval')::int AS pending_approvals,
      COUNT(id) FILTER (WHERE status IN ('approved', 'paid'))::int AS expense_count
    FROM expenses
    WHERE tenant_id = p_tenant_id
  )
  SELECT
    d.total_donations,
    e.total_expenses,
    (d.total_donations - e.total_expenses) AS net_balance,
    e.pending_approvals,
    d.donation_count,
    e.expense_count
  FROM donation_stats d, expense_stats e;
$$;

-- 3. Receipt number generation per tenant
CREATE OR REPLACE FUNCTION generate_receipt_number(p_tenant_id uuid)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_slug    text;
  v_year    text;
  v_seq     int;
BEGIN
  SELECT UPPER(LEFT(slug, 4)) INTO v_slug FROM tenants WHERE id = p_tenant_id;
  v_year := TO_CHAR(now(), 'YY');
  SELECT COUNT(*) + 1 INTO v_seq
    FROM donations
    WHERE tenant_id = p_tenant_id
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  RETURN v_slug || '-' || v_year || '-' || LPAD(v_seq::text, 5, '0');
END;
$$;

-- 4. Sync album media count
CREATE OR REPLACE FUNCTION update_album_media_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_albums SET media_count = media_count + 1 WHERE id = NEW.album_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_albums SET media_count = GREATEST(media_count - 1, 0) WHERE id = OLD.album_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 5. Send notification on expense status updates
CREATE OR REPLACE FUNCTION notify_expense_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  IF NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO notifications (tenant_id, user_id, type, title, body, payload)
    VALUES (
      NEW.tenant_id,
      NEW.submitted_by,
      'expense_' || NEW.status,
      CASE WHEN NEW.status = 'approved' THEN 'Expense Approved ✅' ELSE 'Expense Rejected ❌' END,
      NEW.title || ' — ' || NEW.status,
      jsonb_build_object(
        'entity_type', 'expense',
        'entity_id',   NEW.id,
        'deep_link',   '/expenses/' || NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$;


-- ========================================================
-- MIGRATION: 00004_rls.sql
-- ========================================================

-- Enable Row Level Security (RLS) on all tenant-scoped tables
ALTER TABLE tenant_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps            ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_duties       ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_checkins     ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors                ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees             ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_positions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_media          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs             ENABLE ROW LEVEL SECURITY;

-- 1. Helper function: Get user's role in the active tenant
CREATE OR REPLACE FUNCTION current_tenant_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT role FROM tenant_members
  WHERE user_id = auth.uid()
    AND tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND status = 'active';
$$;

-- 2. Tenant Members Policies
CREATE POLICY members_select ON tenant_members FOR SELECT
  USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

CREATE POLICY members_insert ON tenant_members FOR INSERT
  WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid AND current_tenant_role() IN ('owner', 'admin'));

CREATE POLICY members_update ON tenant_members FOR UPDATE
  USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid AND current_tenant_role() IN ('owner', 'admin'));

-- 3. Donations Policies
CREATE POLICY donations_select ON donations FOR SELECT
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND (
      donor_id = auth.uid()
      OR current_tenant_role() IN ('owner', 'admin', 'treasurer', 'committee_member')
    )
  );

CREATE POLICY donations_insert ON donations FOR INSERT
  WITH CHECK (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND current_tenant_role() IN ('owner', 'admin', 'treasurer')
  );

CREATE POLICY donations_update ON donations FOR UPDATE
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND current_tenant_role() IN ('owner', 'treasurer')
  );

-- 4. Expenses Policies
CREATE POLICY expenses_select ON expenses FOR SELECT
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND (
      submitted_by = auth.uid()
      OR current_tenant_role() IN ('owner', 'admin', 'treasurer', 'committee_member')
    )
  );

CREATE POLICY expenses_insert ON expenses FOR INSERT
  WITH CHECK (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND current_tenant_role() IN ('owner', 'admin', 'treasurer')
  );

CREATE POLICY expenses_update ON expenses FOR UPDATE
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND (
      (submitted_by = auth.uid() AND status = 'draft')
      OR current_tenant_role() IN ('owner', 'treasurer')
    )
  );

-- 5. Events Policies
CREATE POLICY events_select ON events FOR SELECT
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND (
      status = 'published'
      OR current_tenant_role() IN ('owner', 'admin')
    )
  );

CREATE POLICY events_insert ON events FOR INSERT
  WITH CHECK (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND current_tenant_role() IN ('owner', 'admin')
  );

CREATE POLICY events_update ON events FOR UPDATE
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND current_tenant_role() IN ('owner', 'admin')
  );

-- 6. Chat Messages Policies
CREATE POLICY chat_messages_select ON chat_messages FOR SELECT
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND is_deleted = false
    AND EXISTS (
      SELECT 1 FROM chat_channel_members ccm
      WHERE ccm.channel_id = chat_messages.channel_id
        AND ccm.user_id = auth.uid()
    )
  );

CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT
  WITH CHECK (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_channel_members ccm
      WHERE ccm.channel_id = chat_messages.channel_id
        AND ccm.user_id = auth.uid()
    )
  );

CREATE POLICY chat_messages_update ON chat_messages FOR UPDATE
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND (
      sender_id = auth.uid()
      OR current_tenant_role() IN ('owner', 'admin')
    )
  );

-- 7. Notifications Policies
CREATE POLICY notifications_select ON notifications FOR SELECT
  USING (user_id = auth.uid() AND tenant_id = (auth.jwt()->>'tenant_id')::uuid);

CREATE POLICY notifications_update ON notifications FOR UPDATE
  USING (user_id = auth.uid() AND tenant_id = (auth.jwt()->>'tenant_id')::uuid);

-- 8. Vendors Policies
CREATE POLICY vendors_select ON vendors FOR SELECT
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND (
      linked_user_id = auth.uid()
      OR current_tenant_role() IN ('owner', 'admin', 'treasurer')
    )
  );

-- 9. News Articles Policies
CREATE POLICY news_select ON news_articles FOR SELECT
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND (
      status = 'published'
      OR author_id = auth.uid()
      OR current_tenant_role() IN ('owner', 'admin')
    )
  );

-- 10. Audit Logs Policies
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT
  USING (
    tenant_id = (auth.jwt()->>'tenant_id')::uuid
    AND current_tenant_role() IN ('owner', 'admin')
  );


-- ========================================================
-- MIGRATION: 00005_triggers.sql
-- ========================================================

-- Triggers configuration

-- 1. Helper function for receipt number auto-generation trigger
CREATE OR REPLACE FUNCTION set_receipt_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.receipt_number IS NULL THEN
    NEW.receipt_number := generate_receipt_number(NEW.tenant_id);
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Helper function for chat channel last message date trigger
CREATE OR REPLACE FUNCTION update_channel_last_message()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE chat_channels SET last_message_at = NEW.sent_at WHERE id = NEW.channel_id;
  RETURN NEW;
END;
$$;

-- Bind updated_at trigger to updatable tables
CREATE TRIGGER tenants_updated_at         BEFORE UPDATE ON tenants         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tenant_members_updated_at  BEFORE UPDATE ON tenant_members  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER donations_updated_at       BEFORE UPDATE ON donations        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER expenses_updated_at        BEFORE UPDATE ON expenses         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER events_updated_at          BEFORE UPDATE ON events           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER vendors_updated_at         BEFORE UPDATE ON vendors          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER news_articles_updated_at   BEFORE UPDATE ON news_articles    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER blog_posts_updated_at      BEFORE UPDATE ON blog_posts       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER purchase_orders_updated_at BEFORE UPDATE ON purchase_orders  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER vendor_invoices_updated_at BEFORE UPDATE ON vendor_invoices  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER committees_updated_at      BEFORE UPDATE ON committees       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER chat_channels_updated_at   BEFORE UPDATE ON chat_channels    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER gallery_albums_updated_at  BEFORE UPDATE ON gallery_albums   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Bind receipt number auto-generation
CREATE TRIGGER donations_receipt_number
  BEFORE INSERT ON donations
  FOR EACH ROW EXECUTE FUNCTION set_receipt_number();

-- Bind expense status notifications
CREATE TRIGGER expenses_notify_status
  AFTER UPDATE OF status ON expenses
  FOR EACH ROW EXECUTE FUNCTION notify_expense_status();

-- Bind gallery album media count triggers
CREATE TRIGGER gallery_media_count_ins
  AFTER INSERT ON gallery_media
  FOR EACH ROW EXECUTE FUNCTION update_album_media_count();
CREATE TRIGGER gallery_media_count_del
  AFTER DELETE ON gallery_media
  FOR EACH ROW EXECUTE FUNCTION update_album_media_count();

-- Bind chat channel last message sync
CREATE TRIGGER chat_messages_last_at
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_channel_last_message();


-- ========================================================
-- MIGRATION: 00006_cron.sql
-- ========================================================

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


-- ========================================================
-- MIGRATION: 00007_seed_categories.sql
-- ========================================================

-- Seed default data for local testing

-- 1. Create dev/test tenant
INSERT INTO tenants (id, name, slug, vertical, plan, city, state, default_language)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Shree Sai Ganpati Mandal',
  'sai-ganpati-surat',
  'ganpati',
  'mandal',
  'Surat',
  'Gujarat',
  'gu'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create default expense categories for the dev/test tenant
INSERT INTO expense_categories (tenant_id, name, name_hi, name_gu, icon, budget, color, sort_order)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Decoration', 'सजावट', 'ડેકોરેશન', 'paint-brush', 50000.00, '#FF9500', 1),
  ('a0000000-0000-0000-0000-000000000001', 'Sound & Lighting', 'ध्वनि और प्रकाश', 'સાઉન્ડ અને લાઈટિંગ', 'volume-2', 30000.00, '#D92B2B', 2),
  ('a0000000-0000-0000-0000-000000000001', 'Idol & Mandap', 'मूर्ति और मंडप', 'મૂર્તિ અને મંડપ', 'home', 100000.00, '#C9921A', 3),
  ('a0000000-0000-0000-0000-000000000001', 'Catering / Prasad', 'खान-पान / प्रसाद', 'કેટરિંગ / પ્રસાદ', 'utensils', 40000.00, '#22C55E', 4),
  ('a0000000-0000-0000-0000-000000000001', 'Photography & Video', 'फोटोग्राफी', 'ફોટોગ્રાફી', 'camera', 20000.00, '#EAB308', 5),
  ('a0000000-0000-0000-0000-000000000001', 'Printing', 'छपाई', 'પ્રિન્ટિંગ', 'printer', 10000.00, '#3B82F6', 6),
  ('a0000000-0000-0000-0000-000000000001', 'Transport', 'परिवहन', 'ટ્રાન્સપોર્ટ', 'truck', 15000.00, '#8B5CF6', 7),
  ('a0000000-0000-0000-0000-000000000001', 'Miscellaneous', 'विविध', 'પરચૂરણ', 'help-circle', 10000.00, '#6B7280', 8)
ON CONFLICT (tenant_id, name) DO NOTHING;

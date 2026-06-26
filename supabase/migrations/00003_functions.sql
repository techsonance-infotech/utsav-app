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

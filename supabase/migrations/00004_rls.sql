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

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

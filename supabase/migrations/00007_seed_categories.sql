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

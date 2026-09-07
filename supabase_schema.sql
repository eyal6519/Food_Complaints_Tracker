-- ==========================================================
-- Supabase SQL Schema for Food Complaint Process Management
-- Copy and paste this script into Supabase SQL Editor and click RUN
-- ==========================================================

-- 1. Create Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  warehouse_name TEXT NOT NULL,
  date_sent_to_us DATE NOT NULL,
  date_sent_to_supplier DATE NOT NULL,
  description TEXT NOT NULL,
  date_response_received DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Lookup Tables for Suggestions / Autocomplete
CREATE TABLE IF NOT EXISTS categories (
  name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS suppliers (
  name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS warehouses (
  name TEXT PRIMARY KEY
);

-- 3. Enable Row Level Security (RLS) and grant read/write for service/anon role
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to complaints" ON complaints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to warehouses" ON warehouses FOR ALL USING (true) WITH CHECK (true);

-- 4. Insert Initial Seed Data for Autocomplete Suggestions
INSERT INTO categories (name) VALUES
  ('Packaging Damage'),
  ('Temperature Abuse / Cold Chain'),
  ('Expired / Near Expiry'),
  ('Foreign Material / Contamination'),
  ('Incorrect Labeling / Allergen'),
  ('Quality / Taste / Texture'),
  ('Quantity / Shortage'),
  ('Damaged Pallet / Crushed Goods')
ON CONFLICT (name) DO NOTHING;

INSERT INTO suppliers (name) VALUES
  ('Tnuva Dairy'),
  ('Osem-Nestle'),
  ('Strauss Group'),
  ('Tara Dairy'),
  ('Unilever Foods'),
  ('Jafora-Tabori'),
  ('Tempo Beverages'),
  ('Wissotzky Tea'),
  ('Sugat Industries')
ON CONFLICT (name) DO NOTHING;

INSERT INTO warehouses (name) VALUES
  ('Central Logistics Hub (Rishon LeZion)'),
  ('Northern Distribution Center (Haifa)'),
  ('Southern Cold Storage (Beer Sheva)'),
  ('Jerusalem Regional Warehouse'),
  ('Airport City Logistics Park')
ON CONFLICT (name) DO NOTHING;

-- 5. Insert Sample Complaints
INSERT INTO complaints (id, category, supplier_name, warehouse_name, date_sent_to_us, date_sent_to_supplier, description, date_response_received, notes)
VALUES
  ('c-1001', 'Temperature Abuse / Cold Chain', 'Tnuva Dairy', 'Northern Distribution Center (Haifa)', '2026-08-01', '2026-08-02', 'Yogurt delivery arrived at +11°C (required < +4°C). 4 pallets rejected at dock receiving.', NULL, NULL),
  ('c-1002', 'Packaging Damage', 'Osem-Nestle', 'Central Logistics Hub (Rishon LeZion)', '2026-08-10', '2026-08-11', 'Crushed cartons on lower tier of pallet #491. 12 cases of pasta torn open with contents spilled.', '2026-08-14', 'Supplier issued full credit note #CR-88421.'),
  ('c-1003', 'Expired / Near Expiry', 'Strauss Group', 'Southern Cold Storage (Beer Sheva)', '2026-08-16', '2026-08-17', 'Received Hummus batches with only 4 days shelf life remaining (minimum contract agreement is 21 days).', NULL, NULL),
  ('c-1004', 'Foreign Material / Contamination', 'Sugat Industries', 'Central Logistics Hub (Rishon LeZion)', '2026-07-20', '2026-07-21', 'Plastic fragments discovered inside 1kg Sugar bulk packaging. Sample retained for supplier QA inspection.', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

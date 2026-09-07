import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Complaint } from '@/types/complaint';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'complaints.json');

// Initialize Supabase if environment variables exist
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

interface DatabaseSchema {
  complaints: Complaint[];
  categories: string[];
  suppliers: string[];
  warehouses: string[];
}

const DEFAULT_CATEGORIES = [
  'Packaging Damage',
  'Temperature Abuse / Cold Chain',
  'Expired / Near Expiry',
  'Foreign Material / Contamination',
  'Incorrect Labeling / Allergen',
  'Quality / Taste / Texture',
  'Quantity / Shortage',
  'Damaged Pallet / Crushed Goods'
];

const DEFAULT_SUPPLIERS = [
  'Tnuva Dairy',
  'Osem-Nestle',
  'Strauss Group',
  'Tara Dairy',
  'Unilever Foods',
  'Jafora-Tabori',
  'Tempo Beverages',
  'Wissotzky Tea',
  'Sugat Industries'
];

const DEFAULT_WAREHOUSES = [
  'Central Logistics Hub (Rishon LeZion)',
  'Northern Distribution Center (Haifa)',
  'Southern Cold Storage (Beer Sheva)',
  'Jerusalem Regional Warehouse',
  'Airport City Logistics Park'
];

const INITIAL_SAMPLE_COMPLAINTS: Complaint[] = [
  {
    id: 'c-1001',
    category: 'Temperature Abuse / Cold Chain',
    supplierName: 'Tnuva Dairy',
    warehouseName: 'Northern Distribution Center (Haifa)',
    dateSentToUs: '2026-08-01',
    dateSentToSupplier: '2026-08-02',
    description: 'Yogurt delivery arrived at +11°C (required < +4°C). 4 pallets rejected at dock receiving.',
    dateResponseReceived: null,
    createdAt: new Date('2026-08-02T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-02T10:00:00Z').toISOString()
  },
  {
    id: 'c-1002',
    category: 'Packaging Damage',
    supplierName: 'Osem-Nestle',
    warehouseName: 'Central Logistics Hub (Rishon LeZion)',
    dateSentToUs: '2026-08-10',
    dateSentToSupplier: '2026-08-11',
    description: 'Crushed cartons on lower tier of pallet #491. 12 cases of pasta torn open with contents spilled.',
    dateResponseReceived: '2026-08-14',
    notes: 'Supplier issued full credit note #CR-88421.',
    createdAt: new Date('2026-08-11T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-08-14T15:00:00Z').toISOString()
  },
  {
    id: 'c-1003',
    category: 'Expired / Near Expiry',
    supplierName: 'Strauss Group',
    warehouseName: 'Southern Cold Storage (Beer Sheva)',
    dateSentToUs: '2026-08-16',
    dateSentToSupplier: '2026-08-17',
    description: 'Received Hummus batches with only 4 days shelf life remaining (minimum contract agreement is 21 days).',
    dateResponseReceived: null,
    createdAt: new Date('2026-08-17T08:15:00Z').toISOString(),
    updatedAt: new Date('2026-08-17T08:15:00Z').toISOString()
  },
  {
    id: 'c-1004',
    category: 'Foreign Material / Contamination',
    supplierName: 'Sugat Industries',
    warehouseName: 'Central Logistics Hub (Rishon LeZion)',
    dateSentToUs: '2026-07-20',
    dateSentToSupplier: '2026-07-21',
    description: 'Plastic fragments discovered inside 1kg Sugar bulk packaging. Sample retained for supplier QA inspection.',
    dateResponseReceived: null,
    createdAt: new Date('2026-07-21T11:00:00Z').toISOString(),
    updatedAt: new Date('2026-07-21T11:00:00Z').toISOString()
  }
];

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDb(): DatabaseSchema {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      complaints: INITIAL_SAMPLE_COMPLAINTS,
      categories: DEFAULT_CATEGORIES,
      suppliers: DEFAULT_SUPPLIERS,
      warehouses: DEFAULT_WAREHOUSES
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw) as DatabaseSchema;
    if (!data.complaints) data.complaints = [];
    if (!data.categories) data.categories = DEFAULT_CATEGORIES;
    if (!data.suppliers) data.suppliers = DEFAULT_SUPPLIERS;
    if (!data.warehouses) data.warehouses = DEFAULT_WAREHOUSES;
    return data;
  } catch {
    const initialData: DatabaseSchema = {
      complaints: INITIAL_SAMPLE_COMPLAINTS,
      categories: DEFAULT_CATEGORIES,
      suppliers: DEFAULT_SUPPLIERS,
      warehouses: DEFAULT_WAREHOUSES
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function writeDb(data: DatabaseSchema): void {
  ensureDataDir();
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Convert Supabase row to Complaint object
function mapSupabaseRowToComplaint(row: any): Complaint {
  return {
    id: row.id,
    category: row.category,
    supplierName: row.supplier_name,
    warehouseName: row.warehouse_name,
    dateSentToUs: row.date_sent_to_us,
    dateSentToSupplier: row.date_sent_to_supplier,
    description: row.description,
    dateResponseReceived: row.date_response_received || null,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const db = {
  isUsingSupabase(): boolean {
    return supabase !== null;
  },

  async getComplaints(): Promise<Complaint[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('date_sent_to_supplier', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapSupabaseRowToComplaint);
    }

    const localData = readDb();
    return [...localData.complaints].sort((a, b) => {
      const dateA = a.dateSentToSupplier || a.dateSentToUs || a.createdAt;
      const dateB = b.dateSentToSupplier || b.dateSentToUs || b.createdAt;
      return dateB.localeCompare(dateA);
    });
  },

  async getComplaintById(id: string): Promise<Complaint | undefined> {
    if (supabase) {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return undefined;
      return mapSupabaseRowToComplaint(data);
    }

    const localData = readDb();
    return localData.complaints.find((c) => c.id === id);
  },

  async createComplaint(complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>): Promise<Complaint> {
    const id = 'c-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const now = new Date().toISOString();

    if (supabase) {
      const row = {
        id,
        category: complaint.category.trim(),
        supplier_name: complaint.supplierName.trim(),
        warehouse_name: complaint.warehouseName.trim(),
        date_sent_to_us: complaint.dateSentToUs.trim(),
        date_sent_to_supplier: complaint.dateSentToSupplier.trim(),
        description: complaint.description.trim(),
        date_response_received: complaint.dateResponseReceived?.trim() || null,
        notes: complaint.notes?.trim() || null,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('complaints')
        .insert(row)
        .select()
        .single();

      if (error) throw error;

      // Auto-insert categories, suppliers, warehouses
      await Promise.allSettled([
        supabase.from('categories').upsert({ name: complaint.category.trim() }),
        supabase.from('suppliers').upsert({ name: complaint.supplierName.trim() }),
        supabase.from('warehouses').upsert({ name: complaint.warehouseName.trim() })
      ]);

      return mapSupabaseRowToComplaint(data);
    }

    const localData = readDb();
    const newComplaint: Complaint = {
      ...complaint,
      id,
      createdAt: now,
      updatedAt: now
    };

    localData.complaints.unshift(newComplaint);

    if (complaint.category && !localData.categories.includes(complaint.category.trim())) {
      localData.categories.push(complaint.category.trim());
    }
    if (complaint.supplierName && !localData.suppliers.includes(complaint.supplierName.trim())) {
      localData.suppliers.push(complaint.supplierName.trim());
    }
    if (complaint.warehouseName && !localData.warehouses.includes(complaint.warehouseName.trim())) {
      localData.warehouses.push(complaint.warehouseName.trim());
    }

    writeDb(localData);
    return newComplaint;
  },

  async updateComplaint(id: string, updates: Partial<Omit<Complaint, 'id' | 'createdAt'>>): Promise<Complaint | null> {
    const now = new Date().toISOString();

    if (supabase) {
      const dbUpdates: any = { updated_at: now };
      if (updates.category !== undefined) dbUpdates.category = updates.category.trim();
      if (updates.supplierName !== undefined) dbUpdates.supplier_name = updates.supplierName.trim();
      if (updates.warehouseName !== undefined) dbUpdates.warehouse_name = updates.warehouseName.trim();
      if (updates.dateSentToUs !== undefined) dbUpdates.date_sent_to_us = updates.dateSentToUs.trim();
      if (updates.dateSentToSupplier !== undefined) dbUpdates.date_sent_to_supplier = updates.dateSentToSupplier.trim();
      if (updates.description !== undefined) dbUpdates.description = updates.description.trim();
      if (updates.dateResponseReceived !== undefined) {
        dbUpdates.date_response_received = updates.dateResponseReceived?.trim() || null;
      }
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes?.trim() || null;

      const { data, error } = await supabase
        .from('complaints')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) return null;

      if (updates.category) await supabase.from('categories').upsert({ name: updates.category.trim() });
      if (updates.supplierName) await supabase.from('suppliers').upsert({ name: updates.supplierName.trim() });
      if (updates.warehouseName) await supabase.from('warehouses').upsert({ name: updates.warehouseName.trim() });

      return mapSupabaseRowToComplaint(data);
    }

    const localData = readDb();
    const index = localData.complaints.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const existing = localData.complaints[index];
    const updated: Complaint = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now
    };

    localData.complaints[index] = updated;

    if (updated.category && !localData.categories.includes(updated.category.trim())) {
      localData.categories.push(updated.category.trim());
    }
    if (updated.supplierName && !localData.suppliers.includes(updated.supplierName.trim())) {
      localData.suppliers.push(updated.supplierName.trim());
    }
    if (updated.warehouseName && !localData.warehouses.includes(updated.warehouseName.trim())) {
      localData.warehouses.push(updated.warehouseName.trim());
    }

    writeDb(localData);
    return updated;
  },

  async deleteComplaint(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from('complaints').delete().eq('id', id);
      return !error;
    }

    const localData = readDb();
    const initialLen = localData.complaints.length;
    localData.complaints = localData.complaints.filter((c) => c.id !== id);
    if (localData.complaints.length !== initialLen) {
      writeDb(localData);
      return true;
    }
    return false;
  },

  async getSuggestions(): Promise<{ categories: string[]; suppliers: string[]; warehouses: string[] }> {
    if (supabase) {
      const [catsRes, supsRes, whsRes] = await Promise.all([
        supabase.from('categories').select('name'),
        supabase.from('suppliers').select('name'),
        supabase.from('warehouses').select('name')
      ]);

      const categories = (catsRes.data || []).map((r) => r.name).sort();
      const suppliers = (supsRes.data || []).map((r) => r.name).sort();
      const warehouses = (whsRes.data || []).map((r) => r.name).sort();

      return {
        categories: categories.length > 0 ? categories : DEFAULT_CATEGORIES,
        suppliers: suppliers.length > 0 ? suppliers : DEFAULT_SUPPLIERS,
        warehouses: warehouses.length > 0 ? warehouses : DEFAULT_WAREHOUSES
      };
    }

    const localData = readDb();
    return {
      categories: Array.from(new Set(localData.categories)).sort(),
      suppliers: Array.from(new Set(localData.suppliers)).sort(),
      warehouses: Array.from(new Set(localData.warehouses)).sort()
    };
  }
};

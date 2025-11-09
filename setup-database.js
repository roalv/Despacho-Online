/**
 * Supabase Database Setup Script
 * 
 * This script creates all necessary tables for the Despacho Online application.
 * Run this ONCE after setting up your Supabase project.
 * 
 * Usage: node setup-database.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const setupSQL = `
-- Database Setup for Despacho Online
-- Run this in Supabase SQL Editor

-- Create clientes table
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  nif TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documentos_clientes table
CREATE TABLE IF NOT EXISTS documentos_clientes (
  id TEXT PRIMARY KEY,
  "clienteId" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT,
  "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("clienteId") REFERENCES clientes(id) ON DELETE CASCADE
);

-- Create despachos table
CREATE TABLE IF NOT EXISTS despachos (
  id TEXT PRIMARY KEY,
  "clienteId" TEXT NOT NULL,
  destino TEXT NOT NULL,
  "dataEmbarque" DATE,
  "numeroContentor" TEXT,
  estado TEXT DEFAULT 'Em aberto',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("clienteId") REFERENCES clientes(id) ON DELETE CASCADE
);

-- Create documentos_despachos table
CREATE TABLE IF NOT EXISTS documentos_despachos (
  id TEXT PRIMARY KEY,
  "despachoId" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT,
  "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("despachoId") REFERENCES despachos(id) ON DELETE CASCADE
);

-- Create produtos table
CREATE TABLE IF NOT EXISTS produtos (
  id TEXT PRIMARY KEY,
  "despachoId" TEXT NOT NULL,
  nome TEXT NOT NULL,
  peso DECIMAL(10,2),
  quantidade INTEGER,
  valor DECIMAL(10,2),
  "hsCode" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("despachoId") REFERENCES despachos(id) ON DELETE CASCADE
);

-- Create pauta table (HS Codes)
CREATE TABLE IF NOT EXISTS pauta (
  id TEXT PRIMARY KEY,
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE despachos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_despachos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pauta ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for MVP - adjust security later)
DROP POLICY IF EXISTS "Allow all operations" ON clientes;
CREATE POLICY "Allow all operations" ON clientes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations" ON documentos_clientes;
CREATE POLICY "Allow all operations" ON documentos_clientes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations" ON despachos;
CREATE POLICY "Allow all operations" ON despachos FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations" ON documentos_despachos;
CREATE POLICY "Allow all operations" ON documentos_despachos FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations" ON produtos;
CREATE POLICY "Allow all operations" ON produtos FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations" ON pauta;
CREATE POLICY "Allow all operations" ON pauta FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clientes_created ON clientes("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_despachos_cliente ON despachos("clienteId");
CREATE INDEX IF NOT EXISTS idx_despachos_estado ON despachos(estado);
CREATE INDEX IF NOT EXISTS idx_produtos_despacho ON produtos("despachoId");
CREATE INDEX IF NOT EXISTS idx_pauta_codigo ON pauta(codigo);
CREATE INDEX IF NOT EXISTS idx_pauta_descricao ON pauta(descricao);

-- Insert sample HS codes (pauta)
INSERT INTO pauta (id, codigo, descricao) VALUES
  ('hs_1', '0101.21', 'Cavalos reprodutores de raça pura'),
  ('hs_2', '0201.10', 'Carcaças e meias-carcaças de bovino'),
  ('hs_3', '0301.11', 'Peixes ornamentais de água doce'),
  ('hs_4', '0401.10', 'Leite com teor de matérias gordas'),
  ('hs_5', '0501.00', 'Cabelos em bruto'),
  ('hs_6', '0601.10', 'Bolbos, tubérculos, raízes tuberosas'),
  ('hs_7', '0701.10', 'Batatas para semeadura'),
  ('hs_8', '0801.11', 'Cocos secos'),
  ('hs_9', '0901.11', 'Café não torrado, não descafeinado'),
  ('hs_10', '1001.11', 'Trigo duro para semeadura'),
  ('hs_11', '1101.00', 'Farinha de trigo ou de mistura'),
  ('hs_12', '1201.10', 'Soja para semeadura'),
  ('hs_13', '1301.20', 'Goma-arábica'),
  ('hs_14', '1401.10', 'Bambus'),
  ('hs_15', '1501.10', 'Banha de porco'),
  ('hs_16', '1601.00', 'Enchidos e produtos semelhantes'),
  ('hs_17', '1701.12', 'Açúcar de beterraba'),
  ('hs_18', '1801.00', 'Cacau inteiro ou partido'),
  ('hs_19', '1901.10', 'Preparações para alimentação'),
  ('hs_20', '2001.10', 'Pepinos e pepininhos'),
  ('hs_21', '2101.11', 'Extratos, essências e concentrados de café'),
  ('hs_22', '2201.10', 'Águas minerais e águas gaseificadas'),
  ('hs_23', '2301.10', 'Farinhas, pós e pellets, de carnes'),
  ('hs_24', '2401.10', 'Tabaco não manufaturado'),
  ('hs_25', '2501.00', 'Sal de cozinha e sal puro'),
  ('hs_26', '2601.11', 'Minérios de ferro não aglomerados'),
  ('hs_27', '2701.11', 'Hulhas, mesmo em pó, mas não aglomeradas'),
  ('hs_28', '2801.10', 'Cloro'),
  ('hs_29', '2901.10', 'Hidrocarbonetos acíclicos saturados'),
  ('hs_30', '3001.20', 'Extratos de glândulas ou de outros órgãos')
ON CONFLICT (id) DO NOTHING;
`;

console.log('='.repeat(70))
console.log('📋 SUPABASE DATABASE SETUP INSTRUCTIONS')
console.log('='.repeat(70))
console.log('')
console.log('To set up your database, follow these steps:')
console.log('')
console.log('1. Go to your Supabase Dashboard:')
console.log('   https://supabase.com/dashboard')
console.log('')
console.log('2. Select your project')
console.log('')
console.log('3. Click on "SQL Editor" in the left sidebar')
console.log('')
console.log('4. Click "New Query"')
console.log('')
console.log('5. Copy and paste the SQL code below:')
console.log('')
console.log('='.repeat(70))
console.log(setupSQL)
console.log('='.repeat(70))
console.log('')
console.log('6. Click "Run" to execute the SQL')
console.log('')
console.log('7. Create Storage Buckets:')
console.log('   - Go to "Storage" in the left sidebar')
console.log('   - Click "New bucket"')
console.log('   - Create bucket: "documentos-clientes" (Public bucket)')
console.log('   - Create bucket: "documentos-despachos" (Public bucket)')
console.log('')
console.log('='.repeat(70))
console.log('✅ After completing these steps, your database will be ready!')
console.log('='.repeat(70))

async function testConnection() {
  console.log('')
  console.log('Testing Supabase connection...')
  try {
    const { data, error } = await supabase.from('pauta').select('count')
    if (error) {
      console.log('⚠️  Database not set up yet. Please run the SQL above.')
    } else {
      console.log('✅ Connection successful! Database is ready.')
    }
  } catch (err) {
    console.log('⚠️  Please set up the database using the SQL above.')
  }
}

testConnection()

// Database setup script - Run this once to create all tables
// This provides SQL commands to run in Supabase SQL Editor

export const setupSQL = `
-- Drop existing tables if recreating (optional)
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS documentos_despachos CASCADE;
DROP TABLE IF EXISTS despachos CASCADE;
DROP TABLE IF EXISTS documentos_clientes CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;

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

-- Note: pauta table should already exist
-- If not, create it:
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

-- Create policies for public access (for MVP)
CREATE POLICY "Allow all operations" ON clientes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON documentos_clientes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON despachos FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON documentos_despachos FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON produtos FOR ALL USING (true);
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
  ('hs_20', '2001.10', 'Pepinos e pepininhos')
ON CONFLICT (id) DO NOTHING;

-- Create storage buckets (run this separately if needed)
-- This should be done via Supabase dashboard or API
-- Buckets needed: 'documentos-clientes', 'documentos-despachos'
`;

export default setupSQL;
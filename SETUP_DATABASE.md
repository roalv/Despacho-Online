# 🗄️ Database Setup Instructions

## ⚠️ IMPORTANT: Run This First!

Before using the application, you need to set up the database tables in Supabase.

## 📋 Step-by-Step Guide

### Step 1: Access Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: **yxdufeiphenwlnnqbwji**
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Copy and Run the SQL

Copy the ENTIRE SQL code below and paste it into the SQL Editor, then click **"Run"**:

```sql
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

-- Enable Row Level Security
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE despachos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_despachos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pauta ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for MVP)
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
```

### Step 3: Create Storage Buckets

1. In your Supabase dashboard, click on **"Storage"** in the left sidebar
2. Click **"New bucket"**
3. Create the first bucket:
   - Name: **documentos-clientes**
   - Public bucket: **YES** (toggle on)
   - Click **"Create bucket"**
4. Create the second bucket:
   - Name: **documentos-despachos**
   - Public bucket: **YES** (toggle on)
   - Click **"Create bucket"**

### Step 4: Verify Setup

After running the SQL and creating the buckets:

1. Go to **"Table Editor"** in your Supabase dashboard
2. You should see these tables:
   - ✅ clientes
   - ✅ documentos_clientes
   - ✅ despachos
   - ✅ documentos_despachos
   - ✅ produtos
   - ✅ pauta (already exists with HS codes)

3. Go to **"Storage"** in your Supabase dashboard
4. You should see these buckets:
   - ✅ documentos-clientes
   - ✅ documentos-despachos

## ✅ You're Done!

Your database is now ready! You can start using the Despacho Online application:

1. Register a new user account
2. Create clients
3. Create dispatches
4. Classify products
5. Upload documents

## 🆘 Troubleshooting

**Problem**: Error "Could not find the table 'public.clientes'"
- **Solution**: Run the SQL in Step 2 above

**Problem**: File upload fails
- **Solution**: Make sure you created the storage buckets in Step 3

**Problem**: Can't find any HS codes when searching
- **Solution**: The "pauta" table already has data. Try searching for "cafe" or "trigo"

---

**Need help?** Make sure all steps above are completed in order.

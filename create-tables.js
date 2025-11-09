const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yxdufeiphenwlnnqbwji.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZHVmZWlwaGVud2xubnFid2ppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcxMzU3NiwiZXhwIjoyMDc4Mjg5NTc2fQ.28kmX6PEstwDgseZ0EcW9yKn2TTGKtgJYV8l-cJj9Ds'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createTables() {
  console.log('🚀 Criando tabelas no Supabase...\n')

  const queries = [
    // Clientes
    `CREATE TABLE IF NOT EXISTS clientes (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      nif TEXT NOT NULL,
      telefone TEXT,
      email TEXT,
      endereco TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Documentos Clientes
    `CREATE TABLE IF NOT EXISTS documentos_clientes (
      id TEXT PRIMARY KEY,
      "clienteId" TEXT NOT NULL,
      "fileUrl" TEXT NOT NULL,
      "fileName" TEXT NOT NULL,
      "fileType" TEXT,
      "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("clienteId") REFERENCES clientes(id) ON DELETE CASCADE
    )`,
    
    // Despachos
    `CREATE TABLE IF NOT EXISTS despachos (
      id TEXT PRIMARY KEY,
      "clienteId" TEXT NOT NULL,
      destino TEXT NOT NULL,
      "dataEmbarque" DATE,
      "numeroContentor" TEXT,
      estado TEXT DEFAULT 'Em aberto',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("clienteId") REFERENCES clientes(id) ON DELETE CASCADE
    )`,
    
    // Documentos Despachos
    `CREATE TABLE IF NOT EXISTS documentos_despachos (
      id TEXT PRIMARY KEY,
      "despachoId" TEXT NOT NULL,
      "fileUrl" TEXT NOT NULL,
      "fileName" TEXT NOT NULL,
      "fileType" TEXT,
      "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("despachoId") REFERENCES despachos(id) ON DELETE CASCADE
    )`,
    
    // Produtos
    `CREATE TABLE IF NOT EXISTS produtos (
      id TEXT PRIMARY KEY,
      "despachoId" TEXT NOT NULL,
      nome TEXT NOT NULL,
      peso DECIMAL(10,2),
      quantidade INTEGER,
      valor DECIMAL(10,2),
      "hsCode" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("despachoId") REFERENCES despachos(id) ON DELETE CASCADE
    )`
  ]

  try {
    for (const query of queries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.log('❌ Erro ao executar query:', error.message)
      }
    }
    
    console.log('✅ Tabelas criadas com sucesso!\n')
    console.log('🔒 Configurando políticas de segurança...\n')
    
    // Enable RLS and create policies
    const tables = ['clientes', 'documentos_clientes', 'despachos', 'documentos_despachos', 'produtos', 'pauta']
    
    for (const table of tables) {
      await supabase.rpc('exec_sql', { 
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY` 
      })
      
      await supabase.rpc('exec_sql', { 
        sql: `DROP POLICY IF EXISTS "Allow all operations" ON ${table}` 
      })
      
      await supabase.rpc('exec_sql', { 
        sql: `CREATE POLICY "Allow all operations" ON ${table} FOR ALL USING (true)` 
      })
    }
    
    console.log('✅ Políticas configuradas!\n')
    console.log('📊 Criando índices...\n')
    
    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_clientes_created ON clientes("createdAt" DESC)',
      'CREATE INDEX IF NOT EXISTS idx_despachos_cliente ON despachos("clienteId")',
      'CREATE INDEX IF NOT EXISTS idx_despachos_estado ON despachos(estado)',
      'CREATE INDEX IF NOT EXISTS idx_produtos_despacho ON produtos("despachoId")',
    ]
    
    for (const idx of indexes) {
      await supabase.rpc('exec_sql', { sql: idx })
    }
    
    console.log('✅ Índices criados!\n')
    console.log('🎉 Setup completo! Todas as tabelas estão prontas.\n')
    
  } catch (error) {
    console.error('❌ Erro durante setup:', error)
  }
}

createTables()

-- ============================================================
-- SCRIPT DE ATUALIZAÇÃO DO BANCO DE DADOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- 1. ATUALIZAR TABELA DESPACHOS
-- Remover campos: destino, dataEmbarque, numeroContentor
-- Adicionar campo: numeroSeries

ALTER TABLE despachos DROP COLUMN IF EXISTS destino;
ALTER TABLE despachos DROP COLUMN IF EXISTS "dataEmbarque";
ALTER TABLE despachos DROP COLUMN IF EXISTS "numeroContentor";
ALTER TABLE despachos ADD COLUMN IF NOT EXISTS "numeroSeries" TEXT;

-- 2. ATUALIZAR TABELA PRODUTOS
-- Renomear campo hsCode para codigo

ALTER TABLE produtos RENAME COLUMN "hsCode" TO codigo;

-- 3. CRIAR NOVA TABELA USERS
-- Para controle de autenticação manual

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Criar política para a tabela users (acesso público para MVP)
DROP POLICY IF EXISTS "Allow all operations" ON users;
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);

-- Criar índice para email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================

-- Verifique a estrutura da tabela despachos:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'despachos';

-- Verifique a estrutura da tabela produtos:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'produtos';

-- Verifique a estrutura da tabela users:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';

-- ============================================================
-- ✅ APÓS EXECUTAR, AS ALTERAÇÕES ESTARÃO CONCLUÍDAS!
-- ============================================================

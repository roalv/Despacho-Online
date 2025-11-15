-- ============================================================
-- ADICIONAR COLUNA 'nome' À TABELA USERS
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- Adicionar coluna nome à tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS nome TEXT;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- ============================================================
-- ✅ APÓS EXECUTAR, VOCÊ PODERÁ EDITAR O NOME NO PERFIL!
-- ============================================================

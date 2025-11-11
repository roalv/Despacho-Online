-- Adicionar campo userId nas tabelas para controle de acesso por usuário

-- Adicionar userId na tabela clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS "userId" UUID;

-- Adicionar userId na tabela despachos
ALTER TABLE despachos ADD COLUMN IF NOT EXISTS "userId" UUID;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_userid ON clientes("userId");
CREATE INDEX IF NOT EXISTS idx_despachos_userid ON despachos("userId");

-- Nota: produtos e documentos herdam o userId através das foreign keys
-- (produtos → despachos → userId, documentos → clientes/despachos → userId)

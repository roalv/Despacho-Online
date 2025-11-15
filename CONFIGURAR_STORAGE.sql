-- ============================================================
-- CONFIGURAR POLÍTICAS DE ACESSO AO SUPABASE STORAGE
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- IMPORTANTE: Estas políticas permitem upload e acesso público aos buckets
-- Isso é necessário para que o upload de documentos funcione

-- ============================================================
-- POLÍTICAS PARA O BUCKET: documentos-clientes
-- ============================================================

-- Permitir INSERT (upload) para todos
DROP POLICY IF EXISTS "Allow public insert" ON storage.objects;
CREATE POLICY "Allow public insert" 
ON storage.objects 
FOR INSERT 
TO public
WITH CHECK (bucket_id = 'documentos-clientes');

-- Permitir SELECT (download/visualização) para todos
DROP POLICY IF EXISTS "Allow public select clientes" ON storage.objects;
CREATE POLICY "Allow public select clientes" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'documentos-clientes');

-- Permitir UPDATE para todos
DROP POLICY IF EXISTS "Allow public update clientes" ON storage.objects;
CREATE POLICY "Allow public update clientes" 
ON storage.objects 
FOR UPDATE 
TO public
USING (bucket_id = 'documentos-clientes');

-- Permitir DELETE para todos
DROP POLICY IF EXISTS "Allow public delete clientes" ON storage.objects;
CREATE POLICY "Allow public delete clientes" 
ON storage.objects 
FOR DELETE 
TO public
USING (bucket_id = 'documentos-clientes');

-- ============================================================
-- POLÍTICAS PARA O BUCKET: documentos-despachos
-- ============================================================

-- Permitir INSERT (upload) para todos
DROP POLICY IF EXISTS "Allow public insert despachos" ON storage.objects;
CREATE POLICY "Allow public insert despachos" 
ON storage.objects 
FOR INSERT 
TO public
WITH CHECK (bucket_id = 'documentos-despachos');

-- Permitir SELECT (download/visualização) para todos
DROP POLICY IF EXISTS "Allow public select despachos" ON storage.objects;
CREATE POLICY "Allow public select despachos" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'documentos-despachos');

-- Permitir UPDATE para todos
DROP POLICY IF EXISTS "Allow public update despachos" ON storage.objects;
CREATE POLICY "Allow public update despachos" 
ON storage.objects 
FOR UPDATE 
TO public
USING (bucket_id = 'documentos-despachos');

-- Permitir DELETE para todos
DROP POLICY IF EXISTS "Allow public delete despachos" ON storage.objects;
CREATE POLICY "Allow public delete despachos" 
ON storage.objects 
FOR DELETE 
TO public
USING (bucket_id = 'documentos-despachos');

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================

-- Verificar políticas criadas:
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- ============================================================
-- ✅ APÓS EXECUTAR, O UPLOAD DE DOCUMENTOS FUNCIONARÁ!
-- ============================================================

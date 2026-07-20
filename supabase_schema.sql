-- Script SQL para criação das tabelas no Supabase (Execute no SQL Editor do seu projeto Supabase)

-- 1. Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    action_type TEXT NOT NULL,
    corporation_id TEXT,
    payload JSONB,
    status TEXT DEFAULT 'SUCCESS',
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Relatórios Persistidos
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    tool_type TEXT NOT NULL,
    corporation_id TEXT,
    filter_applied JSONB,
    total_items INTEGER DEFAULT 0,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar Row Level Security (RLS) para proteção de dados
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas simples de acesso (Permitir leitura/escrita para qualquer usuário autenticado ou via chave Anon)
-- Nota: Você pode restringir mais no console do Supabase conforme necessário para seu ambiente corporativo.
CREATE POLICY "Allow anonymous inserts to audit_logs" ON audit_logs 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select from audit_logs" ON audit_logs 
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous inserts to reports" ON reports 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select from reports" ON reports 
    FOR SELECT USING (true);

-- 5. Configurar Bucket de Storage e suas políticas para os arquivos Excel
-- Criar o bucket "reports" caso não exista
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir uploads públicos (qualquer usuário/anon) para o bucket "reports"
CREATE POLICY "Allow public uploads to reports bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'reports');

-- Permitir leitura pública de arquivos do bucket "reports"
CREATE POLICY "Allow public select from reports bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'reports');

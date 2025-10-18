-- PAA Explorer Database Schema
-- Built with the VOID Loop methodology

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'builder', 'enterprise')),
    api_key UUID DEFAULT uuid_generate_v4(),
    usage_quota INTEGER DEFAULT 10, -- Free tier: 10 jobs per month
    usage_current INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table - tracks PAA analysis jobs
CREATE TABLE public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    progress FLOAT DEFAULT 0.0 CHECK (progress >= 0.0 AND progress <= 1.0),
    
    -- Job configuration
    keywords TEXT[] NOT NULL,
    locale TEXT NOT NULL DEFAULT 'en-US',
    algorithm TEXT NOT NULL DEFAULT 'kmeans' CHECK (algorithm IN ('kmeans', 'dbscan', 'hierarchical')),
    max_questions_per_keyword INTEGER DEFAULT 10,
    time_range TEXT, -- e.g., '3m', '6m', '1y'
    
    -- Job metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Results metadata
    total_questions INTEGER DEFAULT 0,
    total_clusters INTEGER DEFAULT 0,
    clustering_quality FLOAT,
    success_rate FLOAT, -- Scraping success rate
    
    -- Observability
    logs JSONB DEFAULT '[]'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb
);

-- Questions table - stores scraped PAA questions
CREATE TABLE public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    
    -- Question data
    text TEXT NOT NULL,
    keyword TEXT NOT NULL, -- The seed keyword that generated this question
    locale TEXT NOT NULL,
    
    -- Metadata
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_url TEXT,
    position INTEGER, -- Position in PAA list
    
    -- Embedding for clustering
    embedding vector(1536), -- OpenAI ada-002 embedding dimension
    
    -- Clustering results
    cluster_id UUID,
    cluster_label TEXT,
    confidence FLOAT DEFAULT 0.0,
    
    -- Search metadata
    search_volume INTEGER,
    difficulty_score FLOAT,
    
    UNIQUE(job_id, text) -- Prevent duplicate questions per job
);

-- Clusters table - stores clustering results
CREATE TABLE public.clusters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    
    -- Cluster data
    label TEXT NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    quality FLOAT DEFAULT 0.0, -- Silhouette score or similar
    
    -- Cluster centroid
    centroid vector(1536),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Trend data
    trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable')),
    trend_strength FLOAT DEFAULT 0.0,
    
    UNIQUE(job_id, label)
);

-- Cluster items - many-to-many relationship between clusters and questions
CREATE TABLE public.cluster_items (
    cluster_id UUID REFERENCES public.clusters(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    distance FLOAT DEFAULT 0.0, -- Distance from cluster centroid
    PRIMARY KEY (cluster_id, question_id)
);

-- Trend snapshots - for tracking changes over time
CREATE TABLE public.trend_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    cluster_id UUID REFERENCES public.clusters(id) ON DELETE CASCADE,
    
    -- Snapshot data
    period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    snapshot_date DATE NOT NULL,
    
    -- Metrics
    volume INTEGER DEFAULT 0,
    drift_score FLOAT DEFAULT 0.0, -- How much the cluster has changed
    new_questions INTEGER DEFAULT 0,
    lost_questions INTEGER DEFAULT 0,
    
    -- Trend indicators
    velocity FLOAT DEFAULT 0.0, -- Rate of change
    momentum FLOAT DEFAULT 0.0, -- Acceleration of change
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(job_id, cluster_id, period, snapshot_date)
);

-- Exports table - tracks export jobs
CREATE TABLE public.exports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Export configuration
    format TEXT NOT NULL CHECK (format IN ('csv', 'json', 'xlsx', 'sheets')),
    include_metadata BOOLEAN DEFAULT true,
    
    -- Export status
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    file_url TEXT, -- S3 or Supabase Storage URL
    file_size INTEGER, -- File size in bytes
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    downloaded_at TIMESTAMP WITH TIME ZONE,
    
    error_message TEXT
);

-- API Keys table - for API access
CREATE TABLE public.api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    key_hash TEXT NOT NULL UNIQUE, -- Hashed API key
    name TEXT NOT NULL,
    
    -- Permissions
    scopes TEXT[] DEFAULT ARRAY['read'], -- 'read', 'write', 'admin'
    
    -- Usage tracking
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    rate_limit INTEGER DEFAULT 60, -- Requests per minute
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Webhooks table - for external integrations
CREATE TABLE public.webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- 'job.completed', 'job.failed', etc.
    secret TEXT NOT NULL, -- For webhook signature verification
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Delivery tracking
    last_delivery_at TIMESTAMP WITH TIME ZONE,
    delivery_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

CREATE INDEX idx_questions_job_id ON public.questions(job_id);
CREATE INDEX idx_questions_keyword ON public.questions(keyword);
CREATE INDEX idx_questions_embedding ON public.questions USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_clusters_job_id ON public.clusters(job_id);
CREATE INDEX idx_clusters_quality ON public.clusters(quality DESC);

CREATE INDEX idx_exports_user_id ON public.exports(user_id);
CREATE INDEX idx_exports_status ON public.exports(status);

CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Users can view own jobs" ON public.jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create jobs" ON public.jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON public.jobs
    FOR UPDATE USING (auth.uid() = user_id);

-- Questions policies (inherit from jobs)
CREATE POLICY "Users can view questions from own jobs" ON public.questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE jobs.id = questions.job_id 
            AND jobs.user_id = auth.uid()
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Users can view clusters from own jobs" ON public.clusters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE jobs.id = clusters.job_id 
            AND jobs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own exports" ON public.exports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create exports" ON public.exports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for common operations

-- Function to update job progress
CREATE OR REPLACE FUNCTION update_job_progress(
    job_uuid UUID,
    new_progress FLOAT,
    new_status TEXT DEFAULT NULL,
    log_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.jobs 
    SET 
        progress = new_progress,
        status = COALESCE(new_status, status),
        logs = CASE 
            WHEN log_message IS NOT NULL THEN 
                logs || jsonb_build_object(
                    'timestamp', NOW(),
                    'message', log_message,
                    'progress', new_progress
                )
            ELSE logs
        END,
        updated_at = NOW()
    WHERE id = job_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate clustering quality
CREATE OR REPLACE FUNCTION calculate_clustering_quality(job_uuid UUID)
RETURNS FLOAT AS $$
DECLARE
    avg_quality FLOAT;
BEGIN
    SELECT AVG(quality) INTO avg_quality
    FROM public.clusters
    WHERE job_id = job_uuid;
    
    RETURN COALESCE(avg_quality, 0.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user usage
CREATE OR REPLACE FUNCTION increment_user_usage(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET 
        usage_current = usage_current + 1,
        updated_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Update job clustering quality when clusters change
CREATE OR REPLACE FUNCTION update_job_clustering_quality()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.jobs 
    SET clustering_quality = calculate_clustering_quality(NEW.job_id)
    WHERE id = NEW.job_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_clustering_quality
    AFTER INSERT OR UPDATE ON public.clusters
    FOR EACH ROW
    EXECUTE FUNCTION update_job_clustering_quality();

-- Update cluster size when questions are assigned
CREATE OR REPLACE FUNCTION update_cluster_size()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.clusters 
        SET size = size + 1
        WHERE id = NEW.cluster_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.clusters 
        SET size = size - 1
        WHERE id = OLD.cluster_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cluster_size
    AFTER INSERT OR DELETE ON public.cluster_items
    FOR EACH ROW
    EXECUTE FUNCTION update_cluster_size();

-- Views for common queries

-- Job summary view
CREATE VIEW job_summary AS
SELECT 
    j.id,
    j.user_id,
    j.status,
    j.progress,
    j.keywords,
    j.locale,
    j.created_at,
    j.finished_at,
    j.total_questions,
    j.total_clusters,
    j.clustering_quality,
    j.success_rate,
    u.email as user_email,
    u.plan as user_plan
FROM public.jobs j
JOIN public.users u ON j.user_id = u.id;

-- Cluster analysis view
CREATE VIEW cluster_analysis AS
SELECT 
    c.id,
    c.job_id,
    c.label,
    c.size,
    c.quality,
    c.trend_direction,
    c.trend_strength,
    j.keywords as job_keywords,
    j.locale as job_locale,
    COUNT(ci.question_id) as actual_size
FROM public.clusters c
JOIN public.jobs j ON c.job_id = j.id
LEFT JOIN public.cluster_items ci ON c.id = ci.cluster_id
GROUP BY c.id, j.id;

-- User analytics view
CREATE VIEW user_analytics AS
SELECT 
    u.id,
    u.email,
    u.plan,
    u.usage_current,
    u.usage_quota,
    COUNT(j.id) as total_jobs,
    COUNT(CASE WHEN j.status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN j.status = 'failed' THEN 1 END) as failed_jobs,
    AVG(j.clustering_quality) as avg_clustering_quality,
    MAX(j.created_at) as last_job_at
FROM public.users u
LEFT JOIN public.jobs j ON u.id = j.user_id
GROUP BY u.id;

-- Insert default data

-- Create a demo user (for development)
INSERT INTO public.users (id, email, full_name, plan, usage_quota)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'demo@voidseo.dev',
    'Demo User',
    'free',
    10
) ON CONFLICT (id) DO NOTHING;

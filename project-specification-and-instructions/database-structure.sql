-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    clerk_id VARCHAR(255) NOT NULL,
     role VARCHAR(20) NOT NULL DEFAULT 'User' CHECK (role IN ('Admin', 'Global Editor', 'User')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_clerk_id_unique UNIQUE (clerk_id)
);

-- Create folders table
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    father_id UUID,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    CONSTRAINT folders_father_id_fk 
        FOREIGN KEY (father_id) 
        REFERENCES folders(id) 
        ON DELETE RESTRICT,
    CONSTRAINT folders_created_by_fk 
        FOREIGN KEY (created_by) 
        REFERENCES users(id) 
        ON DELETE RESTRICT
);

-- Create folder_permissions table
CREATE TABLE folder_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID NOT NULL,
    user_id UUID NOT NULL,
    permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('editor', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID NOT NULL,
    CONSTRAINT folder_permissions_folder_id_fk 
        FOREIGN KEY (folder_id) 
        REFERENCES folders(id) 
        ON DELETE CASCADE,
    CONSTRAINT folder_permissions_user_id_fk 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT folder_permissions_granted_by_fk 
        FOREIGN KEY (granted_by) 
        REFERENCES users(id) 
        ON DELETE RESTRICT,
    CONSTRAINT folder_permissions_unique 
        UNIQUE (folder_id, user_id)
);

-- Create videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    s3_key VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    duration_seconds INTEGER,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT videos_folder_id_fk 
        FOREIGN KEY (folder_id) 
        REFERENCES folders(id) 
        ON DELETE RESTRICT,
    CONSTRAINT videos_created_by_fk 
        FOREIGN KEY (created_by) 
        REFERENCES users(id) 
        ON DELETE RESTRICT
);

-- Create video_views table
CREATE TABLE video_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL,
    user_id UUID NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    watch_duration_seconds INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT video_views_video_id_fk 
        FOREIGN KEY (video_id) 
        REFERENCES videos(id) 
        ON DELETE CASCADE,
    CONSTRAINT video_views_user_id_fk 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_folders_father_folder_id ON folders(father_id);
CREATE INDEX idx_folders_created_by_user_id ON folders(created_by);
CREATE INDEX idx_folder_permissions_folder_id ON folder_permissions(folder_id);
CREATE INDEX idx_folder_permissions_user_id ON folder_permissions(user_id);
CREATE INDEX idx_folder_permissions_granted_by ON folder_permissions(granted_by);
CREATE INDEX idx_videos_folder_id ON videos(folder_id);
CREATE INDEX idx_videos_created_by_user_id ON videos(created_by);
CREATE INDEX idx_video_views_video_id ON video_views(video_id);
CREATE INDEX idx_video_views_user_id ON video_views(user_id);
CREATE INDEX idx_video_views_viewed_at ON video_views(viewed_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folder_permissions_updated_at
    BEFORE UPDATE ON folder_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add table comments
COMMENT ON TABLE users IS 'Stores user information including authentication details and role';
COMMENT ON TABLE folders IS 'Stores folder information for organizing videos with support for hierarchical structure';
COMMENT ON TABLE folder_permissions IS 'Stores user permissions for folders (editor or viewer access)';
COMMENT ON TABLE videos IS 'Stores video metadata and references to S3 storage';
COMMENT ON TABLE video_views IS 'Tracks video viewing history and progress';

-- Add column comments for key fields
COMMENT ON COLUMN users.role IS 'User role: admin or collaborator';
COMMENT ON COLUMN folders.father_id IS 'Self-referencing key for folder hierarchy. NULL means root folder';
COMMENT ON COLUMN folder_permissions.permission_type IS 'Type of permission: editor or viewer';
COMMENT ON COLUMN folder_permissions.granted_by IS 'User who granted this permission';
COMMENT ON COLUMN videos.s3_key IS 'AWS S3 storage key for the video file';
COMMENT ON COLUMN video_views.watch_duration_seconds IS 'Duration watched in seconds';
COMMENT ON COLUMN video_views.completed IS 'Indicates if the video was watched to completion';

-- Create function to check folder permission recursively
CREATE OR REPLACE FUNCTION check_folder_permission(
    p_user_id UUID,
    p_folder_id UUID,
    p_required_permission VARCHAR(20)
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_folder_id UUID;
    v_permission_exists BOOLEAN;
BEGIN
    v_current_folder_id := p_folder_id;
    
    WHILE v_current_folder_id IS NOT NULL LOOP
        -- Check if user has required permission in current folder
        SELECT EXISTS (
            SELECT 1 
            FROM folder_permissions 
            WHERE folder_id = v_current_folder_id 
            AND user_id = p_user_id 
            AND permission_type = p_required_permission
        ) INTO v_permission_exists;
        
        -- If permission found, return true
        IF v_permission_exists THEN
            RETURN true;
        END IF;
        
        -- Move to parent folder
        SELECT father_id 
        FROM folders 
        WHERE id = v_current_folder_id 
        INTO v_current_folder_id;
    END LOOP;
    
    -- If no permission found in hierarchy, return false
    RETURN false;
END;
$$ LANGUAGE plpgsql;
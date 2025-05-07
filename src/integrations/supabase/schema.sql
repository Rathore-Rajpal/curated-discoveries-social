-- Create curations table
CREATE TABLE IF NOT EXISTS curations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create curation_items table
CREATE TABLE IF NOT EXISTS curation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curation_id UUID REFERENCES curations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    external_url TEXT,
    image_url TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    curation_id UUID REFERENCES curations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, curation_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    curation_id UUID REFERENCES curations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(follower_id, following_id)
);

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    curation_id UUID REFERENCES curations(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE curations ENABLE ROW LEVEL SECURITY;
ALTER TABLE curation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Create or replace policies for curations
DROP POLICY IF EXISTS "Public curations are viewable by everyone" ON curations;
CREATE POLICY "Public curations are viewable by everyone"
    ON curations FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own curations" ON curations;
CREATE POLICY "Users can insert their own curations"
    ON curations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own curations" ON curations;
CREATE POLICY "Users can update their own curations"
    ON curations FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own curations" ON curations;
CREATE POLICY "Users can delete their own curations"
    ON curations FOR DELETE
    USING (auth.uid() = user_id);

-- Create or replace policies for curation_items
DROP POLICY IF EXISTS "Public curation items are viewable by everyone" ON curation_items;
CREATE POLICY "Public curation items are viewable by everyone"
    ON curation_items FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert items to their own curations" ON curation_items;
CREATE POLICY "Users can insert items to their own curations"
    ON curation_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM curations
            WHERE curations.id = curation_items.curation_id
            AND curations.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update items in their own curations" ON curation_items;
CREATE POLICY "Users can update items in their own curations"
    ON curation_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM curations
            WHERE curations.id = curation_items.curation_id
            AND curations.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete items from their own curations" ON curation_items;
CREATE POLICY "Users can delete items from their own curations"
    ON curation_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM curations
            WHERE curations.id = curation_items.curation_id
            AND curations.user_id = auth.uid()
        )
    );

-- Create or replace policies for likes
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
CREATE POLICY "Users can view all likes"
    ON likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can like curations" ON likes;
CREATE POLICY "Users can like curations"
    ON likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their own likes" ON likes;
CREATE POLICY "Users can unlike their own likes"
    ON likes FOR DELETE
    USING (auth.uid() = user_id);

-- Create or replace policies for comments
DROP POLICY IF EXISTS "Users can view all comments" ON comments;
CREATE POLICY "Users can view all comments"
    ON comments FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    USING (auth.uid() = user_id);

-- Create or replace policies for follows
DROP POLICY IF EXISTS "Users can view all follows" ON follows;
CREATE POLICY "Users can view all follows"
    ON follows FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others"
    ON follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow others" ON follows;
CREATE POLICY "Users can unfollow others"
    ON follows FOR DELETE
    USING (auth.uid() = follower_id);

-- Create or replace policies for shares
DROP POLICY IF EXISTS "Users can view all shares" ON shares;
CREATE POLICY "Users can view all shares"
    ON shares FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can share curations" ON shares;
CREATE POLICY "Users can share curations"
    ON shares FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create or replace indexes for better performance
DROP INDEX IF EXISTS idx_likes_user_id;
CREATE INDEX idx_likes_user_id ON likes(user_id);

DROP INDEX IF EXISTS idx_likes_curation_id;
CREATE INDEX idx_likes_curation_id ON likes(curation_id);

DROP INDEX IF EXISTS idx_comments_user_id;
CREATE INDEX idx_comments_user_id ON comments(user_id);

DROP INDEX IF EXISTS idx_comments_curation_id;
CREATE INDEX idx_comments_curation_id ON comments(curation_id);

DROP INDEX IF EXISTS idx_follows_follower_id;
CREATE INDEX idx_follows_follower_id ON follows(follower_id);

DROP INDEX IF EXISTS idx_follows_following_id;
CREATE INDEX idx_follows_following_id ON follows(following_id);

DROP INDEX IF EXISTS idx_shares_user_id;
CREATE INDEX idx_shares_user_id ON shares(user_id);

DROP INDEX IF EXISTS idx_shares_curation_id;
CREATE INDEX idx_shares_curation_id ON shares(curation_id); 
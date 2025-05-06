-- Create curations table
CREATE TABLE curations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create curation_items table
CREATE TABLE curation_items (
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

-- Enable Row Level Security
ALTER TABLE curations ENABLE ROW LEVEL SECURITY;
ALTER TABLE curation_items ENABLE ROW LEVEL SECURITY;

-- Create policies for curations
CREATE POLICY "Public curations are viewable by everyone"
    ON curations FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own curations"
    ON curations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own curations"
    ON curations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own curations"
    ON curations FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for curation_items
CREATE POLICY "Public curation items are viewable by everyone"
    ON curation_items FOR SELECT
    USING (true);

CREATE POLICY "Users can insert items to their own curations"
    ON curation_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM curations
            WHERE curations.id = curation_items.curation_id
            AND curations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items in their own curations"
    ON curation_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM curations
            WHERE curations.id = curation_items.curation_id
            AND curations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items from their own curations"
    ON curation_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM curations
            WHERE curations.id = curation_items.curation_id
            AND curations.user_id = auth.uid()
        )
    ); 
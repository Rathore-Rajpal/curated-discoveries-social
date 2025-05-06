import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { CurationItem } from "@/components/curations/CurationItem";
import { AddItemForm } from "@/components/curations/AddItemForm";
import { Heart, MessageCircle, Share2, Bookmark, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CurationItem {
  id: string;
  title: string;
  description: string | null;
  external_url: string | null;
  image_url: string | null;
  position: number;
}

interface Curation {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  user_id: string;
  author: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  items: CurationItem[];
}

const CurationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [curation, setCuration] = useState<Curation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchCuration = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch curation details
        const { data: curationData, error: curationError } = await supabase
          .from('curations')
          .select(`
            *,
            profiles!curations_user_id_fkey (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (curationError) throw curationError;

        // Fetch items
        const { data: itemsData, error: itemsError } = await supabase
          .from('curation_items')
          .select('*')
          .eq('curation_id', id)
          .order('position', { ascending: true });

        if (itemsError) throw itemsError;

        setCuration({
          ...curationData,
          author: curationData.profiles,
          items: itemsData
        });

        setIsOwner(user?.id === curationData.user_id);
      } catch (error) {
        console.error('Error fetching curation:', error);
        toast.error('Failed to load curation');
      } finally {
        setLoading(false);
      }
    };

    fetchCuration();
  }, [id, user]);

  const handleItemAdded = async () => {
    if (!id) return;

    try {
      // Fetch updated items
      const { data: itemsData, error: itemsError } = await supabase
        .from('curation_items')
        .select('*')
        .eq('curation_id', id)
        .order('position', { ascending: true });

      if (itemsError) throw itemsError;

      setCuration(prev => prev ? { ...prev, items: itemsData } : null);
      setShowAddItemForm(false);
    } catch (error) {
      console.error('Error refreshing items:', error);
      toast.error('Failed to refresh items');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </MainLayout>
    );
  }

  if (!curation) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold">Curation not found</h1>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <div className="h-2 bg-brand-purple"></div>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Link to={`/profile/${curation.author.username}`} className="flex items-center gap-3">
                <Avatar>
                  {curation.author.avatar_url ? (
                    <AvatarImage src={curation.author.avatar_url} />
                  ) : (
                    <AvatarFallback>
                      {curation.author.full_name?.[0] || curation.author.username[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">
                    {curation.author.full_name || curation.author.username}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    @{curation.author.username}
                  </div>
                </div>
              </Link>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h1 className="text-2xl font-bold">{curation.title}</h1>
            {curation.description && (
              <p className="text-muted-foreground mt-2">{curation.description}</p>
            )}
          </CardHeader>
        </Card>

        {isOwner && (
          <div className="mb-8">
            {showAddItemForm ? (
              <AddItemForm 
                curationId={curation.id} 
                onItemAdded={handleItemAdded} 
              />
            ) : (
              <Button 
                onClick={() => setShowAddItemForm(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>
        )}

        <div className="space-y-4">
          {curation.items.map((item) => (
            <CurationItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default CurationDetailPage;

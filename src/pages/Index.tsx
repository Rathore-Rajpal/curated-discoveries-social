import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CurationCard } from "@/components/curations/CurationCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Curation {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  author: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  items_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface SupabaseCuration {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  created_at: string;
  author: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  items: { count: number }[];
  likes: { count: number }[];
  comments: { count: number }[];
}

const colorVariants = ["blue", "purple", "green", "orange", "pink"] as const;

export default function Index() {
  const [curations, setCurations] = useState<Curation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("trending");
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCurations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('curations')
        .select(`
          id,
          title,
          description,
          cover_image,
          created_at,
          author:profiles!curations_user_id_fkey (
            username,
            full_name,
            avatar_url
          ),
          items:curation_items(count),
          likes:likes(count),
          comments:comments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data) {
        setCurations([]);
        return;
      }

      const formattedCurations = (data as unknown as SupabaseCuration[]).map((curation) => ({
        id: curation.id,
        title: curation.title,
        description: curation.description,
        cover_image: curation.cover_image,
        author: {
          username: curation.author.username,
          full_name: curation.author.full_name,
          avatar_url: curation.author.avatar_url
        },
        items_count: curation.items?.[0]?.count || 0,
        likes_count: curation.likes?.[0]?.count || 0,
        comments_count: curation.comments?.[0]?.count || 0,
        created_at: curation.created_at
      }));

      setCurations(formattedCurations);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch curations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurations();
  }, [activeTab]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          <span className="ml-2">Loading curations...</span>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchCurations}>Try Again</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Discover Curations</h1>
          {user ? (
            <Button onClick={() => navigate('/create')}>Create Curation</Button>
          ) : (
            <div className="space-x-4">
              <Button variant="outline" onClick={() => navigate('/login')}>Log In</Button>
              <Button onClick={() => navigate('/signup')}>Sign Up</Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="trending" onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="trending">
            {curations.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No curations found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curations.map((curation, index) => (
                  <CurationCard
                    key={curation.id}
                    id={curation.id}
                    title={curation.title}
                    description={curation.description}
                    imageUrl={curation.cover_image}
                    author={{
                      username: curation.author.username,
                      fullName: curation.author.full_name || curation.author.username,
                      avatarUrl: curation.author.avatar_url
                    }}
                    createdAt={curation.created_at}
                    likesCount={curation.likes_count}
                    commentsCount={curation.comments_count}
                    colorVariant={colorVariants[index % colorVariants.length]}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular">
            {curations.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No curations found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curations.map((curation, index) => (
                  <CurationCard
                    key={curation.id}
                    id={curation.id}
                    title={curation.title}
                    description={curation.description}
                    imageUrl={curation.cover_image}
                    author={{
                      username: curation.author.username,
                      fullName: curation.author.full_name || curation.author.username,
                      avatarUrl: curation.author.avatar_url
                    }}
                    createdAt={curation.created_at}
                    likesCount={curation.likes_count}
                    commentsCount={curation.comments_count}
                    colorVariant={colorVariants[index % colorVariants.length]}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent">
            {curations.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No curations found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curations.map((curation, index) => (
                  <CurationCard
                    key={curation.id}
                    id={curation.id}
                    title={curation.title}
                    description={curation.description}
                    imageUrl={curation.cover_image}
                    author={{
                      username: curation.author.username,
                      fullName: curation.author.full_name || curation.author.username,
                      avatarUrl: curation.author.avatar_url
                    }}
                    createdAt={curation.created_at}
                    likesCount={curation.likes_count}
                    commentsCount={curation.comments_count}
                    colorVariant={colorVariants[index % colorVariants.length]}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { UserProfileHeader } from "@/components/user/UserProfileHeader";
import { CurationCard } from "@/components/curations/CurationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, PlusSquare } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
}

interface ProfileStats {
  followersCount: number;
  followingCount: number;
  curationsCount: number;
  likesCount: number;
}

interface Curation {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  author: {
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  likesCount: number;
  commentsCount: number;
}

const colorVariants = ["blue", "purple", "green", "orange", "pink"] as const;

export function ProfilePage() {
  const { user } = useAuth();
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [curations, setCurations] = useState<Curation[]>([]);
  const [likedCurations, setLikedCurations] = useState<Curation[]>([]);
  const [savedCurations, setSavedCurations] = useState<Curation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('curations');
  const [isFollowing, setIsFollowing] = useState(false);

  const isCurrentUser = useMemo(() => user?.id === profile?.id, [user?.id, profile?.id]);

  const formatCuration = (curation: any): Curation => ({
    id: curation.id,
    title: curation.title,
    description: curation.description,
    imageUrl: curation.image_url,
    createdAt: curation.created_at,
    author: {
      username: curation.profiles?.username || '',
      fullName: curation.profiles?.full_name || null,
      avatarUrl: curation.profiles?.avatar_url || null
    },
    likesCount: curation.likes_count || 0,
    commentsCount: curation.comments_count || 0
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's curations
        const { data: curationsData, error: curationsError } = await supabase
          .from('curations')
          .select(`
            *,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (curationsError) throw curationsError;

        const formattedCurations = curationsData.map(formatCuration);
        setCurations(formattedCurations);

        // Fetch liked curations
        const { data: likedData, error: likedError } = await supabase
          .from('likes')
          .select(`
            curation_id,
            curations (
              *,
              profiles:user_id (
                username,
                full_name,
                avatar_url
              )
            )
          `)
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (likedError) throw likedError;

        const formattedLikedCurations = likedData
          .map(item => formatCuration(item.curations))
          .filter(Boolean);
        setLikedCurations(formattedLikedCurations);

        // Fetch saved curations only if viewing own profile
        if (user?.id === profileData.id) {
          const { data: userSavedData, error: userSavedError } = await supabase
            .from('saved_curations')
            .select(`
              curation_id,
              curations (
                *,
                profiles:user_id (
                  username,
                  full_name,
                  avatar_url
                )
              )
            `)
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false });

          if (userSavedError) throw userSavedError;

          const formattedSavedCurations = userSavedData
            .map(item => formatCuration(item.curations))
            .filter(Boolean);
          setSavedCurations(formattedSavedCurations);
        }

        // Fetch stats
        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profileData.id);

        const { count: followingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profileData.id);

        const { count: curationsCount } = await supabase
          .from('curations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profileData.id);

        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profileData.id);

        setStats({
          followersCount: followersCount || 0,
          followingCount: followingCount || 0,
          curationsCount: curationsCount || 0,
          likesCount: likesCount || 0
        });

        // Check if the current user is following this profile
        if (user) {
          const { data: followData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', profileData.id)
            .single();
          
          setIsFollowing(!!followData);
        }
      } catch (err: any) {
        console.error('Error fetching profile data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username, user]);

  const renderCurations = (curations: Curation[], emptyMessage: string) => {
    if (curations.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {curations.map(curation => (
          <CurationCard
            key={curation.id}
            id={curation.id}
            title={curation.title}
            description={curation.description}
            imageUrl={curation.imageUrl}
            author={curation.author}
            createdAt={curation.createdAt}
            likesCount={curation.likesCount}
            commentsCount={curation.commentsCount}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground mt-2">
            The user you're looking for doesn't exist or you don't have permission to view this profile.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <UserProfileHeader 
          user={{
            id: profile.id,
            name: profile.full_name || profile.username,
            username: profile.username,
            bio: profile.bio || undefined,
            avatarUrl: profile.avatar_url || undefined,
            coverUrl: profile.cover_url || undefined,
            isCurrentUser
          }} 
          stats={stats || { followersCount: 0, followingCount: 0, curationsCount: 0, likesCount: 0 }} 
        />
        
        {isCurrentUser && (
          <div className="flex justify-end">
            <Link to="/create">
              <Button className="flex items-center gap-2">
                <PlusSquare className="h-4 w-4" />
                Create Curation
              </Button>
            </Link>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full border-b rounded-none">
            <TabsTrigger value="curations" className="flex-1">Curations</TabsTrigger>
            {isCurrentUser && <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>}
            <TabsTrigger value="liked" className="flex-1">Liked</TabsTrigger>
          </TabsList>
          
          <TabsContent value="curations" className="animate-enter pt-6">
            {renderCurations(
              curations,
              isCurrentUser 
                ? "You haven't created any curations yet."
                : `${profile.username} hasn't created any curations yet.`
            )}
          </TabsContent>
          
          {isCurrentUser && (
            <TabsContent value="saved" className="animate-enter pt-6">
              {renderCurations(
                savedCurations,
                "You haven't saved any curations yet."
              )}
            </TabsContent>
          )}
          
          <TabsContent value="liked" className="animate-enter pt-6">
            {renderCurations(
              likedCurations,
              isCurrentUser 
                ? "You haven't liked any curations yet."
                : `${profile.username} hasn't liked any curations yet.`
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default ProfilePage;

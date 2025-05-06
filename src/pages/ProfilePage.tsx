import React, { useEffect, useState } from "react";
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
}

interface Curation {
  id: string;
  title: string;
  description: string | null;
  itemCount: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  likesCount: number;
  commentsCount: number;
  colorVariant: "blue" | "purple" | "green" | "orange" | "pink";
}

const colorVariants = ["blue", "purple", "green", "orange", "pink"] as const;

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user, userProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    followersCount: 0,
    followingCount: 0,
    curationsCount: 0
  });
  const [curations, setCurations] = useState<Curation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!username) {
          setError('No username provided');
          return;
        }

        console.log('Fetching profile for username:', username);

        // If viewing own profile and we have userProfile data
        if (userProfile && (username === userProfile.username || username === 'me')) {
          console.log('Using current user profile data');
          setProfile({
            id: userProfile.id,
            username: userProfile.username,
            full_name: userProfile.full_name,
            avatar_url: userProfile.avatar_url,
            cover_url: userProfile.cover_url,
            bio: userProfile.bio
          });
          setIsCurrentUser(true);
          await fetchProfileData(userProfile.id);
        } else {
          // Fetch other user's profile
          console.log('Fetching other user profile');
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            setError(error.message);
            return;
          }

          if (!data) {
            setError('Profile not found');
            return;
          }

          console.log('Fetched profile:', data);
          setProfile(data as unknown as Profile);
          setIsCurrentUser(user?.id === data.id);
          
          // Check if the current user is following this profile
          if (user) {
            const { data: followData } = await supabase
              .from('follows')
              .select('*')
              .eq('follower_id', user.id)
              .eq('following_id', data.id)
              .single();
            
            setIsFollowing(!!followData);
          }

          await fetchProfileData(data.id);
        }
      } catch (error: any) {
        console.error('Error in profile page:', error);
        setError(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    const fetchProfileData = async (profileId: string) => {
      try {
        console.log('Fetching profile data for user:', profileId);
        
        // Fetch followers count
        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profileId);

        // Fetch following count
        const { count: followingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profileId);

        // Fetch curations
        const { data: curationsData, error: curationsError } = await supabase
          .from('curations')
          .select(`
            id, 
            title, 
            description,
            cover_image,
            created_at,
            items:curation_items(count),
            likes:likes(count),
            comments:comments(count)
          `)
          .eq('user_id', profileId)
          .order('created_at', { ascending: false });

        if (curationsError) {
          console.error('Error fetching curations:', curationsError);
          setError(curationsError.message);
          return;
        }

        console.log('Fetched curations:', curationsData);

        setStats({
          followersCount: followersCount || 0,
          followingCount: followingCount || 0,
          curationsCount: curationsData?.length || 0
        });

        const formattedCurations = curationsData?.map((curation: any, index: number) => ({
          id: curation.id,
          title: curation.title,
          description: curation.description,
          itemCount: curation.items[0]?.count || 0,
          author: {
            id: profileId,
            name: profile?.full_name || profile?.username || '',
            username: profile?.username || '',
            avatarUrl: profile?.avatar_url
          },
          likesCount: curation.likes?.[0]?.count || 0,
          commentsCount: curation.comments?.[0]?.count || 0,
          colorVariant: colorVariants[index % colorVariants.length]
        })) || [];

        setCurations(formattedCurations);
      } catch (error: any) {
        console.error('Error fetching profile data:', error);
        setError(error.message || 'Failed to load profile data');
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, user, userProfile]);

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
            isCurrentUser,
            isFollowing,
          }} 
          stats={stats} 
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
        
        <Tabs defaultValue="curations" className="w-full">
          <TabsList className="w-full border-b rounded-none">
            <TabsTrigger value="curations" className="flex-1">Curations</TabsTrigger>
            <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
            <TabsTrigger value="liked" className="flex-1">Liked</TabsTrigger>
          </TabsList>
          
          <TabsContent value="curations" className="animate-enter pt-6">
            {curations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curations.map((curation) => (
                  <CurationCard key={curation.id} {...curation} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isCurrentUser ? (
                  <div className="space-y-4">
                    <p>You haven't created any curations yet.</p>
                    <Link to="/create">
                      <Button variant="outline" className="flex items-center gap-2">
                        <PlusSquare className="h-4 w-4" />
                        Create your first curation
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p>No curations yet.</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="animate-enter pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>No saved curations yet.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="liked" className="animate-enter pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>No liked curations yet.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;

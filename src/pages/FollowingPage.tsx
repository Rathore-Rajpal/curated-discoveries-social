import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { FollowButton } from "@/components/social/FollowButton";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Following {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function FollowingPage() {
  const { username } = useParams<{ username: string }>();
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get the user's ID from their username
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();

        if (userError) throw userError;
        if (!userData) throw new Error('User not found');

        // Then get who they're following
        const { data: followingData, error: followingError } = await supabase
          .from('follows')
          .select(`
            following:profiles!follows_following_id_fkey (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('follower_id', userData.id);

        if (followingError) throw followingError;

        setFollowing(followingData.map((f: any) => f.following));
      } catch (error: any) {
        console.error('Error fetching following:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchFollowing();
    }
  }, [username]);

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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Following</h1>
        <div className="space-y-4">
          {following.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Not following anyone yet
            </p>
          ) : (
            following.map((user) => (
              <Card key={user.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <Link 
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.full_name || user.username}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </Link>
                  <FollowButton userId={user.id} />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
} 
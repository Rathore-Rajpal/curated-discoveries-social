import React, { useState, useEffect } from 'react';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from './FollowButton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface UserProfileProps {
  userId: string;
}

interface UserStats {
  followersCount: number;
  followingCount: number;
  curationsCount: number;
  likesCount: number;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user: currentUser } = useAuth();
  const { getUserStats } = useSocial();
  const [stats, setStats] = useState<UserStats>({
    followersCount: 0,
    followingCount: 0,
    curationsCount: 0,
    likesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [userId]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const userStats = await getUserStats(userId);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={currentUser?.avatar_url} />
          <AvatarFallback>
            {currentUser?.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{currentUser?.username}</h2>
          {currentUser?.id !== userId && (
            <FollowButton userId={userId} onFollowChange={loadUserStats} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{stats.curationsCount}</div>
            <div className="text-sm text-muted-foreground">Curations</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.followersCount}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.followingCount}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.likesCount}</div>
            <div className="text-sm text-muted-foreground">Likes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  onFollowChange?: (following: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialFollowing = false,
  onFollowChange,
}) => {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing } = useSocial();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (user) {
        try {
          setCheckingStatus(true);
          const isFollowingUser = await isFollowing(userId);
          setFollowing(isFollowingUser);
        } catch (error) {
          console.error('Error checking follow status:', error);
          toast.error('Failed to check follow status');
        } finally {
          setCheckingStatus(false);
        }
      }
    };
    checkFollowStatus();
  }, [user, userId, isFollowing]);

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please log in to follow users');
      return;
    }

    try {
      setLoading(true);
      if (following) {
        await unfollowUser(userId);
        toast.success('Unfollowed successfully');
      } else {
        await followUser(userId);
        toast.success('Followed successfully');
      }
      setFollowing(!following);
      onFollowChange?.(!following);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === userId) {
    return null;
  }

  if (checkingStatus) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={following ? 'outline' : 'default'}
      size="sm"
      onClick={handleFollow}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        'Unfollow'
      ) : (
        'Follow'
      )}
    </Button>
  );
}; 
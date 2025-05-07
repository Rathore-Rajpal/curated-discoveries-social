import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SocialContextType {
  likeCuration: (curationId: string) => Promise<void>;
  unlikeCuration: (curationId: string) => Promise<void>;
  addComment: (curationId: string, content: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  shareCuration: (curationId: string, platform: string) => Promise<void>;
  isLiked: (curationId: string) => Promise<boolean>;
  isFollowing: (userId: string) => Promise<boolean>;
  getComments: (curationId: string) => Promise<any[]>;
  getUserStats: (userId: string) => Promise<{
    followersCount: number;
    followingCount: number;
    curationsCount: number;
    likesCount: number;
  }>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const likeCuration = async (curationId: string) => {
    if (!user) {
      toast.error('Please log in to like curations');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: user.id, curation_id: curationId });

      if (error) throw error;
      toast.success('Liked successfully');
    } catch (error: any) {
      console.error('Error liking curation:', error);
      toast.error(error.message || 'Failed to like curation');
    } finally {
      setLoading(false);
    }
  };

  const unlikeCuration = async (curationId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ user_id: user.id, curation_id: curationId });

      if (error) throw error;
      toast.success('Unliked successfully');
    } catch (error: any) {
      console.error('Error unliking curation:', error);
      toast.error(error.message || 'Failed to unlike curation');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (curationId: string, content: string) => {
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          curation_id: curationId,
          content: content.trim(),
        });

      if (error) throw error;
      toast.success('Comment added successfully');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('comments')
        .update({ content: content.trim(), updated_at: new Date().toISOString() })
        .match({ id: commentId, user_id: user.id });

      if (error) throw error;
      toast.success('Comment updated successfully');
    } catch (error: any) {
      console.error('Error updating comment:', error);
      toast.error(error.message || 'Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('comments')
        .delete()
        .match({ id: commentId, user_id: user.id });

      if (error) throw error;
      toast.success('Comment deleted successfully');
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast.error(error.message || 'Failed to delete comment');
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    if (!user) {
      toast.error('Please log in to follow users');
      return;
    }

    if (user.id === userId) {
      toast.error('You cannot follow yourself');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: userId });

      if (error) throw error;
      toast.success('Followed successfully');
    } catch (error: any) {
      console.error('Error following user:', error);
      toast.error(error.message || 'Failed to follow user');
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: user.id, following_id: userId });

      if (error) throw error;
      toast.success('Unfollowed successfully');
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast.error(error.message || 'Failed to unfollow user');
    } finally {
      setLoading(false);
    }
  };

  const shareCuration = async (curationId: string, platform: string) => {
    if (!user) {
      toast.error('Please log in to share curations');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('shares')
        .insert({
          user_id: user.id,
          curation_id: curationId,
          platform,
        });

      if (error) throw error;

      // Get the curation URL
      const curationUrl = `${window.location.origin}/curation/${curationId}`;
      
      // Share based on platform
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(curationUrl)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(curationUrl)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(curationUrl)}`, '_blank');
          break;
        default:
          // Copy to clipboard
          await navigator.clipboard.writeText(curationUrl);
          toast.success('Link copied to clipboard');
      }
    } catch (error: any) {
      console.error('Error sharing curation:', error);
      toast.error(error.message || 'Failed to share curation');
    } finally {
      setLoading(false);
    }
  };

  const isLiked = async (curationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .match({ user_id: user.id, curation_id: curationId })
        .single();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  };

  const isFollowing = async (userId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .match({ follower_id: user.id, following_id: userId })
        .single();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };

  const getComments = async (curationId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('curation_id', curationId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const getUserStats = async (userId: string) => {
    try {
      const [
        { count: followersCount },
        { count: followingCount },
        { count: curationsCount },
        { count: likesCount },
      ] = await Promise.all([
        supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
        supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
        supabase.from('curations').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('likes').select('id', { count: 'exact' }).eq('user_id', userId),
      ]);

      return {
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        curationsCount: curationsCount || 0,
        likesCount: likesCount || 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        followersCount: 0,
        followingCount: 0,
        curationsCount: 0,
        likesCount: 0,
      };
    }
  };

  const value = {
    likeCuration,
    unlikeCuration,
    addComment,
    updateComment,
    deleteComment,
    followUser,
    unfollowUser,
    shareCuration,
    isLiked,
    isFollowing,
    getComments,
    getUserStats,
  };

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}; 
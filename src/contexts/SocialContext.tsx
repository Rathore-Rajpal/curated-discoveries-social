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
  saveCuration: (curationId: string) => Promise<void>;
  unsaveCuration: (curationId: string) => Promise<void>;
  isLiked: (curationId: string) => Promise<boolean>;
  isSaved: (curationId: string) => Promise<boolean>;
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

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const likeCuration = async (curationId: string) => {
    if (!user) {
      toast.error('Please log in to like curations');
      return;
    }

    try {
      setLoading(true);
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .match({ user_id: user.id, curation_id: curationId })
        .single();

      if (existingLike) {
        throw new Error('You have already liked this curation');
      }

      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          curation_id: curationId,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error liking curation:', error);
      throw error;
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
    } catch (error: any) {
      console.error('Error unliking curation:', error);
      throw error;
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
    } catch (error: any) {
      console.error('Error adding comment:', error);
      throw error;
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
    } catch (error: any) {
      console.error('Error updating comment:', error);
      throw error;
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
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    if (!user) {
      toast.error('Please log in to follow users');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error following user:', error);
      throw error;
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
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      throw error;
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
      const { data: curation, error } = await supabase
        .from('curations')
        .select('title')
        .eq('id', curationId)
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/curation/${curationId}`;
      const shareText = `Check out this curation: ${curation.title}`;

      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard');
          break;
        default:
          throw new Error('Invalid share platform');
      }
    } catch (error: any) {
      console.error('Error sharing curation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveCuration = async (curationId: string) => {
    if (!user) {
      toast.error('Please log in to save curations');
      return;
    }

    try {
      setLoading(true);
      // Check if already saved
      const { data: existingSave } = await supabase
        .from('saved_curations')
        .select('id')
        .match({ user_id: user.id, curation_id: curationId })
        .single();

      if (existingSave) {
        throw new Error('You have already saved this curation');
      }

      const { error } = await supabase
        .from('saved_curations')
        .insert({
          user_id: user.id,
          curation_id: curationId,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving curation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unsaveCuration = async (curationId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('saved_curations')
        .delete()
        .match({ user_id: user.id, curation_id: curationId });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error unsaving curation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isSaved = async (curationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('saved_curations')
        .select('id')
        .match({ user_id: user.id, curation_id: curationId })
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking save status:', error);
      return false;
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

      if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
        throw error;
      }

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

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

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
    saveCuration,
    unsaveCuration,
    isLiked,
    isSaved,
    isFollowing,
    getComments,
    getUserStats,
  };

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
} 